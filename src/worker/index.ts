import { Worker } from "bullmq";
import { getRedis } from "@/lib/redis";

async function main(): Promise<void> {
  const redis = getRedis();
  await redis.connect();
  const worker = new Worker("maintenance", async () => ({ ok: true }), { connection: redis });
  worker.on("failed", (job, error) => {
    process.stderr.write(JSON.stringify({ level: "error", queue: "maintenance", jobId: job?.id, message: error.message }) + "\n");
  });
  process.stdout.write(JSON.stringify({ level: "info", message: "worker started", queue: "maintenance" }) + "\n");
  const shutdown = async () => { await worker.close(); await redis.quit(); process.exit(0); };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

main().catch((error: unknown) => {
  process.stderr.write(JSON.stringify({ level: "error", message: error instanceof Error ? error.message : "Worker startup failed" }) + "\n");
  process.exitCode = 1;
});
