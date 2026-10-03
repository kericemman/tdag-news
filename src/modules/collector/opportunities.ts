import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import { z } from "zod";
import { connectMongoDB } from "@/lib/mongodb";
import type { StaffActor } from "@/modules/newsroom/policy";

export const opportunityInputSchema = z.object({
  title: z.string().trim().min(8).max(240), kind: z.enum(["grant", "job", "fellowship", "accelerator", "competition", "event", "other"]),
  officialUrl: z.url().refine((value) => new URL(value).protocol === "https:"),
  eligibility: z.string().trim().min(10).max(3000), location: z.string().trim().min(2).max(160),
  deadlineAt: z.iso.datetime({ offset: true }), fee: z.string().trim().max(160).default("Not stated"),
  funding: z.string().trim().max(160).default("Not stated"), notes: z.string().trim().max(2000).default(""),
});
export type OpportunityRecord = z.infer<typeof opportunityInputSchema> & { id: string; status: "proposed" | "verified" | "expired"; createdBy: string; verifiedBy?: string; verifiedAt?: string; expiredAt?: string; createdAt: string; updatedAt: string };

export function opportunityIsOpen(deadlineAt: string, now = new Date()): boolean {
  const deadline = Date.parse(deadlineAt);
  return Number.isFinite(deadline) && deadline > now.getTime();
}

async function collection() {
  await connectMongoDB();
  const database = mongoose.connection.db;
  if (!database) throw new Error("MongoDB unavailable");
  return database.collection<OpportunityRecord>("opportunities");
}

export async function proposeOpportunity(input: unknown, actor: StaffActor): Promise<OpportunityRecord> {
  if (!actor.active || !["super_admin", "editor", "researcher"].includes(actor.role)) throw new Error("FORBIDDEN");
  const parsed = opportunityInputSchema.parse(input);
  if (!opportunityIsOpen(parsed.deadlineAt)) throw new Error("INVALID_DEADLINE");
  const c = await collection();
  await c.createIndex({ officialUrl: 1, title: 1 }, { unique: true });
  await c.createIndex({ status: 1, deadlineAt: 1 });
  const now = new Date().toISOString();
  const record: OpportunityRecord = { ...parsed, id: randomUUID(), status: "proposed", createdBy: actor.id, createdAt: now, updatedAt: now };
  await c.insertOne(record);
  return record;
}

export async function listOpportunities(limit = 100): Promise<OpportunityRecord[]> {
  return (await collection()).find({}).sort({ deadlineAt: 1 }).limit(Math.min(limit, 200)).toArray();
}

export async function verifyOpportunity(id: string, actor: StaffActor): Promise<void> {
  if (!actor.active || !["super_admin", "editor"].includes(actor.role)) throw new Error("FORBIDDEN");
  const now = new Date().toISOString();
  const result = await (await collection()).updateOne({ id, status: "proposed", deadlineAt: { $gt: now } }, { $set: { status: "verified", verifiedBy: actor.id, verifiedAt: now, updatedAt: now } });
  if (!result.matchedCount) throw new Error("NOT_FOUND_OR_EXPIRED");
}

export async function expireOpportunities(): Promise<number> {
  const now = new Date().toISOString();
  const result = await (await collection()).updateMany({ status: { $in: ["proposed", "verified"] }, deadlineAt: { $lte: now } }, { $set: { status: "expired", expiredAt: now, updatedAt: now } });
  return result.modifiedCount;
}
