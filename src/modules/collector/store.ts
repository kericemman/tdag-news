import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import { z } from "zod";
import { connectMongoDB } from "@/lib/mongodb";
import type { StaffActor } from "@/modules/newsroom/policy";
import { normalizeCandidateUrl, type FeedEntry } from "./feed";

const httpUrl = z.url().refine((value) => ["http:", "https:"].includes(new URL(value).protocol));
export const sourceInputSchema = z.object({
  name: z.string().trim().min(2).max(160), url: httpUrl, homepage: httpUrl,
  type: z.enum(["rss", "atom", "manual"]), region: z.string().trim().min(2).max(80),
  topics: z.array(z.string().trim().min(2).max(80)).max(20),
  authority: z.enum(["primary", "trusted_secondary", "specialist_secondary"]),
  intervalMinutes: z.number().int().min(15).max(10080),
  accessNotes: z.string().trim().max(2000).default(""), credentialReference: z.string().trim().max(160).optional(),
});
export type SourceInput = z.infer<typeof sourceInputSchema>;
export type SourceRecord = SourceInput & { id: string; status: "proposed" | "active" | "paused"; createdAt: string; updatedAt: string; approvedBy?: string; nextFetchAt?: string; lastFetchAt?: string; etag?: string; lastModified?: string; failureCount: number };
export type CandidateRecord = { id: string; sourceId: string; externalId: string; canonicalUrl: string; title: string; summary: string; contentHash: string; detectedAt: string; publishedAt?: string; status: "new" | "triaged" | "researching" | "ignored" | "rejected" | "merged"; assignedTo?: string; sourceName: string; sourceAuthority: SourceInput["authority"]; region: string; topics: string[]; verificationState: "unverified"; mediaState: "unknown" };
type FetchRecord = { id: string; sourceId: string; at: string; status: "success" | "not_modified" | "failure"; httpStatus?: number; found: number; inserted: number; error?: string };

async function db() {
  await connectMongoDB();
  if (!mongoose.connection.db) throw new Error("MongoDB unavailable");
  return mongoose.connection.db;
}

let indexPromise: Promise<void> | undefined;
export function ensureCollectorIndexes(): Promise<void> {
  if (!indexPromise) indexPromise = (async () => {
    const database = await db();
    await Promise.all([
      database.collection<SourceRecord>("sources").createIndex({ url: 1 }, { unique: true }),
      database.collection<SourceRecord>("sources").createIndex({ status: 1, nextFetchAt: 1 }),
      database.collection<CandidateRecord>("storyCandidates").createIndex({ sourceId: 1, canonicalUrl: 1 }, { unique: true }),
      database.collection<CandidateRecord>("storyCandidates").createIndex({ status: 1, detectedAt: -1 }),
      database.collection<FetchRecord>("sourceFetches").createIndex({ sourceId: 1, at: -1 }),
    ]);
  })().catch((error: unknown) => { indexPromise = undefined; throw error; });
  return indexPromise;
}

export async function addSource(input: SourceInput, actor: StaffActor): Promise<SourceRecord> {
  if (!actor.active || !["super_admin", "editor", "researcher"].includes(actor.role)) throw new Error("FORBIDDEN");
  await ensureCollectorIndexes();
  const now = new Date().toISOString();
  const source: SourceRecord = { ...sourceInputSchema.parse(input), id: randomUUID(), status: "proposed", createdAt: now, updatedAt: now, failureCount: 0 };
  await (await db()).collection<SourceRecord>("sources").insertOne(source);
  return source;
}

export async function listSources(): Promise<SourceRecord[]> {
  return (await db()).collection<SourceRecord>("sources").find({}).sort({ name: 1 }).limit(200).toArray();
}

export async function getSource(id: string): Promise<SourceRecord | null> {
  return (await db()).collection<SourceRecord>("sources").findOne({ id });
}

export async function setSourceStatus(id: string, status: "active" | "paused", actor: StaffActor): Promise<void> {
  if (!actor.active || !["super_admin", "editor"].includes(actor.role)) throw new Error("FORBIDDEN");
  const database = await db();
  const source = await database.collection<SourceRecord>("sources").findOne({ id });
  if (!source) throw new Error("NOT_FOUND");
  if (status === "active" && source.type !== "manual" && new URL(source.url).protocol !== "https:") throw new Error("HTTPS_FEED_REQUIRED");
  const now = new Date().toISOString();
  await database.collection<SourceRecord>("sources").updateOne({ id }, { $set: { status, updatedAt: now, ...(status === "active" ? { approvedBy: actor.id, nextFetchAt: now } : {}) } });
  await database.collection("collectorAudit").insertOne({ id: randomUUID(), sourceId: id, actorId: actor.id, action: `source_${status}`, at: now });
}

export async function dueSources(limit = 20): Promise<SourceRecord[]> {
  const now = new Date().toISOString();
  return (await db()).collection<SourceRecord>("sources").find({ status: "active", type: { $in: ["rss", "atom"] }, nextFetchAt: { $lte: now } }).sort({ nextFetchAt: 1 }).limit(limit).toArray();
}

export async function storeFeedEntries(source: SourceRecord, entries: FeedEntry[], response: { status: number; etag?: string; lastModified?: string }): Promise<{ inserted: number }> {
  const database = await db();
  const candidates = database.collection<CandidateRecord>("storyCandidates");
  let inserted = 0;
  for (const entry of entries) {
    const candidate: CandidateRecord = { id: randomUUID(), sourceId: source.id, externalId: entry.externalId, canonicalUrl: entry.canonicalUrl, title: entry.title, summary: entry.summary, contentHash: entry.contentHash, detectedAt: new Date().toISOString(), publishedAt: entry.publishedAt, status: "new", sourceName: source.name, sourceAuthority: source.authority, region: source.region, topics: source.topics, verificationState: "unverified", mediaState: "unknown" };
    const result = await candidates.updateOne({ sourceId: source.id, canonicalUrl: entry.canonicalUrl }, { $setOnInsert: candidate }, { upsert: true });
    if (result.upsertedCount) inserted++;
  }
  const now = new Date().toISOString();
  await database.collection<SourceRecord>("sources").updateOne({ id: source.id }, { $set: { lastFetchAt: now, nextFetchAt: new Date(Date.now() + source.intervalMinutes * 60_000).toISOString(), failureCount: 0, ...(response.etag ? { etag: response.etag } : {}), ...(response.lastModified ? { lastModified: response.lastModified } : {}) } });
  await database.collection<FetchRecord>("sourceFetches").insertOne({ id: randomUUID(), sourceId: source.id, at: now, status: response.status === 304 ? "not_modified" : "success", httpStatus: response.status, found: entries.length, inserted });
  return { inserted };
}

export async function recordFetchFailure(source: SourceRecord, error: string, httpStatus?: number): Promise<void> {
  const database = await db();
  const count = source.failureCount + 1;
  const now = new Date().toISOString();
  const delay = Math.min(24 * 60, source.intervalMinutes * Math.pow(2, Math.min(count, 5)));
  await database.collection<SourceRecord>("sources").updateOne({ id: source.id }, { $set: { lastFetchAt: now, nextFetchAt: new Date(Date.now() + delay * 60_000).toISOString(), failureCount: count } });
  await database.collection<FetchRecord>("sourceFetches").insertOne({ id: randomUUID(), sourceId: source.id, at: now, status: "failure", httpStatus, found: 0, inserted: 0, error: error.slice(0, 500) });
}

export async function listCandidates(status: CandidateRecord["status"] = "new", limit = 50): Promise<CandidateRecord[]> {
  return (await db()).collection<CandidateRecord>("storyCandidates").find({ status }).sort({ detectedAt: -1 }).limit(Math.min(limit, 100)).toArray();
}

export async function setCandidateStatus(id: string, expectedStatus: CandidateRecord["status"], status: CandidateRecord["status"], actor: StaffActor): Promise<void> {
  if (!actor.active || !["super_admin", "editor", "researcher"].includes(actor.role)) throw new Error("FORBIDDEN");
  if (["rejected", "merged", "ignored"].includes(status) && actor.role === "researcher") throw new Error("FORBIDDEN");
  if (expectedStatus === status || status === "new") throw new Error("INVALID_STATUS");
  const database = await db();
  const result = await database.collection<CandidateRecord>("storyCandidates").updateOne({ id, status: expectedStatus }, { $set: { status, assignedTo: actor.id } });
  if (!result.matchedCount) throw new Error("REVISION_CONFLICT");
  await database.collection("collectorAudit").insertOne({ id: randomUUID(), candidateId: id, actorId: actor.id, action: `candidate_${status}`, at: new Date().toISOString() });
}

export async function listFetches(sourceId: string, limit = 20): Promise<FetchRecord[]> {
  return (await db()).collection<FetchRecord>("sourceFetches").find({ sourceId }).sort({ at: -1 }).limit(Math.min(limit, 100)).toArray();
}

export async function addManualCandidate(source: SourceRecord, url: string, title: string, actor: StaffActor): Promise<CandidateRecord> {
  if (!actor.active || !["super_admin", "editor", "researcher"].includes(actor.role)) throw new Error("FORBIDDEN");
  if (source.status !== "active") throw new Error("SOURCE_NOT_ACTIVE");
  const canonicalUrl = normalizeCandidateUrl(url);
  if (!canonicalUrl || title.trim().length < 5) throw new Error("INVALID_INPUT");
  const candidate: CandidateRecord = { id: randomUUID(), sourceId: source.id, externalId: canonicalUrl, canonicalUrl, title: title.trim().slice(0, 300), summary: "", contentHash: "manual", detectedAt: new Date().toISOString(), status: "new", sourceName: source.name, sourceAuthority: source.authority, region: source.region, topics: source.topics, verificationState: "unverified", mediaState: "unknown" };
  const result = await (await db()).collection<CandidateRecord>("storyCandidates").findOneAndUpdate({ sourceId: source.id, canonicalUrl }, { $setOnInsert: candidate }, { upsert: true, returnDocument: "after" });
  if (!result) throw new Error("CANDIDATE_FAILED");
  return result;
}
