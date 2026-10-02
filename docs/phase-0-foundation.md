# Phase 0 — product and editorial foundation

Status: **in progress**, started 2026-10-02. This is an internal working document, not a published editorial or legal policy. It applies the owner's [project brief](project-brief.md) and [delivery roadmap](delivery-roadmap.md) to the 140-section master specification.

## 1. Decisions already confirmed

- TDAG News is an English-language technology news and intelligence publication serving Kenya first, Africa second, and covering global developments when relevant.
- Public reading is free. Free distribution is email. Premium distribution is personalized WhatsApp. No launch advertising.
- Emmanuel Kerich is Editor-in-Chief and responsible owner. **TDAG News Team** is the default public byline. AI does not receive a byline or final publishing authority.
- Automatic publishing is disabled. A human owner/editor makes the final publication decision. WhatChimp carries the owner-review message.
- Stack and providers: Next.js/TypeScript/Tailwind/TipTap; MongoDB Atlas and Vector Search; Redis/BullMQ; OpenAI behind an AI Gateway; Cloudinary; Resend; WhatChimp; Paystack; Hostinger VPS/Nginx/PM2.
- KES is the primary currency. Premium amount and billing interval are configurable and remain undecided. Google login is optional; M-Pesa integration is prepared, not assumed to be live.
- Brand palette and Newsreader/Manrope typography follow the master specification and project brief. The supplied logo is preserved as an original reference; compact variants are pending review.

## 2. Scope and traceable work packages

Priority: **L** = initial public launch; **C** = complete consumer product; **F** = future B2B. Each work package has a testable outcome. Detailed tasks live in the delivery roadmap.

| ID | Priority | Work package | Acceptance outcome | Spec sections |
| --- | --- | --- | --- | --- |
| TDAG-01 | L | Editorial identity and trust rules | Named owner, byline, source/correction/media/sponsorship rules visible and operational | 1–5, 12–15, 35–40, 85–86, 93–95, 128–130 |
| TDAG-02 | L | Design system and mobile publication | Approved typography/brand; required public routes, article and homepage work accessibly on mobile | 4–11, 89, 111–115 |
| TDAG-03 | L | Article/content model and CMS | Editors create all launch content types, preserve revisions, schedule and publish through role checks | 8–13, 58–59, 79–84, 102–103, 106–107 |
| TDAG-04 | L | Source graph and citations | Stored article/section/claim evidence renders as real inline references; unsupported claims are flagged | 12–15, 35–40, 130, 132 |
| TDAG-05 | L | Auth, permissions, audit and security | Server-side RBAC, secure sessions/uploads, action audit and protected newsroom | 79, 100–103, 117 |
| TDAG-06 | L | Basic collection and inbox | Approved RSS/Atom/manual sources yield normalized candidates with fetch health and duplicate checks | 16–20, 29–30, 81, 123 |
| TDAG-07 | L | Search, SEO and transparency | Public search, feeds/sitemaps/metadata, authors and required policy pages work | 88, 93–94, 123 |
| TDAG-08 | L | Free email and Daily Brief | Consent, preferences, unsubscribe, brief publication and traceable email delivery | 69–75, 133 |
| TDAG-09 | L | Submissions and opportunities | Safe submission intake and manually verified opportunity publication with expiry | 56–57, 87, 115–116 |
| TDAG-10 | C | Source adapters and event clustering | Permitted sources normalize into candidates; dedup groups evidence around events | 16–18, 20, 29–31 |
| TDAG-11 | C | AI Gateway and knowledge | Routed/validated/costed AI calls, embeddings, Atlas Vector Search, RAG and evals | 21–28, 32–34, 109, 118 |
| TDAG-12 | C | Research and verification assistance | Research packs, claim status, contradictions, citation checks and editor copilot are inspectable | 35–40, 48, 117–118 |
| TDAG-13 | C | Media intelligence | Rights/origin records, discovery, video, placement, conceptual generated visuals and clear labels | 41–47, 92, 129 |
| TDAG-14 | C | Owner approval | Quality gate, WhatChimp notice and secure mobile review require accountable human action | 58–68, 117 |
| TDAG-15 | C | Selective distribution and relevance | User preferences/personas/follows drive explainable email and WhatsApp eligibility | 49–54, 67–74, 89–90, 131–132 |
| TDAG-16 | C | Premium billing | Configurable plans, verified webhooks and TDAG-owned entitlement govern delivery | 69, 71–73, 76–78, 117 |
| TDAG-17 | C | Advanced intelligence | Trends, entity pages, For You, persona variants and expiring breaking states are measured | 31–32, 54–55, 88–91 |
| TDAG-18 | C | Operations and quality | Dashboards, privacy, observability, resilience, performance, tests, docs, deploy/restore | 97–121, 133–140 |
| TDAG-19 | F | B2B | Validated team/institution intelligence, entitlements and API without eroding editorial independence | 96, 122 |

**Scope rule:** initial launch requires TDAG-01 through TDAG-09. Full consumer completion requires TDAG-01 through TDAG-18. TDAG-19 requires separate commercial validation. The launch includes a *basic* collector and candidate inbox; advanced automated research is later.

## 3. Editorial operating rules — proposed for owner review

These rules translate the product specification into decisions developers can enforce. Emmanuel must confirm wording and thresholds before publication.

1. **Source classification.** PRIMARY (original official evidence), TRUSTED SECONDARY, SPECIALIST SECONDARY, DISCOVERY, USER SUBMITTED. The class is visible to editors and configurable; a discovery lead alone never confirms a story.
2. **Claim treatment.** For each material factual claim, store exact claim, linked supporting and contradicting documents, date checked, status and editor note. Company statements establish that the company made a claim; they do not independently prove performance or market-superiority claims.
3. **Risk tiers.** Routine official product facts can use their primary source with transparent attribution. Funding totals, employment impacts, security incidents, legal/regulatory claims, allegations and “first/biggest” claims need stronger independent or documentary support, with escalation when unresolved. Exact minimum counts are an open decision.
4. **Originality.** A draft is structured around the underlying event and TDAG's reporting/context, never a rewritten third-party article. Sources link to originals; copied images or text need rights or a permitted use basis.
5. **Uncertainty.** Important unknowns and contradictions remain visible. Statuses include unverified, partially verified, verified, contested, unsupported and obsolete. A quality-gate override must record actor, reason and timestamp.
6. **Media.** Prefer actual event or official media. Record origin, licence, attribution, rights and approval. Do not rehost third-party assets without rights. Generated conceptual art is internally tagged and publicly labelled where appropriate; it never portrays a fabricated real event.
7. **Publication.** Writer/researcher drafts; editor checks accuracy, references, headline, media and distribution; owner review occurs through a secure page following the WhatsApp notification. No direct publish command from WhatsApp in the initial system. Published work can be corrected or withdrawn with an audit trail.
8. **Corrections.** Preserve the original revision, record what changed and why, and display a public correction note for material factual changes. The precise prominence and notification threshold are open decisions.
9. **Submissions, embargoes and sponsorship.** Submission does not guarantee coverage. Embargoes require explicit acceptance. Sponsorship must be labelled and separated from editorial decisions; no ads at launch.
10. **Distribution.** Consent, current entitlement, explicit preferences, frequency caps and relevant story metadata govern every send. “Premium” means more relevant information, not more alerts. Opt-out overrides all campaign rules.

## 4. Workflow and responsibility map

Proposed status path: `IDEA → CANDIDATE → RESEARCHING → DRAFT → EDITORIAL_REVIEW → READY_FOR_REVIEW → OWNER_REVIEW → APPROVED → SCHEDULED/PUBLISHED`, with `HOLD`, `REJECTED`, `ARCHIVED` and `UPDATED` branches. `READY_FOR_REVIEW` requires the quality gate. `APPROVED` requires a named authorized human and audit record. Scheduling must not bypass approval.

| Action | Researcher | Writer | Editor | Owner/Super Admin | Distribution Manager | Analyst |
| --- | --- | --- | --- | --- | --- | --- |
| Add candidate/source evidence | Yes | Yes | Yes | Yes | No | Read |
| Create/edit draft | Notes only | Yes | Yes | Yes | No | No |
| Resolve claims/citations | Propose | Propose | Confirm | Confirm | No | Read |
| Change media rights approval | Propose | Propose | Confirm | Confirm | No | No |
| Move to editorial review | No | Request | Yes | Yes | No | No |
| Override quality warning | No | No | With reason, noncritical only | With reason | No | No |
| Approve for publication | No | No | Proposed only; see decision D-04 | Yes | No | No |
| Publish/unpublish/correct | No | No | Proposed only; see decision D-04 | Yes | No | No |
| Configure/send distribution | No | No | Preview | Authorize editorial content | Execute approved jobs | Read |
| Manage users/billing/AI routing | No | No | No | Yes | Limited subscription support | Read metrics only |

This is a **proposed least-privilege matrix**. Server-side checks and action-level audit are mandatory. D-04 resolves whether an Editor other than Emmanuel may have publish authority and under what conditions.

## 5. Public route and journey inventory

| Journey | Routes and expected result |
| --- | --- |
| Discover | `/`, `/latest`, `/ai`, `/africa`, `/kenya`, `/business`, `/startups`, `/products`, `/developers`, `/cybersecurity`, `/explainers`, `/opportunities` show curated and chronological coverage without fabricated Most Read data |
| Read | `/article/[slug]` (or clean equivalent), `/brief`, `/brief/[slug]` provide sourced reading, related coverage and clear publish/update dates |
| Explore | `/search`, `/topic/[slug]`, `/company/[slug]`, `/author/[slug]`, `/authors` expose real entities/authors and relevant coverage |
| Personalize | `/for-you`, `/login`, `/register`, `/account` support explicit preferences, saves/follows and honest signed-out states |
| Join/submit | `/premium`, `/submit` explain value/consent and accept independently reviewed submissions |
| Trust/support | `/about`, `/editorial-policy`, `/corrections`, `/contact`, `/privacy`, `/terms`, `/sponsored-content-policy` identify responsibility and reader controls |

Key end-to-end journeys to prototype: (1) reader finds article and opens original sources; (2) reader subscribes/changes email interests/unsubscribes; (3) researcher brings candidate to editor; (4) owner receives WhatsApp review and approves on mobile; (5) user pays, opts into WhatsApp, receives only eligible Premium messages, then pauses/cancels; (6) reader submits a lead; (7) editor issues a visible correction.

## 6. Launch content inventory — required, not yet supplied

| Content | Minimum launch preparation | Status |
| --- | --- | --- |
| Core editorial stories | Several genuinely reported, source-linked pieces spanning lead, Kenya/Africa, global-with-local-relevance and explainers | Missing |
| Daily Brief | At least one real, dated briefing using current verified sources | Missing |
| Opportunities | Only currently open, official-source-verified items with deadlines | Missing |
| Authors | Emmanuel profile; TDAG News Team description; any other real contributor profiles | Missing |
| Trust pages | About, editorial policy, corrections, privacy, terms, contact, sponsored-content policy | Drafting/approval pending |
| Brand | Supplied original logo present; compact/header/favicon variants and usage signoff | Partial |
| Media | Rights-cleared hero/inline assets with origin, captions and credits | Missing |
| Source registry | Initial official company, regulator, research and specialist sources selected and access checked | Missing |
| Newsletter | Welcome email, digest template, preference page and unsubscribe wording | Missing |
| Premium | Value proposition and consent copy; price withheld until decision | Missing |

Do not fill these gaps with fake reporting about real companies or unlicensed media. An empty state is preferable to invented coverage.

## 7. Measurement plan

| Metric | Definition to implement | Guardrail |
| --- | --- | --- |
| Returning readers | Readers with a later session in an agreed period | Privacy-preserving measurement; do not use as a clickbait target |
| Article completion | Reached final content section with reasonable dwell signal | Exclude bots and accidental scrolls; interpret cautiously |
| Source clicks | Visits to original linked evidence | Evaluate trust/usefulness, not outbound-click maximization |
| Newsletter growth/engagement | Confirmed subscribers, delivery, opens/clicks where measurable, unsubscribes | Consent and provider event reliability |
| Premium conversion/retention | Paid active users, renewal, churn and restoration | Use TDAG entitlement ledger, not provider label counts |
| Relevance quality | Eligible vs sent, saves, topic follows, muted topics, opt-outs | High opt-out or complaint rates trigger review |
| Editorial quality | Unsupported-claim flags, correction rate, time from candidate to verified publication | Speed cannot override verification |
| Source health | Successful polls, unique candidates, useful clusters, broken feeds | Avoid volume-only scoring |
| Operations/cost | Queue delays/failures, provider failures, AI cost per candidate/story/subscriber | Budget caps and alerting |

Instrumentation should record event definitions and consent behavior before dashboards are built. Set numeric targets only after baseline traffic and editorial capacity are known.

## 8. Open decision and dependency log

| ID | Decision/input | Proposed default or required action | Blocking phase |
| --- | --- | --- | --- |
| D-01 | Is the supplied logo the final public mark? | Use as reference; produce compact transparent/header/favicon variants for approval | 2–3 |
| D-02 | Initial editorial team and author biographies | Emmanuel + TDAG News Team until real contributors are named | 3–5 |
| D-03 | Exact corroboration/override thresholds and correction prominence | Apply risk-tier rule above; owner approves thresholds and public wording | 4 |
| D-04 | Who besides Emmanuel may approve/publish? | Owner-only at first; explicit delegated role later | 4, 9 |
| D-05 | Launch source registry | Owner/editor supplies or approves a curated Kenya/Africa/global official-source starter list | 5–6 |
| D-06 | Launch articles, Daily Brief and rights-cleared media | Editorial team supplies genuine content and asset provenance | 3–5 |
| D-07 | Provider credentials and account capabilities | Securely supply per environment; run account-level proofs, especially WhatChimp | 1, 5, 9–10 |
| D-08 | Premium price, billing cycle, refund and M-Pesa renewal method | Keep pricing configurable; card-based Paystack recurrence is a candidate, not a commitment | 10 |
| D-09 | WhatsApp templates, owner number and subscriber consent wording | Approve templates/consent; test send and webhook behavior | 9–10 |
| D-10 | DNS/VPS ownership and deployment access | Supply at deployment gate; establish staging first | 5, 12 |
| D-11 | Analytics/privacy policy wording and retention windows | Draft from actual data flows and review before launch | 5 |
| D-12 | Font hosting/licensing and final brand assets | Review before production design signoff | 2–3 |

Phase 0 work can proceed without credentials or final prices. No dependent integration may be marked complete until its proof and approval exist.

## 9. Phase 0 exit checklist

- [x] Confirm product identity, markets, language, authority, channels, stack and core design decisions from owner input.
- [x] Create phase plan and specification coverage map.
- [x] Create prioritized work-package backlog and acceptance outcomes.
- [x] Draft route map, user journeys, editorial rules, role matrix, content inventory and metrics.
- [ ] Owner confirms editorial policy thresholds, correction/override rules and publish delegation.
- [ ] Owner/editor provides or approves the initial source list and genuine launch content plan.
- [ ] Approve brand variants and final public policy wording.
- [ ] Confirm provider-account owners, test credentials and proof schedule.
- [ ] Confirm Premium billing design before checkout implementation; price can remain unset until that phase.

**Current gate:** Phase 0 is started and its working artifacts are ready for review. It is not signed off. Proceed with independent Phase 1 setup work while collecting the remaining owner inputs; do not treat unanswered decisions as authorization to publish or charge users.
