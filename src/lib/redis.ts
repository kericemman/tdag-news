import IORedis from "ioredis";
import { readConfig, requireConfig } from "@/lib/config";

let redis: IORedis | undefined;

export function getRedis(): IORedis {
  if (!redis) {
    redis = new IORedis(requireConfig(readConfig(), "REDIS_URL"), {
      maxRetriesPerRequest: null,
      lazyConnect: true,
    });
  }
  return redis;
}
