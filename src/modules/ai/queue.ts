import { createHash } from "node:crypto";
import { Queue } from "bullmq";
import { getRedis } from "@/lib/redis";
import { readConfig } from "@/lib/config";
import type { StaffActor } from "@/modules/newsroom/policy";
import { connectMongoDB } from "@/lib/mongodb";
import mongoose from "mongoose";
import type { CandidateRecord } from "@/modules/collector/store";
import { candidateEmbeddingText, embeddingContentHash } from "./vectors";

let queue: Queue | undefined;
export function candidateEmbeddingQueue(): Queue {
  if (!queue) queue = new Queue("candidate-embed", { connection: getRedis() });
  return queue;
}

export async function enqueueCandidateEmbedding(candidateId: string, actor: StaffActor): Promise<{ queued: boolean; jobId: string }> {
  if (!actor.active || !["super_admin", "editor", "researcher"].includes(actor.role)) throw new Error("FORBIDDEN");
  await connectMongoDB();
  const database = mongoose.connection.db;
  if (!database) throw new Error("MongoDB unavailable");
  const candidate = await database.collection<CandidateRecord>("storyCandidates").findOne({ id: candidateId });
  if (!candidate || ["ignored", "rejected"].includes(candidate.status)) throw new Error("NOT_FOUND");
  const model = readConfig().AI_EMBEDDING_MODEL;
  const contentHash = embeddingContentHash(candidateEmbeddingText(candidate));
  const jobId = `embed-${createHash("sha256").update(`${candidateId}|${model}|${contentHash}`).digest("hex")}`;
  const q = candidateEmbeddingQueue();
  const prior = await q.getJob(jobId);
  if (prior) {
    if (await prior.getState() === "failed") await prior.retry();
    return { queued: false, jobId };
  }
  await q.add("embed-candidate", { candidateId, actorId: actor.id }, { jobId, attempts: 3, backoff: { type: "exponential", delay: 30_000 }, removeOnComplete: true, removeOnFail: 1000 });
  return { queued: true, jobId };
}
