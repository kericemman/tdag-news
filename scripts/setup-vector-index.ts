import mongoose from "mongoose";
import { readConfig } from "../src/lib/config";
import { connectMongoDB } from "../src/lib/mongodb";
import { candidateVectorIndexDefinition } from "../src/modules/ai/vectors";

async function main() {
  const config = readConfig();
  const definition = candidateVectorIndexDefinition(config.AI_EMBEDDING_DIMENSIONS);
  if (!process.argv.includes("--apply")) {
    process.stdout.write(JSON.stringify({ collection: "candidateEmbeddings", name: config.AI_VECTOR_INDEX, type: "vectorSearch", definition }, null, 2) + "\n");
    process.stdout.write("Preview only. Add --apply after reviewing the Atlas cluster and index dimensions.\n");
    return;
  }
  await connectMongoDB();
  const database = mongoose.connection.db;
  if (!database) throw new Error("MongoDB unavailable");
  const collection = database.collection("candidateEmbeddings");
  const existing = await collection.listSearchIndexes(config.AI_VECTOR_INDEX).toArray();
  if (existing.length) {
    const actual = existing[0] as { latestDefinition?: { fields?: unknown[] } };
    if (JSON.stringify(actual.latestDefinition?.fields) !== JSON.stringify(definition.fields)) throw new Error("Existing vector index differs from configured dimensions or filters; review it in Atlas before changing it.");
    process.stdout.write(`Vector index ${config.AI_VECTOR_INDEX} already matches the configuration.\n`);
    return;
  }
  const name = await collection.createSearchIndex({ name: config.AI_VECTOR_INDEX, type: "vectorSearch", definition });
  process.stdout.write(`Created ${name}. Wait for Atlas to report Ready before running similarity queries.\n`);
}

main().catch((error: unknown) => { process.stderr.write((error instanceof Error ? error.message : "Index setup failed") + "\n"); process.exitCode = 1; });
