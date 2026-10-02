# TDAG News domain and API contracts — Phase 2

This is the initial schema and index plan, not a claim that collections exist. Runtime Zod contracts for the first evidence-bearing objects and status transitions are in `src/modules/editorial/`. MongoDB/Mongoose persistence arrives with the relevant feature; API responses must use explicit DTOs, never raw documents.

## Core invariants

1. Every article has a stable ID, unique slug, content type, author, category, revision and editorial status. Public queries return only published/updated records whose publication time has arrived.
2. Claims belong to a StoryCluster; EvidenceLinks connect claims to SourceDocuments as support, contradiction or context. Citation records point to real SourceDocuments at article, section or claim scope.
3. A source may support many claims; a claim may require multiple sources. Deleting a source that is cited is restricted, with archival/soft-delete semantics preferred.
4. Author identity and revision history remain separate from AI assistance. State changes and overrides record actor, time, reason and old/new status.
5. Media keeps origin and rights metadata after Cloudinary upload. Pending/rejected/expired rights cannot pass a publish gate.
6. Explicit consent, user preferences and TDAG-owned subscription state govern distribution. Provider callbacks and labels are evidence, not the sole source of truth.
7. IDs are opaque; timestamps are UTC ISO values; display converts to Africa/Nairobi. Webhook/event IDs and send keys are unique for idempotency.

## Aggregate ownership and principal reads

| Aggregate | Records | Principal reads/writes |
| --- | --- | --- |
| Identity | User, UserProfile, Session, Follow, SavedArticle, DistributionPreference | Login/account, followed topics, consent/preferences, active sessions |
| Editorial | Article, ArticleRevision, Author, Category, Topic, Tag, DailyBrief, Correction | Home/category/article, drafts/revisions, briefs, corrections |
| Evidence | Source, SourceFetch, SourceDocument, Claim, EvidenceLink, ResearchPack | Candidate source panel, claim verification, references, knowledge retrieval |
| Discovery | StoryCandidate, StoryCluster, Entity, TrendSignal | Incoming queue, dedup/event clusters, entity histories/trend windows |
| Media | MediaAsset | Rights review, hero/section placement, attribution and delivery |
| Opportunities | Opportunity, Submission | Eligibility/deadline filters, submission review, expiry |
| Commerce | Subscription, Payment, WebhookEvent | Entitlement lookup, reconciliation, replay protection |
| Distribution | Notification, EmailDelivery, WhatsAppDelivery, DistributionJob | Eligible recipient selection, retries, suppression and status |
| Operations | AuditLog, AIUsageRecord, PromptVersion | Actor history, cost/latency, prompt regression and system health |

## Index plan

| Collection | Planned indexes |
| --- | --- |
| `articles` | unique `slug`; `{status,publishedAt}` for public feeds; `{categoryIds,publishedAt}`; `{topicIds,publishedAt}`; `{authorIds,publishedAt}` |
| `articleRevisions` | unique `{articleId,revision}`; `{articleId,createdAt}` |
| `sourceDocuments` | unique normalized `canonicalUrl` where available; `{sourceId,retrievedAt}`; later full-text/vector indexes for search/RAG |
| `sources` | unique normalized URL/type; `{active,nextFetchAt}`; `{authority,region}` |
| `storyCandidates` | unique `{sourceId,externalId}` where available; unique content hash within source; `{status,detectedAt}` |
| `storyClusters` | `{status,importance,lastUpdatedAt}`; vector index on canonical event embedding when implemented |
| `claims`/`evidenceLinks` | `{storyId,status}`; unique `{claimId,sourceDocumentId,relation}` |
| `mediaAssets` | `{rightsStatus,createdAt}`; unique source/hash where legally appropriate |
| `opportunities` | `{status,deadline}`; `{eligibleCountries,type,deadline}` |
| `users`/`subscriptions` | unique normalized email and phone where provided; `{userId,status}`; provider reference unique |
| `webhookEvents`/delivery | unique `{provider,eventId}`; unique send idempotency key; `{userId,createdAt}` |
| `auditLogs` | `{targetType,targetId,createdAt}`; `{actorId,createdAt}` |
| Search/vector | Atlas Search for public article/opportunity/entity text; Vector Search for candidate/cluster/article/research/entity embeddings, with dimensions fixed to the configured model and version |

Indexes should be created through repeatable setup/migration code, measured against actual query patterns and reviewed for cost. No production vector search is claimed until the Atlas cluster and index are provisioned and queried.

## API boundary

- Public routes return only published content, approved media and safe source metadata. Search uses cursor pagination; no draft, private research note, billing or consent information leaks.
- Authenticated routes cover profile, preferences, follows, saves and subscriptions. The server verifies identity and entitlement; the browser never asserts Premium status.
- Admin routes require server-side RBAC and object-level checks. Mutations validate request schemas, use structured error shapes (`code`, `message`, optional `fieldErrors`, `requestId`) and append audit records.
- Provider webhooks accept raw payloads, verify signatures before parse/transition, deduplicate event IDs, enqueue long work and return promptly. Failed processing is retryable and visible.
- State-changing editorial endpoints require expected revision or another concurrency guard so concurrent edits cannot silently overwrite each other.
- Dates and status are serialized as explicit enums/ISO timestamps; external provider response shapes stay behind adapter DTOs.

## State machine and approval

The code in `workflow.ts` denies direct candidate-to-published transitions and reserves owner approval/publication for the owner role. This is one layer of protection; persistence and API handlers must also verify the actor, quality gate, current revision and audit transaction. The Phase 0 open decision D-04 can later grant carefully scoped editor delegation without changing historical actor records.
