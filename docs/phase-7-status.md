# Phase 7 status

Phase 7 has begun. The first deliverable is an editor-triggered, source-linked research starting point for existing clusters. It does not satisfy the Phase 7 exit gate.

## Implemented

- A single server-side AI Gateway wraps OpenAI structured responses. The model ID is configurable, output is validated against application schemas, provider retries are bounded, and response storage is disabled.
- Each request records task, model, prompt version, actor, cluster, duration, token use or failure code in `aiRuns`. Prompts and third-party source text are not written to the run log. Monetary cost remains uncalculated until account pricing and budget rules are configured.
- Editors and researchers can request a research brief from a cluster detail page. The brief records a cautious synopsis, source leads with caveats, open questions, Kenya/Africa relevance and reporting next steps. It is saved as `advisory_unverified` in `researchPacks`.
- Generated source IDs must match stored cluster candidates. A mismatch rejects the entire response. The UI links back to original source URLs and labels the brief as unverified. AI cannot change an editorial state or publish.
- Missing API credentials or provider failure leave the existing source leads available. No AI call runs automatically on collection.
- Staff can request structured AI triage for an incoming candidate. The saved result shows a category, geography, importance, possible opportunity signal, rationale and missing evidence. It is advisory only and does not update the candidate's editorial status.
- The gateway enforces a configurable daily task-attempt count (`AI_DAILY_CALL_LIMIT`, default 20), input character ceiling (`AI_MAX_INPUT_CHARS`, default 30,000) and output token ceiling (1,500). The daily counter is reserved atomically in MongoDB before calling the provider. The SDK may retry a task once, so actual provider requests can exceed the task count. These are usage guardrails, not a monetary budget.

## Still required for Phase 7 completion

1. Prove account-level OpenAI model access, schema behavior, usage reporting, latency, budget limits and data controls with staging credentials. Current code has not made a live model request.
2. Add explicit task routing across fast, reasoning and high-risk models, pricing configuration, monetary cost ceilings, circuit breakers and tested fallback/manual paths.
3. Evaluate candidate classification and opportunity signals with editor-reviewed fixtures and measured accuracy. Do not silently accept model labels as facts.
4. Generate versioned embeddings in durable jobs and build matching Atlas Vector Search indexes. Verify dimensions and query performance in staging; never compare all vectors in application memory.
5. Build a provenance-preserving knowledge corpus and retrieval for published stories, source documents, claims, corrections and research packs. Expand briefs to timelines, disputed/missing claims, previous TDAG coverage and media leads only when retrieved evidence supports them.
6. Add evaluation fixtures and regression thresholds for attribution, unsupported claims, classification, entity extraction, duplicate resolution, research completeness, opportunity detection and relevance.
7. Exercise failure paths, replay, concurrent requests and retention in staging. Phase 6 source-network and durable-stage gaps also remain dependencies for broad research coverage.

## Safety boundary

A model response is an editorial lead. Human source inspection, claim verification and owner approval remain necessary before publication.
