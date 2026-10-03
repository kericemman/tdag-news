import assert from "node:assert/strict";
import test from "node:test";
import { candidateEmbeddingText, candidateVectorIndexDefinition, candidateVectorPipeline, embeddingContentHash } from "./vectors";

test("candidate vectors track source text changes", () => {
  const before = candidateEmbeddingText({ title: "A new developer tool", summary: "Initial announcement", region: "Kenya", topics: ["developers"] });
  const after = candidateEmbeddingText({ title: "A new developer tool", summary: "Updated announcement", region: "Kenya", topics: ["developers"] });
  assert.notEqual(embeddingContentHash(before), embeddingContentHash(after));
});

test("vector queries filter by model and dimensions before ranking", () => {
  const pipeline = candidateVectorPipeline({ index: "candidate_vector_v1", vector: [0.1, 0.2], model: "test-model", dimensions: 2, limit: 5 });
  assert.deepEqual(pipeline[0], { $vectorSearch: { index: "candidate_vector_v1", path: "vector", queryVector: [0.1, 0.2], filter: { model: "test-model", dimensions: 2 }, numCandidates: 100, limit: 6 } });
  assert.deepEqual(candidateVectorIndexDefinition(2).fields.slice(1), [{ type: "filter", path: "model" }, { type: "filter", path: "dimensions" }]);
});
