import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import { connectMongoDB } from "@/lib/mongodb";
import type { EditorialStatus } from "@/modules/editorial/contracts";
import { checkStoryQuality } from "./quality";
import { canEdit, canTransition, requiresQualityGate, type StaffActor, type StaffRole } from "./policy";
import { newDraft, storyInputSchema, storyRecordSchema, type StoryInput, type StoryRecord } from "./story";
import { tokenDigest } from "./security";

type StaffUser = StaffActor & { email: string; passwordHash: string; createdAt: string };
type StaffSession = { tokenHash: string; userId: string; createdAt: string; expiresAt: Date };
type AuditRecord = { id: string; actorId: string; storyId: string; action: string; at: string; fromRevision?: number; toRevision?: number; reason?: string };
type RevisionRecord = { storyId: string; revision: number; snapshot: StoryRecord; actorId: string; at: string };

async function collections() {
  await connectMongoDB();
  const db = mongoose.connection.db;
  if (!db) throw new Error("MongoDB unavailable");
  return {
    users: db.collection<StaffUser>("staffUsers"), sessions: db.collection<StaffSession>("staffSessions"),
    stories: db.collection<StoryRecord>("articles"), revisions: db.collection<RevisionRecord>("articleRevisions"),
    audit: db.collection<AuditRecord>("auditLogs"), attempts: db.collection<{ key: string; count: number; expiresAt: Date }>("staffLoginAttempts"),
    security: db.collection<{ id: string; email: string; event: "login_success" | "login_failure" | "logout"; userId?: string; at: string }>("staffSecurityEvents"),
  };
}

let indexesPromise: Promise<void> | undefined;
export function ensureNewsroomIndexes(): Promise<void> {
  if (!indexesPromise) indexesPromise = (async () => {
    const c = await collections();
    await Promise.all([
      c.users.createIndex({ email: 1 }, { unique: true }), c.sessions.createIndex({ tokenHash: 1 }, { unique: true }),
      c.users.createIndex({ role: 1 }, { unique: true, partialFilterExpression: { role: "super_admin" } }),
      c.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      c.stories.createIndex({ slug: 1 }, { unique: true }), c.stories.createIndex({ status: 1, publishedAt: -1 }),
      c.stories.createIndex({ category: 1, publishedAt: -1 }),
      c.stories.createIndex({ headline: "text", standfirst: "text" }),
      c.revisions.createIndex({ storyId: 1, revision: 1 }, { unique: true }),
      c.audit.createIndex({ storyId: 1, at: -1 }), c.attempts.createIndex({ key: 1 }, { unique: true }),
      c.attempts.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      c.security.createIndex({ email: 1, at: -1 }),
    ]);
  })().catch((error: unknown) => { indexesPromise = undefined; throw error; });
  return indexesPromise;
}

export async function getStaffByEmail(email: string): Promise<StaffUser | null> {
  const c = await collections();
  return c.users.findOne({ email: email.toLowerCase().trim() });
}

export async function createStaffUser(input: { name: string; email: string; passwordHash: string; role: StaffRole }): Promise<StaffActor> {
  await ensureNewsroomIndexes();
  const c = await collections();
  const user: StaffUser = { id: randomUUID(), name: input.name.trim(), email: input.email.toLowerCase().trim(), passwordHash: input.passwordHash, role: input.role, active: true, createdAt: new Date().toISOString() };
  await c.users.insertOne(user);
  return { id: user.id, name: user.name, role: user.role, active: user.active };
}

export async function countOwners(): Promise<number> { const c = await collections(); return c.users.countDocuments({ role: "super_admin" }); }

export async function consumeLoginAttempt(key: string): Promise<boolean> {
  await ensureNewsroomIndexes();
  const c = await collections();
  const now = new Date();
  const expiry = new Date(now.getTime() + 15 * 60_000);
  const active = { $gt: ["$expiresAt", now] };
  const attempt = await c.attempts.findOneAndUpdate({ key }, [{ $set: {
    count: { $cond: [active, { $add: ["$count", 1] }, 1] },
    expiresAt: { $cond: [active, "$expiresAt", expiry] },
  } }], { upsert: true, returnDocument: "after" });
  return (attempt?.count ?? 11) <= 10;
}

export async function clearLoginAttempts(key: string): Promise<void> { const c = await collections(); await c.attempts.deleteOne({ key }); }

export async function recordSecurityEvent(email: string, event: "login_success" | "login_failure" | "logout", userId?: string): Promise<void> {
  const c = await collections();
  await c.security.insertOne({ id: randomUUID(), email: email.toLowerCase().trim(), event, userId, at: new Date().toISOString() });
}

export async function createStaffSession(userId: string, token: string): Promise<void> {
  const c = await collections();
  await c.sessions.insertOne({ tokenHash: tokenDigest(token), userId, createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 12 * 60 * 60_000) });
}

export async function revokeStaffSession(token: string): Promise<void> { const c = await collections(); await c.sessions.deleteOne({ tokenHash: tokenDigest(token) }); }

export async function staffForSession(token: string | undefined): Promise<StaffActor | null> {
  if (!token) return null;
  const c = await collections();
  const session = await c.sessions.findOne({ tokenHash: tokenDigest(token), expiresAt: { $gt: new Date() } });
  if (!session) return null;
  const user = await c.users.findOne({ id: session.userId, active: true });
  return user ? { id: user.id, name: user.name, role: user.role, active: user.active } : null;
}

export async function listNewsroomStories(limit = 50, statuses: readonly EditorialStatus[] = []): Promise<StoryRecord[]> {
  const c = await collections();
  const records = await c.stories.find(statuses.length ? { status: { $in: [...statuses] } } : {}).sort({ updatedAt: -1 }).limit(Math.min(limit, 100)).toArray();
  return records.map((record) => storyRecordSchema.parse(record));
}

export async function newsroomStoryCounts(): Promise<Partial<Record<EditorialStatus, number>>> {
  const c = await collections();
  const groups = await c.stories.aggregate<{ _id: EditorialStatus; count: number }>([{ $group: { _id: "$status", count: { $sum: 1 } } }]).toArray();
  return Object.fromEntries(groups.map((group) => [group._id, group.count]));
}

export async function getNewsroomStory(id: string): Promise<StoryRecord | null> {
  const c = await collections();
  const record = await c.stories.findOne({ id });
  return record ? storyRecordSchema.parse(record) : null;
}

export async function listStoryHistory(id: string): Promise<{ revisions: RevisionRecord[]; audit: AuditRecord[] }> {
  const c = await collections();
  const [revisions, audit] = await Promise.all([c.revisions.find({ storyId: id }).sort({ revision: -1 }).limit(50).toArray(), c.audit.find({ storyId: id }).sort({ at: -1 }).limit(100).toArray()]);
  return { revisions, audit };
}

export async function createStory(input: StoryInput, actor: StaffActor): Promise<StoryRecord> {
  if (!actor.active || !canEdit(actor.role)) throw new Error("FORBIDDEN");
  if (input.hero?.rightsStatus === "approved" && !["super_admin", "editor"].includes(actor.role)) throw new Error("FORBIDDEN");
  await ensureNewsroomIndexes();
  const c = await collections();
  const story = newDraft(storyInputSchema.parse(input));
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await c.stories.insertOne(story, { session });
      await c.revisions.insertOne({ storyId: story.id, revision: 1, snapshot: story, actorId: actor.id, at: story.createdAt }, { session });
      await c.audit.insertOne({ id: randomUUID(), actorId: actor.id, storyId: story.id, action: "created", at: story.createdAt, toRevision: 1 }, { session });
    });
  } finally { await session.endSession(); }
  return story;
}

export async function saveStory(id: string, expectedRevision: number, input: StoryInput, actor: StaffActor): Promise<StoryRecord> {
  if (!actor.active || !canEdit(actor.role)) throw new Error("FORBIDDEN");
  const c = await collections();
  const session = await mongoose.startSession();
  let saved: StoryRecord | null = null;
  try {
    await session.withTransaction(async () => {
      const current = await c.stories.findOne({ id }, { session });
      if (!current) throw new Error("NOT_FOUND");
      if (current.revision !== expectedRevision) throw new Error("REVISION_CONFLICT");
      if (!["draft", "editorial_review", "ready_for_review"].includes(current.status)) throw new Error("STATUS_LOCKED");
      const parsed = storyInputSchema.parse(input);
      if (parsed.hero?.rightsStatus === "approved" && current.hero?.rightsStatus !== "approved" && !["super_admin", "editor"].includes(actor.role)) throw new Error("FORBIDDEN");
      saved = storyRecordSchema.parse({ ...current, ...parsed, revision: current.revision + 1, updatedAt: new Date().toISOString() });
      const result = await c.stories.replaceOne({ id, revision: expectedRevision }, saved, { session });
      if (!result.matchedCount) throw new Error("REVISION_CONFLICT");
      await c.revisions.insertOne({ storyId: id, revision: saved.revision, snapshot: saved, actorId: actor.id, at: saved.updatedAt }, { session });
      await c.audit.insertOne({ id: randomUUID(), actorId: actor.id, storyId: id, action: "saved", at: saved.updatedAt, fromRevision: expectedRevision, toRevision: saved.revision }, { session });
    });
  } finally { await session.endSession(); }
  if (!saved) throw new Error("SAVE_FAILED");
  return saved;
}

export async function transitionStory(id: string, expectedRevision: number, to: EditorialStatus, actor: StaffActor, reason?: string): Promise<StoryRecord> {
  if (!actor.active) throw new Error("FORBIDDEN");
  const c = await collections();
  const session = await mongoose.startSession();
  let saved: StoryRecord | null = null;
  try {
    await session.withTransaction(async () => {
      const current = await c.stories.findOne({ id }, { session });
      if (!current) throw new Error("NOT_FOUND");
      if (current.revision !== expectedRevision) throw new Error("REVISION_CONFLICT");
      if (!canTransition(actor.role, current.status, to) || to === "scheduled" || to === "updated" || current.status === "updated" && to === "published" || ["published", "updated"].includes(current.status) && to === "archived") throw new Error("FORBIDDEN");
      if (requiresQualityGate(to) && checkStoryQuality(current).some((issue) => issue.blocking)) throw new Error("QUALITY_GATE");
      if (["hold", "rejected", "archived"].includes(to) && !reason?.trim()) throw new Error("REASON_REQUIRED");
      if (to === "published" && current.status === "scheduled" && current.scheduledAt && Date.parse(current.scheduledAt) > Date.now()) throw new Error("EMBARGO_ACTIVE");
      const now = new Date().toISOString();
      saved = storyRecordSchema.parse({ ...current, status: to, revision: current.revision + 1, updatedAt: now,
        ...(to === "approved" ? { approvedBy: actor.id, approvedAt: now } : {}),
        ...(to === "published" ? { publishedAt: current.publishedAt ?? now } : {}),
      });
      const result = await c.stories.replaceOne({ id, revision: expectedRevision }, saved, { session });
      if (!result.matchedCount) throw new Error("REVISION_CONFLICT");
      await c.revisions.insertOne({ storyId: id, revision: saved.revision, snapshot: saved, actorId: actor.id, at: now }, { session });
      await c.audit.insertOne({ id: randomUUID(), actorId: actor.id, storyId: id, action: `status:${current.status}->${to}`, at: now, fromRevision: expectedRevision, toRevision: saved.revision, reason }, { session });
    });
  } finally { await session.endSession(); }
  if (!saved) throw new Error("TRANSITION_FAILED");
  return saved;
}

export async function scheduleStory(id: string, expectedRevision: number, scheduledAt: string, actor: StaffActor): Promise<StoryRecord> {
  if (!actor.active || actor.role !== "super_admin") throw new Error("FORBIDDEN");
  if (!Number.isFinite(Date.parse(scheduledAt)) || Date.parse(scheduledAt) <= Date.now()) throw new Error("INVALID_SCHEDULE");
  const c = await collections();
  const session = await mongoose.startSession();
  let saved: StoryRecord | null = null;
  try {
    await session.withTransaction(async () => {
      const current = await c.stories.findOne({ id }, { session });
      if (!current) throw new Error("NOT_FOUND");
      if (current.revision !== expectedRevision) throw new Error("REVISION_CONFLICT");
      if (current.status !== "approved" || current.approvedBy !== actor.id) throw new Error("FORBIDDEN");
      if (checkStoryQuality(current).some((issue) => issue.blocking)) throw new Error("QUALITY_GATE");
      const now = new Date().toISOString();
      saved = storyRecordSchema.parse({ ...current, status: "scheduled", scheduledAt: new Date(scheduledAt).toISOString(), revision: current.revision + 1, updatedAt: now });
      const result = await c.stories.replaceOne({ id, revision: expectedRevision }, saved, { session });
      if (!result.matchedCount) throw new Error("REVISION_CONFLICT");
      await c.revisions.insertOne({ storyId: id, revision: saved.revision, snapshot: saved, actorId: actor.id, at: now }, { session });
      await c.audit.insertOne({ id: randomUUID(), actorId: actor.id, storyId: id, action: "scheduled", at: now, fromRevision: expectedRevision, toRevision: saved.revision, reason: scheduledAt }, { session });
    });
  } finally { await session.endSession(); }
  if (!saved) throw new Error("SCHEDULE_FAILED");
  return saved;
}

export async function correctStory(id: string, expectedRevision: number, input: StoryInput, note: string, actor: StaffActor): Promise<StoryRecord> {
  if (!actor.active || actor.role !== "super_admin") throw new Error("FORBIDDEN");
  if (note.trim().length < 10) throw new Error("REASON_REQUIRED");
  const c = await collections();
  const session = await mongoose.startSession();
  let saved: StoryRecord | null = null;
  try {
    await session.withTransaction(async () => {
      const current = await c.stories.findOne({ id }, { session });
      if (!current) throw new Error("NOT_FOUND");
      if (current.revision !== expectedRevision) throw new Error("REVISION_CONFLICT");
      if (current.status !== "published" && current.status !== "updated") throw new Error("STATUS_LOCKED");
      const parsed = storyInputSchema.parse(input);
      if (parsed.slug !== current.slug) throw new Error("SLUG_LOCKED");
      const now = new Date().toISOString();
      saved = storyRecordSchema.parse({ ...current, ...parsed, status: "updated", revision: current.revision + 1, updatedAt: now, correction: { publishedAt: now, note: note.trim() } });
      if (checkStoryQuality(saved).some((issue) => issue.blocking)) throw new Error("QUALITY_GATE");
      const result = await c.stories.replaceOne({ id, revision: expectedRevision }, saved, { session });
      if (!result.matchedCount) throw new Error("REVISION_CONFLICT");
      await c.revisions.insertOne({ storyId: id, revision: saved.revision, snapshot: saved, actorId: actor.id, at: now }, { session });
      await c.audit.insertOne({ id: randomUUID(), actorId: actor.id, storyId: id, action: "correction_published", at: now, fromRevision: expectedRevision, toRevision: saved.revision, reason: note.trim() }, { session });
    });
  } finally { await session.endSession(); }
  if (!saved) throw new Error("CORRECTION_FAILED");
  return saved;
}

export async function listPublicStories(input: { category?: string; limit?: number; query?: string } = {}): Promise<StoryRecord[]> {
  if (process.env.PUBLICATION_LIVE !== "true") return [];
  const c = await collections();
  const now = new Date().toISOString();
  const filter: Record<string, unknown> = { status: { $in: ["published", "updated"] }, publishedAt: { $lte: now } };
  if (input.category && input.category !== "latest") filter.category = input.category;
  if (input.query) filter.$text = { $search: input.query.slice(0, 100) };
  const records = await c.stories.find(filter).sort({ publishedAt: -1 }).limit(Math.min(input.limit ?? 30, 1000)).toArray();
  return records.map((record) => storyRecordSchema.parse(record));
}

export async function getPublicStory(slug: string): Promise<StoryRecord | null> {
  if (process.env.PUBLICATION_LIVE !== "true") return null;
  const c = await collections();
  const record = await c.stories.findOne({ slug, status: { $in: ["published", "updated"] }, publishedAt: { $lte: new Date().toISOString() } });
  return record ? storyRecordSchema.parse(record) : null;
}
