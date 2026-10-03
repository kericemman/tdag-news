# Phase 6 status

Phase 6 has begun. The work here is a newsroom-only discovery foundation; it is not the Phase 6 exit gate or a public launch.

## Implemented

- A separate BullMQ candidate-clustering queue scans unclustered leads. Retries use exponential backoff; failed jobs are retained for inspection and editor replay.
- Deterministic clusters link leads from the same canonical URL or an identical normalized headline within 72 hours. Each cluster retains its original candidate and source records and is explicitly **unverified**. Clustering never changes story publication status.
- Staff cluster list and detail pages show the evidence behind each grouping.
- Collector health page shows waiting, active, delayed, and failed jobs for fetch and cluster queues. Editors can replay a retained failure.
- Staff entity registry supports types, aliases, official links, provenance and editor verification.
- Staff opportunity proposals capture official URL, eligibility, location, deadline, fee, funding and type. Editor verification is required. The worker expires passed deadlines. Proposals and verified opportunities are not public content.

## Still required for Phase 6 completion

1. Add and validate adapters for approved official websites, public APIs, GitHub releases and advisories, YouTube metadata, documents and authorized newsletters. Each adapter needs source-specific access, rate, credential, parsing and change-detection rules. Social discovery must use permitted signals only.
2. Split fetch, normalization, filtering, classification, deduplication and maintenance into their own durable stages with full run tracing. The current worker separates fetch and clustering only.
3. Extend clustering with entity/date/event overlap, embeddings and editor merge/split controls. Current matching is deliberately conservative and may leave related leads separate.
4. Link entities to candidate, cluster and published story records. Add duplicate/alias review and provenance history.
5. Build extraction of opportunity proposals from approved source documents, with official-page verification evidence and rejection/expiry review. Current creation is manual.
6. Exercise queues and databases in staging with real approved sources. Verify source outages, replay, deduplication load, worker restarts and expiry behavior. No live provider or Atlas/Redis integration was exercised here.

## Safety boundary

All incoming data remains a lead. A matching headline is evidence of possible duplication, not proof of a fact. Human research and owner publication approval remain required.
