import { createHash } from "node:crypto";
import mongoose from "mongoose";
import { connectMongoDB } from "@/lib/mongodb";
import { readConfig } from "@/lib/config";
import type { CandidateRecord } from "@/modules/collector/store";
import { embedText } from "./gateway";

export type CandidateEmbedding = { candidateId: string; sourceId: string; model: string; dimensions: number; contentHash: string; vector: number[]; updatedAt: string; usage: { inputTokens: number; outputTokens: number } };
export type SimilarCandidate = { candidate: CandidateRecord; score: number };

export function candidateEmbeddingText(candidate: Pick<CandidateRecord, "title" | "summary" | "region" | "topics">): string {
  return [candidate.title.trim(), candidate.summary.trim().slice(0, 4000), `Region: ${candidate.region}`, `Topics: ${candidate.topics.join(", ")}`].filter(Boolean).join("\n").slice(0, 6000);
}

export function embeddingContentHash(text: string): string { return createHash("sha256").update(text).digest("hex"); }

export function candidateVectorIndexDefinition(dimensions: number) {
  return { fields: [
    { type: "vector", path: "vector", numDimensions: dimensions, similarity: "cosine" },
    { type: "filter", path: "model" },
    { type: "filter", path: "dimensions" },
  ] };
}

export function candidateVectorPipeline(input: { index: string; vector: number[]; model: string; dimensions: number; limit: number }) {
  const limit = Math.max(1, Math.min(20, input.limit));
  return [
    { $vectorSearch: { index: input.index, path: "vector", queryVector: input.vector, filter: { model: input.model, dimensions: input.dimensions }, numCandidates: Math.max(100, limit * 20), limit: limit + 1 } },
    { $project: { _id: 0, candidateId: 1, contentHash: 1, score: { $meta: "vectorSearchScore" } } },
  ];
}

async function collections() {
  await connectMongoDB();
  const database = mongoose.connection.db;
  if (!database) throw new Error("MongoDB unavailable");
  const embeddings = database.collection<CandidateEmbedding>("candidateEmbeddings");
  await embeddings.createIndex({ candidateId: 1, model: 1 }, { unique: true });
  return { candidates: database.collection<CandidateRecord>("storyCandidates"), embeddings };
}

export async function getCandidateEmbedding(candidateId: string): Promise<CandidateEmbedding | null> {
  const c = await collections();
  return c.embeddings.findOne({ candidateId, model: readConfig().AI_EMBEDDING_MODEL });
}

export async function embedCandidate(candidateId: string, actorId: string): Promise<{ status: "unchanged" | "embedded"; dimensions: number }> {
  const c = await collections();
  const candidate = await c.candidates.findOne({ id: candidateId });
  if (!candidate || ["ignored", "rejected"].includes(candidate.status)) throw new Error("CANDIDATE_UNAVAILABLE");
  const config = readConfig();
  const text = candidateEmbeddingText(candidate);
  const contentHash = embeddingContentHash(text);
  const current = await c.embeddings.findOne({ candidateId, model: config.AI_EMBEDDING_MODEL });
  if (current?.contentHash === contentHash && current.dimensions === config.AI_EMBEDDING_DIMENSIONS) return { status: "unchanged", dimensions: current.dimensions };
  const result = await embedText({ actorId, subjectId: candidateId, text });
  await c.embeddings.updateOne({ candidateId, model: result.model }, { $set: { candidateId, sourceId: candidate.sourceId, model: result.model, dimensions: result.dimensions, contentHash, vector: result.vector, updatedAt: new Date().toISOString(), usage: result.usage } }, { upsert: true });
  return { status: "embedded", dimensions: result.dimensions };
}

export async function similarCandidates(candidateId: string, limit = 5): Promise<{ status: "ready" | "missing_embedding" | "stale_embedding" | "index_unavailable"; matches: SimilarCandidate[] }> {
  const c = await collections();
  const config = readConfig();
  const source = await c.candidates.findOne({ id: candidateId });
  if (!source) throw new Error("NOT_FOUND");
  const embedding = await c.embeddings.findOne({ candidateId, model: config.AI_EMBEDDING_MODEL, dimensions: config.AI_EMBEDDING_DIMENSIONS });
  if (!embedding) return { status: "missing_embedding", matches: [] };
  if (embedding.contentHash !== embeddingContentHash(candidateEmbeddingText(source))) return { status: "stale_embedding", matches: [] };
  let hits: { candidateId: string; contentHash: string; score: number }[];
  try {
    hits = await c.embeddings.aggregate<{ candidateId: string; contentHash: string; score: number }>(candidateVectorPipeline({ index: config.AI_VECTOR_INDEX, vector: embedding.vector, model: embedding.model, dimensions: embedding.dimensions, limit })).toArray();
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (/index|vectorSearch|not supported/i.test(message)) return { status: "index_unavailable", matches: [] };
    throw error;
  }
  const ranked = hits.filter((hit) => hit.candidateId !== candidateId && Number.isFinite(hit.score)).slice(0, limit);
  const candidates = await c.candidates.find({ id: { $in: ranked.map((hit) => hit.candidateId) }, status: { $nin: ["ignored", "rejected"] } }).toArray();
  const byId = new Map(candidates.map((candidate) => [candidate.id, candidate]));
  return { status: "ready", matches: ranked.flatMap((hit) => { const candidate = byId.get(hit.candidateId); return candidate && hit.contentHash === embeddingContentHash(candidateEmbeddingText(candidate)) ? [{ candidate, score: hit.score }] : []; }) };
}
