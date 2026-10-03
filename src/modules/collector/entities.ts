import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import { z } from "zod";
import { connectMongoDB } from "@/lib/mongodb";
import type { StaffActor } from "@/modules/newsroom/policy";

const httpsUrl = z.url().refine((value) => new URL(value).protocol === "https:");
export const entityInputSchema = z.object({ kind: z.enum(["company", "person", "product", "technology", "organization", "regulator", "country", "industry"]), name: z.string().trim().min(2).max(160), aliases: z.array(z.string().trim().min(2).max(160)).max(20).default([]), officialUrl: httpsUrl.optional(), provenanceUrl: httpsUrl, notes: z.string().trim().max(2000).default("") });
export type EntityRecord = z.infer<typeof entityInputSchema> & { id: string; normalizedName: string; status: "proposed" | "verified"; createdBy: string; verifiedBy?: string; createdAt: string; updatedAt: string };

async function collection() {
  await connectMongoDB();
  const database = mongoose.connection.db;
  if (!database) throw new Error("MongoDB unavailable");
  return database.collection<EntityRecord>("entities");
}

export async function proposeEntity(input: unknown, actor: StaffActor): Promise<EntityRecord> {
  if (!actor.active || !["super_admin", "editor", "researcher"].includes(actor.role)) throw new Error("FORBIDDEN");
  const parsed = entityInputSchema.parse(input);
  const c = await collection();
  await c.createIndex({ kind: 1, normalizedName: 1 }, { unique: true });
  await c.createIndex({ status: 1, name: 1 });
  const now = new Date().toISOString();
  const entity: EntityRecord = { ...parsed, id: randomUUID(), normalizedName: parsed.name.toLocaleLowerCase("en"), status: "proposed", createdBy: actor.id, createdAt: now, updatedAt: now };
  await c.insertOne(entity);
  return entity;
}

export async function listEntities(limit = 100): Promise<EntityRecord[]> {
  return (await collection()).find({}).sort({ name: 1 }).limit(Math.min(limit, 200)).toArray();
}

export async function verifyEntity(id: string, actor: StaffActor): Promise<void> {
  if (!actor.active || !["super_admin", "editor"].includes(actor.role)) throw new Error("FORBIDDEN");
  const result = await (await collection()).updateOne({ id, status: "proposed" }, { $set: { status: "verified", verifiedBy: actor.id, updatedAt: new Date().toISOString() } });
  if (!result.matchedCount) throw new Error("NOT_FOUND");
}
