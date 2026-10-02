# Phase 2 — design system and domain contracts

Status: **in progress**.

## Implemented

- Approved brand colors and Newsreader/Manrope variable fonts are self-hosted; responsive editorial tokens and accessible base styles are in `src/app/globals.css`.
- A development-only representative article preview demonstrates headline, standfirst, metadata, body, context rail, callout, quote, source, media and correction-note placement. It is not published reporting and cannot render in production.
- Zod schemas for editorial status, content type, source authority, SourceDocument, Claim, EvidenceLink, Citation scope, MediaAsset, article sections and Article; plus user profile, preferences, subscription, candidate, cluster, entity, opportunity and audit records.
- Role-gated editorial state transitions with tests denying direct or unauthorized publication.
- Design and data-contract documents covering page patterns, route map, accessibility, aggregate ownership, MongoDB index plan and API boundaries.

## Verification to complete

- Completed `npm run check`: strict typecheck, four domain/workflow tests and production build pass.
- Inspected the development preview at 375/768/1024/1440px: document width stayed within viewport; reading layout changed from one column to two columns above 800px. Production preview route returned 404 while `/` returned 200.
- Complete keyboard navigation and screen-reader review across the final public and newsroom pages; the current preview is a limited design slice.
- Review source/claim/citation and article contracts with the editorial owner before collection persistence is built.
- Confirm whether the supplied logo is the final mark; approve compact transparent/header/favicon variants.
- Verify font licensing and final visual typography on actual devices.
- Sign off page patterns for homepage, category, search, account and mobile owner review; the representative article is only the first detailed implementation.

**Exit gate:** reviewed responsive prototypes, accessible component baseline, agreed schema/index/API contracts and a representative article at desktop/mobile sizes. Phase 2 remains open until the visual and editorial reviews occur.
