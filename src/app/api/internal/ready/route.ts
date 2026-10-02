import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { readConfig } from "@/lib/config";
import { connectMongoDB } from "@/lib/mongodb";
import { getRedis } from "@/lib/redis";

export const dynamic = "force-dynamic";

function authorized(received: string | null, expected: string | undefined): boolean {
  if (!received || !expected) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: NextRequest) {
  const config = readConfig();
  if (!authorized(request.headers.get("x-healthcheck-token"), config.HEALTHCHECK_TOKEN)) {
    return new Response(null, { status: 404 });
  }
  try {
    await connectMongoDB();
    const redis = getRedis();
    if (redis.status === "wait") await redis.connect();
    await redis.ping();
    return NextResponse.json({ status: "ready" });
  } catch {
    return NextResponse.json({ status: "unavailable" }, { status: 503 });
  }
}
