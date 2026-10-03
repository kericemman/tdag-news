import { createHmac, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import mongoose from "mongoose";
import { z } from "zod";
import { connectMongoDB } from "@/lib/mongodb";
import { tokenDigest } from "@/modules/newsroom/security";

export const emailSchema = z.email().max(254).transform((value) => value.toLowerCase().trim());
export type EmailSubscriber = { id: string; email: string; status: "pending" | "active" | "unsubscribed" | "suppressed"; frequency: "weekly" | "daily" | "off"; consentAt: string; confirmedAt?: string; unsubscribedAt?: string; suppressionReason?: string; verificationTokenHash?: string; verificationExpiresAt?: Date; updatedAt: string };
type EmailDelivery = { id: string; subscriberId: string; providerMessageId?: string; kind: "confirmation" | "welcome" | "newsletter"; status: "queued" | "sent" | "delivered" | "bounced" | "complained" | "failed"; idempotencyKey: string; createdAt: string; updatedAt: string; error?: string };

async function collections() {
  await connectMongoDB();
  const database = mongoose.connection.db;
  if (!database) throw new Error("MongoDB unavailable");
  return { subscribers: database.collection<EmailSubscriber>("emailSubscribers"), deliveries: database.collection<EmailDelivery>("emailDeliveries"), webhooks: database.collection<{ id: string; eventId: string; at: string }>("emailWebhookEvents") };
}

let indexesPromise: Promise<void> | undefined;
export function ensureEmailIndexes(): Promise<void> {
  if (!indexesPromise) indexesPromise = (async () => {
    const c = await collections();
    await Promise.all([c.subscribers.createIndex({ email: 1 }, { unique: true }), c.subscribers.createIndex({ verificationTokenHash: 1 }, { sparse: true }), c.subscribers.createIndex({ status: 1, frequency: 1 }), c.deliveries.createIndex({ idempotencyKey: 1 }, { unique: true }), c.deliveries.createIndex({ providerMessageId: 1 }, { sparse: true }), c.webhooks.createIndex({ eventId: 1 }, { unique: true })]);
  })().catch((error: unknown) => { indexesPromise = undefined; throw error; });
  return indexesPromise;
}

export async function requestEmailSubscription(rawEmail: string): Promise<{ token?: string; subscriberId?: string }> {
  await ensureEmailIndexes();
  const email = emailSchema.parse(rawEmail);
  const c = await collections();
  const existing = await c.subscribers.findOne({ email });
  if (existing?.status === "active" || existing?.status === "suppressed") return {};
  const token = randomBytes(32).toString("base64url");
  const now = new Date().toISOString();
  const id = existing?.id ?? randomUUID();
  await c.subscribers.updateOne({ email }, { $set: { id, email, status: "pending", frequency: "weekly", consentAt: now, updatedAt: now, verificationTokenHash: tokenDigest(token), verificationExpiresAt: new Date(Date.now() + 24 * 60 * 60_000) } }, { upsert: true });
  return { token, subscriberId: id };
}

export async function confirmEmailSubscription(token: string): Promise<EmailSubscriber | null> {
  if (!/^[A-Za-z0-9_-]{20,100}$/.test(token)) return null;
  const c = await collections();
  const now = new Date().toISOString();
  return c.subscribers.findOneAndUpdate({ verificationTokenHash: tokenDigest(token), verificationExpiresAt: { $gt: new Date() }, status: "pending" }, { $set: { status: "active", confirmedAt: now, updatedAt: now }, $unset: { verificationTokenHash: "", verificationExpiresAt: "" } }, { returnDocument: "after" });
}

function unsubscribeMac(id: string): Buffer {
  const secret = process.env.EMAIL_TOKEN_SECRET;
  if (!secret || secret.length < 32) throw new Error("EMAIL_TOKEN_SECRET must be configured with at least 32 characters");
  return createHmac("sha256", secret).update(`unsubscribe:${id}`).digest();
}

export function unsubscribeToken(id: string): string { return `${id}.${unsubscribeMac(id).toString("base64url")}`; }

export function unsubscribeId(token: string): string | null {
  const [id, digest] = token.split(".");
  if (!z.uuid().safeParse(id).success || !digest) return null;
  const supplied = Buffer.from(digest, "base64url");
  const expected = unsubscribeMac(id);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected) ? id : null;
}

export async function unsubscribeEmail(token: string): Promise<boolean> {
  const id = unsubscribeId(token);
  if (!id) return false;
  const c = await collections();
  const result = await c.subscribers.updateOne({ id, status: { $in: ["active", "pending"] } }, { $set: { status: "unsubscribed", frequency: "off", unsubscribedAt: new Date().toISOString(), updatedAt: new Date().toISOString() } });
  return result.modifiedCount > 0;
}

export async function deliveryStarted(subscriberId: string, kind: EmailDelivery["kind"], idempotencyKey: string): Promise<void> {
  const c = await collections();
  const now = new Date().toISOString();
  await c.deliveries.updateOne({ idempotencyKey }, { $setOnInsert: { id: randomUUID(), subscriberId, kind, status: "queued", idempotencyKey, createdAt: now, updatedAt: now } }, { upsert: true });
}

export async function deliveryFinished(idempotencyKey: string, providerMessageId?: string, error?: string): Promise<void> {
  const c = await collections();
  await c.deliveries.updateOne({ idempotencyKey }, { $set: { status: error ? "failed" : "sent", providerMessageId, error, updatedAt: new Date().toISOString() } });
}

export async function recordEmailEvent(eventId: string, type: string, providerMessageId: string, recipient: string): Promise<void> {
  const c = await collections();
  const added = await c.webhooks.updateOne({ eventId }, { $setOnInsert: { id: randomUUID(), eventId, at: new Date().toISOString() } }, { upsert: true });
  if (!added.upsertedCount) return;
  const status = type === "email.delivered" ? "delivered" : type === "email.bounced" ? "bounced" : type === "email.complained" ? "complained" : type === "email.failed" ? "failed" : null;
  if (!status) return;
  await c.deliveries.updateOne({ providerMessageId }, { $set: { status, updatedAt: new Date().toISOString() } });
  if (status === "bounced" || status === "complained") await c.subscribers.updateOne({ email: recipient.toLowerCase() }, { $set: { status: "suppressed", frequency: "off", suppressionReason: status, updatedAt: new Date().toISOString() } });
}

export async function listActiveSubscribers(limit = 1000): Promise<EmailSubscriber[]> {
  return (await collections()).subscribers.find({ status: "active", frequency: { $ne: "off" } }).limit(Math.min(limit, 5000)).toArray();
}

export async function emailForSubscriber(id: string): Promise<string | null> {
  return (await collections()).subscribers.findOne({ id }).then((record) => record?.email ?? null);
}
