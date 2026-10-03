# Candidate Vector Search setup

The candidate similarity feature is an editorial discovery aid. It never merges clusters, verifies facts or changes publication state.

## Configuration

Set `OPENAI_API_KEY`, `REDIS_URL`, `MONGODB_URI`, `AI_EMBEDDING_MODEL`, `AI_EMBEDDING_DIMENSIONS` and `AI_VECTOR_INDEX` in the deployment secret/configuration store. The defaults are `text-embedding-3-small`, 1536 dimensions and `candidate_vector_v1`. Verify the chosen model supports the configured dimensions in the actual account before use. Model and dimensions must match the Atlas index.

The web process accepts staff requests and enqueues `candidate-embed` jobs. The separate worker process consumes them. AI calls share the configured daily task-attempt guardrail. Only staff-selected candidates are embedded; collection itself does not call the model.

## Index procedure

1. Run `npm run vector:index` to inspect the proposed `candidateEmbeddings` index definition. This does not connect to Atlas or change data.
2. Review Atlas cluster capability, index cost, model, dimension count and filter fields in staging.
3. Run `npm run vector:index -- --apply` in staging. Wait for the index to report Ready in Atlas. The script refuses to overwrite a differently configured index.
4. Queue two or more approved test leads, confirm vectors appear with the expected dimensions and model, then inspect similarity from a lead detail page. Test changed source text, a missing index and a worker restart.
5. Repeat the reviewed setup in production only after staging evidence. On model or dimension changes, use a new index name and re-embed selected content; do not query mixed model spaces.

The index contains a cosine vector field and filters for model and dimension count. MongoDB Vector Search runs the nearest-neighbor search; the application only joins returned candidate IDs to their source records. It does not scan vectors in application memory.

Reference: [MongoDB Vector Search index configuration](https://www.mongodb.com/docs/compass/indexes/create-vector-search-index/) and [the `$vectorSearch` query stage](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage/).

## Current status

The code and index preview have been checked locally. No live OpenAI embedding request, Atlas index creation or staging similarity query has been completed yet.
