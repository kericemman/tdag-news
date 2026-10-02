# TDAG News — end-to-end delivery roadmap

Status: planning baseline, 2026-10-02. Read with [project-brief.md](project-brief.md) and the owner's 140-section master specification. This document is a build sequence, not a claim that any feature is implemented. A phase is complete only when its exit evidence is recorded. The phases are ordered by dependency; editorial, design, security, accessibility, operations and testing continue throughout.

## Non-negotiable release rules

1. A human owner/editor is accountable for every publication. Automatically discovered material cannot publish itself. The public byline defaults to **TDAG News Team**; never invent AI authors.
2. An important factual claim must map to stored evidence, including the source for the relevant section or claim. Unsupported or contradictory claims are visible to editors. Corrections retain history.
3. External content is input to original reporting, not material to copy and paraphrase. Social signals are discovery leads, not confirmation.
4. Real, relevant, rights-cleared media comes before generated illustration. Generated visuals are identified and cannot impersonate documentary evidence.
5. TDAG owns user identity, consent, preferences, entitlements, relevance decisions and distribution history. Providers transport messages or payments.
6. Store timestamps in UTC; present in Africa/Nairobi. Public site is free, Premium delivery is WhatsApp, launch has no ads. Prices are configuration, not constants.
7. Keep the deployment a modular monolith with separate web and worker processes. Use deterministic code first, semantic search for similarity, AI for language tasks, and humans for editorial judgment.

## Delivery milestones

| Milestone | Phases | Usable result |
| --- | --- | --- |
| Architecture ready | 0–2 | Secure foundation, design system, data contracts and provider proofs |
| Initial public launch | 3–5 | Publication, human newsroom, citations, manual collection, basic RSS/Atom inbox, search, email signup and policies |
| Intelligence newsroom | 6–8 | Reliable source network, evidence graph, AI-assisted research and media workflows |
| Controlled distribution | 9 | Owner WhatsApp review, secure approval and selective free email |
| Premium launch | 10 | Paid entitlement and personalized WhatsApp delivery |
| Complete consumer product | 11–12 | Advanced intelligence, personalization, trend and operational systems, hardened production |
| Future commercial expansion | 13 | B2B teams, institutions and intelligence API after demand validation |

The first public launch is intentionally earlier than full product completion. Do not represent later-phase features as working at launch.

## Phase 0 — Discovery, governance and decisions

**Build/decide**

- Turn the master specification into a prioritized backlog with requirement IDs, dependencies, owner and acceptance tests. Record what is launch-critical, later consumer scope and future B2B scope.
- Define editorial policy: source authority, minimum corroboration by claim risk, independence, submissions/embargoes, corrections, opinion/analysis labels, sponsored-content disclosure, breaking-news criteria and escalation for legal/security-sensitive stories.
- Map journeys for public reader, free subscriber, Premium subscriber, writer, researcher, editor, owner and distribution manager. Define role permissions and handoffs.
- Confirm information architecture, content types, Kenya/Africa/global positioning, English launch, category taxonomy and persona taxonomy. Specify all public routes and newsroom views.
- Approve brand usage for the supplied logo, compact variants and favicon; confirm font hosting/licensing, imagery approach, typography, color and accessibility targets.
- Define launch content inventory: genuine articles, authors, daily brief, policies and sources. Sample data remains clearly fictional and stays out of production.
- Decide Premium plans, pricing and billing period when checkout work begins; establish KES accounting, cancellation/refund handling and whether M-Pesa is manual renewal or a separately proven recurring option.
- Establish success baselines: returning readers, subscriptions, completion, source clicks, corrections, relevance, opt-outs, delivery failure and cost per story/subscriber.

**Inputs:** Emmanuel Kerich as final editorial authority; provider-account owners; initial editors/authors; legal/policy review where needed.

**Exit evidence:** signed-off scope and editorial rules, route map, story workflow, permissions matrix, content inventory, measurement plan and provider-decision log.

## Phase 1 — Repository, platform and integration proofs

**Build**

- Initialize/connect the stated GitHub repository. Protect the main branch, define review/check requirements, issue templates, conventional environments and release/version procedure. Never commit the existing local `backend/.env` or other secrets.
- Create strict TypeScript Next.js project, Tailwind design tokens, lint/type/build checks, tests, local setup, `.env.example`, CI, staging and production configuration.
- Structure modules for auth, users, subscriptions, billing, articles, editorial, sources, collector, candidates, clusters, claims, verification, research, AI, knowledge, entities, media, opportunities, personalization, relevance, trends, distribution, email, WhatsApp, notifications, analytics, admin, search and audit. Add only code needed by the current phase.
- Establish MongoDB Atlas connection, schema migrations/index management, Redis/BullMQ worker process, structured errors/logging, health endpoints and configuration validation.
- Build provider contracts and account-level spikes: Atlas Search/Vector Search, OpenAI model and Structured Output access, Resend domain/webhooks, Cloudinary signed upload, WhatChimp approved owner template/send/status/inbound webhook, Paystack test checkout/webhooks. Document actual account capabilities and rate/usage limits.
- Define secrets storage, key rotation, development/staging/production isolation, backup plan and provider outage behavior.

**Exit evidence:** a clean clone builds and runs web and worker; CI passes; staging is deployable; test integrations are proven or have documented gaps and safe substitutes. No real secret appears in Git or client bundles.

## Phase 2 — Design system and domain contracts

**Build**

- Implement approved Newsreader/Manrope typography scale, TDAG palette, spacing, editorial layouts, semantic components, focus states, responsive navigation and low-motion behavior. Test the supplied logo at real sizes; create separately reviewed small-format assets.
- Design mobile-first page patterns for home, category/latest, article, daily brief, author, topic/company, opportunity, search, account and newsroom mobile owner review. Define calm empty, loading and error states.
- Model article types (news, analysis, explainer, brief, product update, opportunity, research/report, daily brief, weekly roundup; reserve live/developing state). Define status machine from idea through candidate, research, draft, editorial review, owner review, approval, schedule/publish, hold/reject/archive/update.
- Define canonical entities: User/Profile/Session, Subscription/Payment, Article/Revision/Author, Category/Topic/Tag/Entity, Source/Fetch/Document, Candidate/Cluster, Claim/EvidenceLink/ResearchPack, MediaAsset, Opportunity/Submission/DailyBrief, Follow/Save/Preference, Notification/Delivery/Job/WebhookEvent, AuditLog/TrendSignal/AIUsage/PromptVersion.
- Document ownership and invariants: claim-source many-to-many links; article-, section- and claim-level citations; immutable revisions/audit; rights state; consent/entitlement state; idempotency keys; UTC timestamps; public DTOs; index and retention strategy. Do not overnormalize MongoDB blindly.
- Define API conventions, input validation, cursor pagination, role gates, versioning where needed and provider interface boundaries.

**Exit evidence:** reviewed responsive prototypes, accessible component library, schema/index plan, workflow state diagram and API contracts. A representative article with references, media and correction renders at desktop and mobile widths.

## Phase 3 — Public publication

**Build**

- Implement required routes: home; latest; AI, Africa, Kenya, business, startups, products, developers, cybersecurity, explainers, opportunities; brief index/detail; article; author; topic; company; search; For You placeholder/appropriate state; Premium; submit; about; editorial policy; corrections; authors; contact; privacy; terms; sponsored-content policy; login/register/account.
- Homepage hierarchy: lead story, Important Now, latest, curated sections, explained, opportunities, For You state, Daily Brief, newsletter and real-data-only Most Read. Avoid fabricated coverage and crowded card grids.
- Article experience: headline, standfirst, byline, published/updated time, reading time, story status, rich body, citations, sources/further reading, media, quotes/tables/callouts, optional Why It Matters/What Next/Africa/Kenya/TDAG perspective, topics/entities, related stories, save/share/follow.
- Build content listing and filtering, authors, opportunity detail and expiration display, brief pages, useful empty states and legitimate external source links.
- Implement indexable server rendering/caching, canonical URLs, robots, XML/news sitemaps, RSS/category feeds, OpenGraph/social cards, Article/NewsArticle/Organization/Person/Breadcrumb structured data, internal linking and publication/update timestamps. Complete Google News transparency pages.
- Optimize images, fonts, pagination, JavaScript weight, low-bandwidth loading and accessibility: semantic HTML, keyboard access, visible focus, contrast, form errors, alt text/captions and heading order.

**Exit evidence:** every launch route renders real or honest empty content; articles read well on a low-end mobile connection; SEO metadata and feeds are valid; keyboard/screen-reader review and performance checks pass agreed thresholds.

## Phase 4 — Human newsroom CMS and trust system

**Build**

- Secure account auth, optional Google sign-in, sessions, RBAC for Super Admin, Editor, Writer, Researcher, Distribution Manager and Analyst; enforce permissions server-side. Add rate limits, CSRF/XSS protections, rich-text sanitization, secure uploads, audit and session/security events.
- Newsroom overview and queues: Incoming, Trending, Clusters, Research, Drafts, Editorial Review, Ready for Owner Review, Scheduled, Published, Opportunities, Sources, Entities, Media, Subscribers, Premium, Distribution, Analytics, AI Operations, Health and Settings. Populate each when its module exists.
- TipTap editor with autosave, revisions/diff, metadata, section blocks, inline citation insertion, tables, quotes, callouts, documents, video embeds, media positioning, source panel and web/email/WhatsApp previews. Keep drafts recoverable after failures.
- Source Graph with source authority and provenance, SourceDocument metadata, Claim status and supporting/contradicting EvidenceLinks. Render source references from stored relationships. Show coverage and unsupported/contested claim warnings.
- Quality gate for required fields, citation integrity, unsupported important claims, source accessibility, duplicate publication, author, date consistency, media rights, SEO and distribution metadata. Overrides need explicit reason and audit.
- Formal corrections, visible public notices, revision preservation, unpublish/update policy and no silent high-impact claim replacement.
- Submission intake with supporting URLs/files/media, embargo data, spam/security controls and an independent editorial review queue.

**Exit evidence:** a real editor can create, revise, source, review, schedule, publish, correct and audit a story; unauthorized roles cannot approve/publish; no automatically discovered story can publish.

## Phase 5 — Initial collection, search and free email launch

**Build**

- Source registry with name, URL, type, geography, taxonomy, authority/trust, interval, parser, robots/access notes, credential reference, status and fetch history. Seed a small approved official/primary source list.
- Deterministic RSS/Atom/manual-URL collector: schedule, fetch, normalize Candidate, canonical URL, hashes, simple duplicate detection, persisted fetch/failure records, retries/backoff, idempotent enqueue and editor inbox actions.
- Candidate card with authority, time, topics, region, importance, novelty, verification/media state and research/merge/ignore/reject/assign/draft/find-source actions as implemented.
- MongoDB text search across published stories and initial topic/author/opportunity fields, then extend to entity types later. Exclude drafts and private notes.
- Resend transactional email and free newsletter signup, verification/consent, welcome message, preferences, unsubscribe, bounce/complaint events and delivery history. Keep free email selection simple and honest until relevance is implemented.
- Launch readiness: real content and authors, policy pages, DNS/HTTPS, monitoring, backups, staging review, analytics consent behavior and launch rollback.

**Exit evidence:** the publication is live at `news.thedigitalagame.com`; editors can act on real incoming items; subscribers can opt in/out; messages and source failures are traceable. This is the **initial public launch** gate.

## Phase 6 — Scalable source network and story clustering

**Build**

- Add adapters, each yielding the same Candidate contract: official websites, public APIs, GitHub releases/security advisories, YouTube channel/video metadata, documents and authorized newsletters, submissions and permitted social discovery signals. Respect access rules, terms, robots and provider limits; never build brittle unauthorized LinkedIn/X scraping.
- Separate jobs for source fetch, normalization, filtering, classification, embedding, deduplication, clustering and maintenance. Add retry/backoff, dead-letter handling, dashboards, idempotency and replay tools.
- Layer duplicate detection: URL/source/hash, normalized title, entity-date-event overlap, embedding similarity, then AI only for ambiguous cases. Merge source documents into one event-centered StoryCluster rather than duplicating external stories.
- Entity registry for companies, people, products, technologies, organizations, regulators, countries and industries, with aliases, official links, provenance and related TDAG coverage.
- Opportunity extraction with official-page verification, eligibility, deadline, location, fees/funding, type and expiration rules. Human review precedes publication.

**Exit evidence:** configured sources run without duplicate storms; clusters reflect underlying events; source outages are visible and recoverable; opportunities expire correctly; a discovery signal cannot silently become a verified fact.

## Phase 7 — AI Gateway, knowledge and research

**Build**

- Central AI Gateway: task-to-model routing, configurable model IDs, prompt registry/versioning, schema validation, retries/fallbacks, cost and token records, latency/failure tracking, provider abstraction and redaction. No scattered model calls.
- Fast-model tasks: classification, categories/topics/entities/geography, opportunity detection, basic importance/persona signals, short candidate summaries and spam triage. Validate structured output against application schemas.
- Generate embeddings for selected candidates, clusters, articles, research packs, entities/topics. Create Atlas Vector Search indexes; use semantic similarity for deduplication, related stories, search and retrieval. Do not compare all vectors in application memory.
- Knowledge corpus: published TDAG stories, source documents, claims, entities, corrections and research packs. Retrieval returns provenance; internal RAG does not manufacture past coverage.
- Editor-triggered ResearchPack: event/timeline, confirmed facts, disputed and missing claims, primary/secondary sources, context, previous TDAG reporting, technical/business/Africa/Kenya implications, persona relevance, questions, angles, media leads and risks. Web research uses an adapter and supplements the source network.
- Reasoning model only for worthy clusters; strongest model only for high-risk/complex cases. Manual and non-AI paths remain available during outages.
- Evaluation fixtures and regression thresholds for classification, entity/claim extraction, duplicate resolution, source attribution, unsupported-claim detection, research completeness, opportunity extraction and persona relevance.

**Exit evidence:** editors can inspect source-backed research and model uncertainty; AI failures do not create unsupported articles; costs and prompt/model versions are traceable; evaluation regressions block unsafe changes.

## Phase 8 — Citation, verification and multimedia intelligence

**Build**

- Claim-level verification with source authority mix, independent corroboration, contradictory evidence, confidence and status (`unverified`, `partially_verified`, `verified`, `contested`, `unsupported`, `obsolete`). Make thresholds configurable by story risk.
- Citation assistant that suggests claim-source mappings, flags missing/broken references and updates numbering after edits. Editorial quality gate checks links and evidence at publication time. Roundups retain section-level sources.
- Media discovery provider adapters for official newsrooms/kits, product screenshots, public-domain/licensed archives, research charts, government media and YouTube. Record origin, creator, licence, attribution, rights, relevance and verification before use.
- Media analysis for orientation, visible text, logos, duplicates, alt-text suggestions and possible misleading context. It must not assert an image documents an event without evidence.
- Cloudinary only for TDAG-owned or rights-cleared uploads; responsive derivatives, focal points, captions and credits. Legitimate video embeds retain provider/canonical URL/embeddable state and removed-video fallback.
- Separate conceptual visual creation for diagrams/timelines/illustrations; mark generated assets internally and label publicly where appropriate. Suggest hero and section-level media placement rather than an undifferentiated asset list.
- Editorial Copilot commands for source finding, independent confirmation, contradiction search, contextual explanation, claim extraction, headline/standfirst suggestions, media and distribution previews.

**Exit evidence:** every used asset has a reviewed rights/origin state; editors can trace important claims to evidence and see contradictions; generated media cannot be presented as event photography.

## Phase 9 — Owner approval and free selective distribution

**Build**

- Enforce full editorial state machine and quality gate before `READY_FOR_REVIEW`. Send a WhatChimp owner-review template with actual source, claim, media, audience and distribution summaries.
- Signed, expiring, authorization-checked review link with replay protection; mobile owner review shows full article, sources, warnings, media rights, previews, scores and distribution. Actions: publish, schedule, return, hold, reject, request research. Keep direct WhatsApp publish disabled unless separately authorized and secured.
- Post-publication owner confirmation using real delivery counts/statuses. Add inbound webhook infrastructure for safe future WhatsApp commands.
- User profiles with primary/secondary persona, interests, geography, follows, email choices and explicit consent. Relevance score blends configurable weights, importance, urgency, source confidence and explicit follows; explanations show “Why you're seeing this.”
- Free email modes: as-relevant, daily, weekly and opportunities-only. Build first-class DailyBrief, selected recipients, send previews, suppression/quiet rules, frequency caps, unsubscribe and delivery audit. Do not blast every article to every subscriber.
- Distribution dashboard with queued/sent/delivered/failed where provider evidence supports each status; retries, idempotency, opt-outs and provider outage handling.

**Exit evidence:** every publish action is attributable to an authorized human; owner review works on mobile; free deliveries match consent and preferences; duplicate jobs/webhooks cannot duplicate sends; a provider outage leaves recoverable state.

## Phase 10 — Premium billing and personalized WhatsApp

**Build**

- Premium onboarding: identity/contact, E.164 phone, country, personas, topics, regions, industry/opportunities, delivery style, separate WhatsApp and email consent. Explain service and controls plainly.
- Configurable KES plans/prices and billing periods, Paystack checkout, server-side payment verification, signed/replay-safe/idempotent webhooks, payment ledger, subscription state machine, grace/cancel/expire/restore and customer support reconciliation. No entitlement from client-side return URL alone.
- Keep subscription truth in MongoDB and synchronize necessary labels/contact IDs to WhatChimp. Never use provider labels as the entitlement source. Validate account-level WhatChimp send/template, opt-in, status and webhook behavior.
- MessagingProvider abstraction; persona-specific reusable summaries (not one model generation per subscriber), deterministic matching, Daily Brief/Essential/Active/Breaking Only, quiet hours, frequency caps, pause/resume/stop, opportunity matching and recipient-level suppression.
- Premium delivery queue with eligibility snapshot, template version, idempotency key, provider response, retries, failures, opt-outs and support tooling. If subscription lapses, stop Premium WhatsApp while retaining preferences and any independently consented free email.
- M-Pesa capability remains behind a payment abstraction; enable only after its collection **and renewal** mechanism is proven and operationally documented.

**Exit evidence:** end-to-end paid test covers activation, renewal or repeat payment, failure, cancellation, expiry and restoration; only eligible opted-in users receive relevant messages; user can stop delivery; billing and delivery records reconcile.

## Phase 11 — Advanced personalized intelligence

**Build**

- `/for-you` and follow/save flows across topics, companies, categories and opportunity types. Search across stories, topics, people, products, technologies and opportunities; add hybrid lexical/semantic ranking where measurements justify it.
- Reusable student, developer, founder, business owner, CEO and investor interpretations; show the reason for recommendations. Respect explicit user preferences and avoid sensitive-attribute inference.
- Trend detection from topic/entity/region velocity against baseline, source diversity and time windows; use AI to explain a measured pattern, not to fabricate a trend. Add newsroom trending queue and editorial suggestions.
- Better entity pages and knowledge links, previous coverage, improved media recommendation/placement, breaking-news eligibility and automatic expiry, regional and persona-specific briefs.
- Improve ranking from measured usefulness/opt-outs and editorial review while preserving explainability. Avoid endless-scroll and engagement-maximization loops.

**Exit evidence:** recommendations are explainable and controllable; trend alerts have reproducible counts/baselines; no stale breaking label or expired opportunity remains active; personalization improves relevance without increasing unwanted sends.

## Phase 12 — Production hardening and completion audit

**Build/verify**

- Security review: RBAC and object-level authorization, sessions, input/upload validation, sanitization, CSRF where relevant, rate limits, webhook signatures, secret rotation, headers/CORS, privacy/data deletion and retention, account recovery, audit integrity.
- Test matrix: auth, permissions, drafts/autosave/revisions, source/claim/citation mapping, quality gate, owner notification/link/replay, publish/schedule/corrections, source adapters/failures, queue retries, cluster/dedup, AI schema/RAG/evals, media rights/video removal, opportunity expiry, consent, email and WhatsApp selection, payment webhook idempotency, entitlement expiry and provider outages.
- Accessibility and performance review on actual mobile and slow connections; validate structured data, sitemap/feed, caching, image variants, database/search/vector indexes and pagination.
- Observability for app, database, Redis, queues, provider calls, AI usage/cost, distribution and source health. Alerts, backup/restore exercise, PM2 startup, Nginx/TLS, staging-to-production procedure, rollback and incident runbooks.
- Operational docs: README, local setup, architecture/data flow, environment inventory, indexes, workers, adapters, AI/routing/evals, WhatChimp, Resend, Paystack/M-Pesa decision, Cloudinary/media policy, citation system, editorial workflow, deployment, backups and troubleshooting.
- Content/operations review: genuine launch corpus, active authors, policy pages, source registry quality, correction procedure, consent text, pricing/support process and KPI dashboard. Remove fake integration states and critical TODOs.

**Exit evidence:** all agreed consumer requirements have passing checks or a documented, owner-approved later-phase exception; restore and rollback have been rehearsed; on-call/editorial procedures are usable; production has no known critical defects.

## Phase 13 — Future B2B expansion

Only after consumer usage and customer discovery justify it: organizations and teams, seats/roles, custom sector alerts, institutional briefs, research subscriptions, corporate intelligence, reports/events and an authenticated API. Design separate entitlements, billing, data access, audit, service levels and customer support. Keep sponsored products clearly disclosed and editorially independent.

**Exit evidence:** validated customer problem and paid pilot; isolation/permissions and billing are tested; B2B delivery does not compromise the public newsroom.

## Integration and account checklist

| Integration | Required inputs | Proof before release |
| --- | --- | --- |
| GitHub | Repository admin, branch protection/CI permissions | Clean clone, review and deploy path |
| Domain/Hostinger | DNS, VPS SSH, Ubuntu/Nginx/PM2, TLS | Staging and production deploy/rollback, health check |
| MongoDB Atlas | Project, cluster/search tier, DB user, network rules, backups | CRUD, Search/Vector indexes, backup restore |
| Redis | Production instance, persistence/security strategy | Worker recovery and retry test |
| OpenAI | API key, model access, budget, data controls | Structured task, embedding, routing/cost test |
| Cloudinary | Account, API credentials, upload preset/security | Rights-cleared upload and responsive delivery |
| Resend | Account, sending-domain DNS, API key, webhook secret | Auth mail, newsletter, unsubscribe/bounce test |
| WhatChimp/WhatsApp | Business connection, owner and sender numbers, approved templates, API/webhook credentials, consent text | Owner-review send, inbound/status callback, opt-out and Premium test |
| Paystack | Merchant verification, test/live keys, plans, webhook secret/URL | Payment/duplicate webhook/failed renewal reconciliation |
| Optional Google | OAuth client and redirect URIs | Sign-in/account-linking and permission tests |
| Source/media APIs | Approved source list, GitHub/YouTube or other keys where needed, licences | Rate/access/rights tests per adapter |

Do not store secrets in Source records or committed `.env` files. External-provider details and pricing must be checked again when each integration is implemented.

## Requirement coverage map

This maps the **140 sections of the master specification** into phases; a section may span multiple phases.

| Specification sections | Primary delivery phases |
| --- | --- |
| 1–5 product, positioning, principles, brand, design | 0, 2, 3, all reviews |
| 6–13 personas, categories, content, routes, home, article, references | 0, 2–4, 9–11 |
| 14–18 source graph/authority/network/adapters/social | 2, 4–6, 8 |
| 19–20 collector and queues | 1, 5–6, 12 |
| 21–28 AI gateway/routing/cost/embeddings/vector | 1, 7, 12 |
| 29–34 dedup/clusters/entities/knowledge/RAG/web research | 6–7, 11 |
| 35–40 verification/claims/research/citation/coverage | 4, 7–8 |
| 41–47 media, video and visual creation | 2, 4, 8 |
| 48–57 copilot/relevance/personas/trends/opportunities | 6–11 |
| 58–68 human gate/quality/WhatChimp/review/provider truth | 4, 9–10 |
| 69–78 free/Premium/email/brief/payments/subscriptions | 5, 9–10 |
| 79–87 newsroom/editor/revisions/corrections/authors/submissions | 3–6, 9 |
| 88–96 search/For You/follows/breaking/media/SEO/ads/monetization | 3, 5, 8, 11, 13 |
| 97–103 analytics/privacy/security/roles/audit | 0–1, 4–5, 9–12 |
| 104–110 stack/architecture/models/API/failures/observability | 1–2, 6–7, 9–12 |
| 111–121 performance/accessibility/mobile/seed/test/evals/env/deploy/health | 1–3, 5, 7, 12 |
| 122–124 build phases/initial launch/do not overbuild | milestones, 0–13 |
| 125–132 flywheel/architecture/editorial/media/citation/distribution rules | all phases, especially 4, 6–10 |
| 133–140 metrics/implementation/iteration/docs/quality/north star | 0–13 and each exit review |

## Definition of complete

The project is complete against the agreed **consumer product** scope when public publication, source-aware newsroom, reliable collection, research assistance, owner approval, selective free email, paid personalized WhatsApp, advanced intelligence and production operations all satisfy their exit gates. Phase 13 is the specification's future B2B expansion and has its own commercial decision gate. A launch date or repository size alone is never evidence of completion.
