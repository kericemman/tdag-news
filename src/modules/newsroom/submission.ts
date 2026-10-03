import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import { z } from "zod";
import { connectMongoDB } from "@/lib/mongodb";
import type { StaffActor } from "./policy";

const webUrl = z.url().refine((value) => ["http:", "https:"].includes(new URL(value).protocol));
export const submissionInputSchema = z.object({
  name: z.string().trim().min(2).max(120), email: z.email().max(254), organization: z.string().trim().max(160).optional(),
  storyType: z.enum(["news", "product", "opportunity", "research", "other"]),
  headline: z.string().trim().min(5).max(180), description: z.string().trim().min(30).max(5000),
  supportingUrls: z.array(webUrl).max(5), embargoAt: z.iso.datetime({ offset: true }).optional(),
  notes: z.string().trim().max(1000).optional(),
});
type Submission = z.infer<typeof submissionInputSchema> & { id: string; status: "new" | "reviewing" | "rejected" | "accepted"; createdAt: string };

export async function createSubmission(input: z.infer<typeof submissionInputSchema>): Promise<void> {
  await connectMongoDB();
  const db = mongoose.connection.db;
  if (!db) throw new Error("MongoDB unavailable");
  const collection = db.collection<Submission>("storySubmissions");
  await collection.createIndex({ status: 1, createdAt: -1 });
  await collection.insertOne({ ...input, id: randomUUID(), status: "new", createdAt: new Date().toISOString() });
}

export async function listSubmissions(limit = 50): Promise<Submission[]> {
  await connectMongoDB();
  const db = mongoose.connection.db;
  if (!db) throw new Error("MongoDB unavailable");
  return db.collection<Submission>("storySubmissions").find({}).sort({ createdAt: -1 }).limit(Math.min(limit, 100)).toArray();
}

export async function setSubmissionStatus(id: string, expectedStatus: Submission["status"], status: Submission["status"], reason: string, actor: StaffActor): Promise<void> {
  if (!actor.active || !["super_admin", "editor"].includes(actor.role)) throw new Error("FORBIDDEN");
  if (status === "new" || expectedStatus === status) throw new Error("INVALID_STATUS");
  if (status === "rejected" && reason.trim().length < 5) throw new Error("REASON_REQUIRED");
  await connectMongoDB();
  const db = mongoose.connection.db;
  if (!db) throw new Error("MongoDB unavailable");
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const result = await db.collection<Submission>("storySubmissions").updateOne({ id, status: expectedStatus }, { $set: { status } }, { session });
      if (!result.matchedCount) throw new Error("REVISION_CONFLICT");
      await db.collection("submissionAudit").insertOne({ id: randomUUID(), submissionId: id, actorId: actor.id, from: expectedStatus, to: status, reason: reason.trim(), at: new Date().toISOString() }, { session });
    });
  } finally { await session.endSession(); }
}
