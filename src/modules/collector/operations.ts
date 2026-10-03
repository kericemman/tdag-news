import { Queue } from "bullmq";
import { getRedis } from "@/lib/redis";

export type FailedCollectorJob = { queue: "source-fetch" | "candidate-cluster" | "candidate-embed"; id: string; name: string; failedReason: string; attemptsMade: number; timestamp: number };
export type CollectorQueueHealth = { queue: FailedCollectorJob["queue"]; waiting: number; active: number; delayed: number; failed: number };

function queue(name: FailedCollectorJob["queue"]): Queue { return new Queue(name, { connection: getRedis() }); }

export async function collectorOperations(): Promise<{ health: CollectorQueueHealth[]; failed: FailedCollectorJob[] }> {
  const redis = getRedis();
  if (redis.status === "wait") await redis.connect();
  const health: CollectorQueueHealth[] = [];
  const failed: FailedCollectorJob[] = [];
  for (const name of ["source-fetch", "candidate-cluster", "candidate-embed"] as const) {
    const jobs = queue(name);
    try {
      const counts = await jobs.getJobCounts("waiting", "active", "delayed", "failed");
      health.push({ queue: name, waiting: counts.waiting ?? 0, active: counts.active ?? 0, delayed: counts.delayed ?? 0, failed: counts.failed ?? 0 });
      for (const job of await jobs.getFailed(0, 49)) failed.push({ queue: name, id: String(job.id), name: job.name, failedReason: job.failedReason.slice(0, 500), attemptsMade: job.attemptsMade, timestamp: job.timestamp });
    } finally { await jobs.close(); }
  }
  return { health, failed };
}

export async function retryCollectorJob(name: FailedCollectorJob["queue"], id: string): Promise<void> {
  const redis = getRedis();
  if (redis.status === "wait") await redis.connect();
  const jobs = queue(name);
  try {
    const job = await jobs.getJob(id);
    if (!job) throw new Error("NOT_FOUND");
    if (await job.getState() !== "failed") throw new Error("INVALID_STATUS");
    await job.retry();
  } finally { await jobs.close(); }
}
