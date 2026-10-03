import { Queue, Worker } from "bullmq";
import { getRedis } from "@/lib/redis";
import { dueSources } from "@/modules/collector/store";
import { fetchSource } from "@/modules/collector/fetch";
import { clusterCandidate, unclusteredCandidates } from "@/modules/collector/clusters";
import { expireOpportunities } from "@/modules/collector/opportunities";

async function main(): Promise<void> {
  const redis = getRedis();
  await redis.connect();
  const worker = new Worker("maintenance", async () => ({ ok: true }), { connection: redis });
  const sourceQueue = new Queue("source-fetch", { connection: redis });
  const sourceWorker = new Worker("source-fetch", async (job) => fetchSource(String(job.data.sourceId)), { connection: redis, concurrency: 2 });
  const clusterQueue = new Queue("candidate-cluster", { connection: redis });
  const clusterWorker = new Worker("candidate-cluster", async (job) => clusterCandidate(String(job.data.candidateId)), { connection: redis, concurrency: 1 });
  const schedule = async () => {
    try {
      for (const source of await dueSources()) await sourceQueue.add("fetch-source", { sourceId: source.id }, { jobId: `fetch-${source.id}`, attempts: 3, backoff: { type: "exponential", delay: 60000 }, removeOnComplete: true, removeOnFail: 1000 });
      for (const candidate of await unclusteredCandidates()) await clusterQueue.add("cluster-candidate", { candidateId: candidate.id }, { jobId: `cluster-${candidate.id}`, attempts: 3, backoff: { type: "exponential", delay: 30000 }, removeOnComplete: true, removeOnFail: 1000 });
      await expireOpportunities();
    } catch (error) { process.stderr.write(JSON.stringify({ level: "error", queue: "source-fetch", message: error instanceof Error ? error.message : "Source scheduling failed" }) + "\n"); }
  };
  const timer = setInterval(() => void schedule(), 5 * 60_000);
  void schedule();
  worker.on("failed", (job, error) => {
    process.stderr.write(JSON.stringify({ level: "error", queue: "maintenance", jobId: job?.id, message: error.message }) + "\n");
  });
  sourceWorker.on("failed", (job, error) => process.stderr.write(JSON.stringify({ level: "error", queue: "source-fetch", jobId: job?.id, message: error.message }) + "\n"));
  clusterWorker.on("failed", (job, error) => process.stderr.write(JSON.stringify({ level: "error", queue: "candidate-cluster", jobId: job?.id, message: error.message }) + "\n"));
  process.stdout.write(JSON.stringify({ level: "info", message: "worker started", queue: "maintenance" }) + "\n");
  const shutdown = async () => { clearInterval(timer); await Promise.all([worker.close(), sourceWorker.close(), clusterWorker.close(), sourceQueue.close(), clusterQueue.close()]); await redis.quit(); process.exit(0); };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

main().catch((error: unknown) => {
  process.stderr.write(JSON.stringify({ level: "error", message: error instanceof Error ? error.message : "Worker startup failed" }) + "\n");
  process.exitCode = 1;
});
