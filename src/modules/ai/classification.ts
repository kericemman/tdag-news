import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import { z } from "zod";
import { connectMongoDB } from "@/lib/mongodb";
import type { CandidateRecord } from "@/modules/collector/store";
import type { StaffActor } from "@/modules/newsroom/policy";
import { runStructuredTask } from "./gateway";

const category = z.enum(["ai", "africa", "kenya", "business", "startups", "products", "developers", "cybersecurity", "opportunities", "unclear"]);
const classificationSchema = z.object({
  category,
  geography: z.enum(["kenya", "africa", "global", "unclear"]),
  importance: z.enum(["low", "medium", "high", "unclear"]),
  opportunityPotential: z.boolean(),
  rationale: z.string().min(1).max(600),
  missingEvidence: z.array(z.string().min(1).max(300)).max(6),
});
type ClassificationOutput = z.infer<typeof classificationSchema>;
export type CandidateClassification = ClassificationOutput & { id: string; candidateId: string; sourceId: string; status: "advisory_unverified"; createdAt: string; createdBy: string; model: string; promptVersion: string; usage: { inputTokens: number; outputTokens: number } };

const jsonSchema = {
  type: "object", additionalProperties: false,
  properties: {
    category: { type: "string", enum: category.options },
    geography: { type: "string", enum: ["kenya", "africa", "global", "unclear"] },
    importance: { type: "string", enum: ["low", "medium", "high", "unclear"] },
    opportunityPotential: { type: "boolean" },
    rationale: { type: "string" },
    missingEvidence: { type: "array", items: { type: "string" } },
  },
  required: ["category", "geography", "importance", "opportunityPotential", "rationale", "missingEvidence"],
};

async function collections() {
  await connectMongoDB();
  const database = mongoose.connection.db;
  if (!database) throw new Error("MongoDB unavailable");
  const classifications = database.collection<CandidateClassification>("candidateClassifications");
  await classifications.createIndex({ candidateId: 1, createdAt: -1 });
  return { candidates: database.collection<CandidateRecord>("storyCandidates"), classifications };
}

export async function classifyCandidate(candidateId: string, actor: StaffActor): Promise<CandidateClassification> {
  if (!actor.active || !["super_admin", "editor", "researcher"].includes(actor.role)) throw new Error("FORBIDDEN");
  const c = await collections();
  const candidate = await c.candidates.findOne({ id: candidateId });
  if (!candidate) throw new Error("NOT_FOUND");
  const evidence = { candidateId, title: candidate.title, summary: candidate.summary.slice(0, 3000), sourceName: candidate.sourceName, sourceAuthority: candidate.sourceAuthority, sourceUrl: candidate.canonicalUrl, sourceRegion: candidate.region, sourceTopics: candidate.topics, publishedAt: candidate.publishedAt ?? null };
  const result = await runStructuredTask({ task: "candidateClassification", actorId: actor.id, subjectId: candidateId, schema: classificationSchema, jsonSchema, evidence,
    instructions: "Classify this unverified source lead for editorial triage only. Use only the supplied metadata. A high importance label needs clear evidence in the lead; otherwise choose medium, low or unclear. Opportunity potential means the lead may describe a program, grant, job or learning opportunity, not that eligibility is verified. Explain the reason and list missing evidence. Never claim independent verification." });
  const record: CandidateClassification = { ...result.value, id: randomUUID(), candidateId, sourceId: candidate.sourceId, status: "advisory_unverified", createdAt: new Date().toISOString(), createdBy: actor.id, model: result.model, promptVersion: result.promptVersion, usage: result.usage };
  await c.classifications.insertOne(record);
  return record;
}

export async function latestCandidateClassifications(candidateIds: string[]): Promise<Map<string, CandidateClassification>> {
  const result = new Map<string, CandidateClassification>();
  if (!candidateIds.length) return result;
  const { classifications } = await collections();
  const records = await classifications.aggregate<CandidateClassification>([
    { $match: { candidateId: { $in: candidateIds } } },
    { $sort: { createdAt: -1 } },
    { $group: { _id: "$candidateId", record: { $first: "$$ROOT" } } },
    { $replaceRoot: { newRoot: "$record" } },
  ]).toArray();
  for (const record of records) result.set(record.candidateId, record);
  return result;
}
