import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import { connectMongoDB } from "@/lib/mongodb";
import { clusterKey, normalizedTitle, sameEventTitle } from "./clustering";
import type { CandidateRecord } from "./store";

export type StoryCluster = { id: string; key: string; normalizedTitle: string; title: string; eventAt: string; candidateIds: string[]; sourceIds: string[]; verificationState: "unverified"; createdAt: string; updatedAt: string };

async function collections() {
  await connectMongoDB();
  const database = mongoose.connection.db;
  if (!database) throw new Error("MongoDB unavailable");
  return { candidates: database.collection<CandidateRecord>("storyCandidates"), clusters: database.collection<StoryCluster>("storyClusters") };
}

let indexes: Promise<void> | undefined;
async function ensureIndexes(): Promise<void> {
  if (!indexes) indexes = (async () => {
    const c = await collections();
    await Promise.all([c.clusters.createIndex({ key: 1 }, { unique: true }), c.clusters.createIndex({ normalizedTitle: 1, eventAt: -1 }), c.candidates.createIndex({ clusterId: 1 }), c.candidates.createIndex({ canonicalUrl: 1, clusterId: 1 })]);
  })().catch((error: unknown) => { indexes = undefined; throw error; });
  return indexes;
}

export async function unclusteredCandidates(limit = 100): Promise<CandidateRecord[]> {
  const c = await collections();
  return c.candidates.find({ clusterId: { $exists: false }, status: { $nin: ["ignored", "rejected"] } }).sort({ detectedAt: 1 }).limit(Math.min(limit, 200)).toArray();
}

export async function clusterCandidate(candidateId: string): Promise<{ clusterId: string; reason: "same_url" | "same_title_date" | "new" }> {
  await ensureIndexes();
  const c = await collections();
  const candidate = await c.candidates.findOne({ id: candidateId });
  if (!candidate) throw new Error("NOT_FOUND");
  if (candidate.clusterId) return { clusterId: candidate.clusterId, reason: "new" };
  const date = candidate.publishedAt ?? candidate.detectedAt;
  let reason: "same_url" | "same_title_date" | "new" = "new";
  const sameUrl = await c.candidates.findOne({ id: { $ne: candidate.id }, canonicalUrl: candidate.canonicalUrl, clusterId: { $exists: true } });
  let cluster = sameUrl?.clusterId ? await c.clusters.findOne({ id: sameUrl.clusterId }) : null;
  if (cluster) reason = "same_url";
  if (!cluster && normalizedTitle(candidate.title).split(" ").length >= 5) {
    const earliest = new Date(Date.parse(date) - 72 * 60 * 60_000).toISOString();
    const latest = new Date(Date.parse(date) + 72 * 60 * 60_000).toISOString();
    const possible = await c.clusters.find({ normalizedTitle: normalizedTitle(candidate.title), eventAt: { $gte: earliest, $lte: latest } }).limit(10).toArray();
    cluster = possible.find((item) => sameEventTitle(candidate.title, item.title, date, item.eventAt)) ?? null;
    if (cluster) reason = "same_title_date";
  }
  if (!cluster) {
    const now = new Date().toISOString();
    const key = clusterKey(candidate.title, candidate.canonicalUrl, date);
    cluster = await c.clusters.findOneAndUpdate({ key }, { $setOnInsert: { id: randomUUID(), key, normalizedTitle: normalizedTitle(candidate.title), title: candidate.title, eventAt: date, candidateIds: [], sourceIds: [], verificationState: "unverified", createdAt: now, updatedAt: now } }, { upsert: true, returnDocument: "after" });
    if (!cluster) throw new Error("CLUSTER_FAILED");
  }
  await c.clusters.updateOne({ id: cluster.id }, { $addToSet: { candidateIds: candidate.id, sourceIds: candidate.sourceId }, $set: { updatedAt: new Date().toISOString() } });
  await c.candidates.updateOne({ id: candidate.id, clusterId: { $exists: false } }, { $set: { clusterId: cluster.id, clusterMatchReason: reason } });
  return { clusterId: cluster.id, reason };
}

export async function listClusters(limit = 50): Promise<StoryCluster[]> {
  return (await collections()).clusters.find({}).sort({ updatedAt: -1 }).limit(Math.min(limit, 100)).toArray();
}

export async function getCluster(id: string): Promise<{ cluster: StoryCluster; candidates: CandidateRecord[] } | null> {
  const c = await collections();
  const cluster = await c.clusters.findOne({ id });
  if (!cluster) return null;
  return { cluster, candidates: await c.candidates.find({ id: { $in: cluster.candidateIds } }).sort({ detectedAt: -1 }).toArray() };
}
