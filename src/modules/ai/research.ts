import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import { z } from "zod";
import { connectMongoDB } from "@/lib/mongodb";
import { getCluster } from "@/modules/collector/clusters";
import type { StaffActor } from "@/modules/newsroom/policy";
import { runStructuredTask } from "./gateway";

const researchSchema = z.object({
  synopsis: z.string().min(1).max(2000),
  sourceLeads: z.array(z.object({ candidateId: z.string(), relevance: z.string().min(1).max(500), caveat: z.string().min(1).max(500) })).max(20),
  openQuestions: z.array(z.string().min(1).max(500)).max(12),
  kenyaAfricaAngle: z.string().max(1000),
  suggestedNextSteps: z.array(z.string().min(1).max(500)).max(12),
});
type ResearchOutput = z.infer<typeof researchSchema>;
export type ResearchPack = ResearchOutput & { id: string; clusterId: string; status: "advisory_unverified"; createdAt: string; createdBy: string; model: string; promptVersion: string; usage: { inputTokens: number; outputTokens: number } };

const jsonSchema = {
  type: "object", additionalProperties: false,
  properties: {
    synopsis: { type: "string" },
    sourceLeads: { type: "array", items: { type: "object", additionalProperties: false, properties: { candidateId: { type: "string" }, relevance: { type: "string" }, caveat: { type: "string" } }, required: ["candidateId", "relevance", "caveat"] } },
    openQuestions: { type: "array", items: { type: "string" } },
    kenyaAfricaAngle: { type: "string" },
    suggestedNextSteps: { type: "array", items: { type: "string" } },
  },
  required: ["synopsis", "sourceLeads", "openQuestions", "kenyaAfricaAngle", "suggestedNextSteps"],
};

async function collection() {
  await connectMongoDB();
  const database = mongoose.connection.db;
  if (!database) throw new Error("MongoDB unavailable");
  const packs = database.collection<ResearchPack>("researchPacks");
  await packs.createIndex({ clusterId: 1, createdAt: -1 });
  return packs;
}

export function validateResearchSources(output: ResearchOutput, candidateIds: string[]): ResearchOutput {
  const allowed = new Set(candidateIds);
  if (output.sourceLeads.some((lead) => !allowed.has(lead.candidateId))) throw new Error("UNSUPPORTED_SOURCE_REFERENCE");
  return output;
}

export async function createClusterResearch(clusterId: string, actor: StaffActor): Promise<ResearchPack> {
  if (!actor.active || !["super_admin", "editor", "researcher"].includes(actor.role)) throw new Error("FORBIDDEN");
  const data = await getCluster(clusterId);
  if (!data) throw new Error("NOT_FOUND");
  if (!data.candidates.length) throw new Error("NO_SOURCE_LEADS");
  const suppliedCandidates = data.candidates.slice(0, 20);
  const candidateIds = suppliedCandidates.map((candidate) => candidate.id);
  const sourceCheckedSchema = researchSchema.superRefine((output, context) => {
    if (output.sourceLeads.some((lead) => !candidateIds.includes(lead.candidateId))) context.addIssue({ code: "custom", message: "UNSUPPORTED_SOURCE_REFERENCE" });
  });
  const evidence = { title: data.cluster.title, eventAt: data.cluster.eventAt, candidates: suppliedCandidates.map((candidate) => ({ id: candidate.id, title: candidate.title, summary: candidate.summary.slice(0, 2000), url: candidate.canonicalUrl, source: candidate.sourceName, authority: candidate.sourceAuthority, publishedAt: candidate.publishedAt ?? null })) };
  const result = await runStructuredTask({ task: "clusterResearch", actorId: actor.id, subjectId: clusterId, schema: sourceCheckedSchema, jsonSchema, evidence,
    instructions: "Prepare an editorial research starting point from the supplied leads only. The synopsis must describe what sources appear to discuss without asserting the event is verified. Cite each source lead by its supplied candidate ID. Identify caveats and unresolved questions. Suggest Kenya/Africa relevance only when supported by the leads; otherwise say it is not yet established. Do not write publishable article copy." });
  const pack: ResearchPack = { ...result.value, id: randomUUID(), clusterId, status: "advisory_unverified", createdAt: new Date().toISOString(), createdBy: actor.id, model: result.model, promptVersion: result.promptVersion, usage: result.usage };
  await (await collection()).insertOne(pack);
  return pack;
}

export async function latestClusterResearch(clusterId: string): Promise<ResearchPack | null> {
  return (await collection()).findOne({ clusterId }, { sort: { createdAt: -1 } });
}
