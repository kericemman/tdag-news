# TDAG News — approved project brief and delivery phases

This brief records the owner's decisions supplied on 2026-10-02. The master product specification remains the detailed feature and editorial reference. See [delivery-roadmap.md](delivery-roadmap.md) for the end-to-end build sequence and acceptance gates, and [phase-0-foundation.md](phase-0-foundation.md) for the current Phase 0 working decisions.

## Product identity and editorial control

| Field | Decision |
| --- | --- |
| Project | TDAG News |
| Parent brand | The Digital A-Game (TDAG) |
| Repository | https://github.com/kericemman/tdag-news |
| Production domain | https://news.thedigitalagame.com |
| Main site | https://thedigitalagame.com |
| Product | Technology News & Intelligence Publication |
| Markets | Kenya first; Africa second; global technology with strong African relevance |
| Language | English |
| Timezone | Africa/Nairobi for presentation; UTC for stored timestamps |
| Currency | KES |
| Default public byline | TDAG News Team |
| Responsible owner and Editor-in-Chief | Emmanuel Kerich |
| AI role | Research, classification, verification assistance, media discovery, relevance, summarization, editorial support |
| Publishing | Human owner/editor has final authority; automatic publishing disabled; no fake AI authors |
| Distribution | Free website and email; Premium personalized WhatsApp; no launch advertising |
| Premium price | Configurable; amount and billing period remain undecided |

## Approved technical baseline

- Next.js, TypeScript, Tailwind CSS and TipTap; secure account authentication with optional Google sign-in.
- MongoDB Atlas for operational data and MongoDB Vector Search for semantic search/RAG.
- Redis and BullMQ for background jobs; OpenAI accessed only through an internal AI Gateway.
- Cloudinary plus official, external or licensed media with rights and origin metadata.
- Resend for email; WhatChimp for WhatsApp owner review and eligible Premium delivery.
- Paystack initially, with an abstraction that can support M-Pesa later.
- Hostinger VPS, Nginx and PM2 for the application and workers.
- Modular monolith, separate web and worker processes, server-side authorization and an audit trail.

## Supplied logo asset

The owner supplied [`assets/brand/tdag-news-logo-original.png`](../assets/brand/tdag-news-logo-original.png) as the TDAG News logo reference. Preserve this original file. It is a 1774 × 887 PNG with a wide `A NEWS` mark, teal and navy coloring, white background, gradients and shadow. Use it for brand exploration and large placements where its detail remains legible. Before using it in the site header, mobile navigation or favicon, prepare separately approved simplified/transparent variants and check legibility at actual display sizes. Do not assume the white background is transparent.

## Typography baseline

Use Newsreader for editorial headlines, article text and pull quotes. Use Manrope for interface text, standfirsts, small cards and metadata. Sizes below are pixels, expressed as approved ranges for responsive design.

| Element | Font | Desktop | Mobile | Weight |
| --- | --- | --- | --- | --- |
| Lead headline | Newsreader | 56–64 | 38–44 | 600 |
| Article H1 | Newsreader | 52–60 | 36–42 | 600 |
| H2 | Newsreader | 32–36 | 27–30 | 600 |
| H3 | Newsreader | 24–27 | 22–24 | 600 |
| Standfirst | Manrope | 21–24 | 18–20 | 400–500 |
| Article body | Newsreader | 20 | 18 | 400 |
| Large card | Newsreader | 26–32 | 23–27 | 600 |
| Small card | Manrope | 17–19 | 16–18 | 600 |
| Section title | Manrope | 18–22 | 18–20 | 700 |
| Navigation | Manrope | 14–15 | 14–15 | 500–600 |
| Category | Manrope | 12 | 11–12 | 700 |
| Metadata | Manrope | 12–14 | 12–13 | 500 |
| Caption | Manrope | 12–13 | 12 | 400 |
| Pull quote | Newsreader | 30–36 | 25–29 | 500 |
| Button | Manrope | 14–15 | 14–15 | 600 |

These are design targets; verify line lengths, spacing, contrast and font loading on real mobile devices.

## Delivery phases and exit gates

### 0. Foundation and integration proofs

Define editorial rules, permissions, source and claim model, article states, audit events, launch content inventory and provider budgets. Verify account-level access for OpenAI, Atlas Search/Vector Search, Resend, Cloudinary, WhatChimp and Paystack. Prove the WhatChimp owner-review template and webhook path. Decide the initial Premium billing mechanism before implementing checkout.

**Exit:** architecture and editorial workflow are agreed, and critical provider capabilities are demonstrated in sandbox or live test accounts.

### 1. Public publication and human newsroom

Build the design system, public routes, articles, daily briefs, authors, category/topic navigation, search, policies, submissions, newsletter, CMS, roles, revision history, source-linked citations, corrections, media rights records and manual approval/publishing. Add a basic RSS/Atom collector and candidate inbox required for initial launch.

**Exit:** an editor can take a real candidate through source review, original drafting, citation checks and human publication; the public site performs well on mobile.

### 2. Newsroom intelligence engine

Expand the source registry and adapters; add scheduled collection, retries, deduplication, clusters, entities, claims, research packs, the AI Gateway, structured classification, embeddings, vector search and evaluation fixtures. Keep AI output advisory and traceable.

**Exit:** candidates are grouped around events, evidence and uncertainty are visible, and editors can reject or correct AI findings.

### 3. Approval and selective distribution

Add the quality gate, secure mobile owner-review page, WhatChimp owner notification, email delivery, consent and preference management, relevance rules, daily brief delivery, delivery logs and retry handling.

**Exit:** no story publishes or sends without the required human approval; each delivery has an eligibility reason and actual status.

### 4. Premium

Add configurable plans and prices, Paystack checkout and verified idempotent webhooks, TDAG-owned entitlements, WhatsApp opt-in, personalized brief selection, frequency controls, cancellation and expiry handling. Add M-Pesa only through a confirmed payment and renewal design.

**Exit:** a subscriber can join, pay, receive eligible briefings, pause or stop delivery, and lose or regain entitlement correctly.

### 5. Advanced intelligence; later B2B

Use measured demand to prioritize trend detection, persona variants, For You, richer entity pages and analytics. Build team and institution products only after separate commercial validation.

## Inputs still needed from the owner

1. Font licensing/hosting preference, initial authors and genuine launch content; confirm whether the supplied logo is the final public mark and obtain or approve small-format variants.
2. Approved source list and editorial/corrections/media-rights policy decisions.
3. Provider account access and credentials, supplied through a secure secret mechanism rather than committed files.
4. DNS and VPS access when deployment begins.
5. Premium price, billing period and choice of card-only recurring billing versus a separate M-Pesa renewal flow.
6. Approved WhatChimp templates, WhatsApp business setup and consent wording.

Do not read or commit existing `.env` files when setting up the repository.
