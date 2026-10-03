# Phase 4 — human newsroom CMS and trust system

## Implemented in this increment

- Password-based staff identity with scrypt hashes, random opaque 12-hour sessions stored by digest in MongoDB, HTTP-only Strict cookies, sign-in throttling, security events and a hidden-password staff bootstrap CLI. Roles: Super Admin, Editor, Writer, Researcher, Distribution Manager and Analyst. Editorial permissions are enforced in API handlers and write functions.
- Active story queues with counts and filters, a TipTap draft editor, 2.5-second autosave, manual save, expected-revision concurrency control, immutable revision snapshots and audit events. Revision history identifies changed fields and preserves saved body data.
- Story states from draft through editorial review, ready for owner review, owner review, approval, manual scheduling and publication. Only the Super Admin can approve, schedule or publish; a scheduled story still requires a manual owner publication action after its time. Discovered candidates cannot call this path.
- Source records and paragraph/quote/list citations stored with each story; important claim and evidence-source records. The quality gate blocks missing substantive body, inaccessible or weak sources, uncited body blocks, broken references, unsupported important claims and uncleared hero rights.
- A dedicated owner-only correction operation that preserves earlier revisions and adds a visible public notice. Public reads now query only `published`/`updated` records with a publication time and require `PUBLICATION_LIVE=true`.
- A validated submission intake with a honeypot, throttling and newsroom inbox. Editors can mark leads reviewing, accepted or rejected with an audit event. Intake is closed by default with `SUBMISSIONS_OPEN=false` until approved privacy language and operational review.
- Server-side input allowlists; TipTap JSON is converted into React-rendered article blocks without inserting raw HTML. Editorial URLs are restricted to HTTP(S). Admin responses are no-store/noindex with basic security headers.

## Setup and verification gates

1. Configure a **non-production** MongoDB Atlas replica set and provide `MONGODB_URI` through a local untracked environment or secret store. MongoDB transactions are required for story, revision and audit atomicity.
2. In an interactive terminal with `MONGODB_URI` available, create the single owner: `npm run staff:create -- --email=owner@example.com --name='Emmanuel Kerich' --role=super_admin`. Enter the password at the hidden prompt. Additional staff roles can be created by a trusted operator with the same command and an appropriate `--role`. This CLI must be limited to trusted operators with database access.
3. Exercise a real story through create, autosave, citation/claim checks, review, approval, publication and correction in staging. Verify conflict handling and role denial with separate staff accounts. No real content has been inserted by this implementation.
4. Keep `PUBLICATION_LIVE=false` and `SUBMISSIONS_OPEN=false` until the owner approves the first content, legal pages, source and media rights, and production launch.

## Outstanding Phase 4 work

- Atlas-backed end-to-end tests and a staging acceptance run require a confirmed non-production database and staff accounts. They have not been performed.
- Password reset, multi-factor authentication, optional Google sign-in, account administration, session revocation UI, comprehensive access logs and production Nginx rate limiting remain to be built and reviewed.
- The editor currently supports text, headings, emphasis, quotes, lists, citations and claims. Tables, callouts, document/video embeds, Cloudinary uploads, image positioning, SEO/email/WhatsApp previews and advanced source-panel workflows remain open. Media input is in the API contract but needs a reviewed rights-cleared upload flow.
- Sources and evidence links are story-local in this increment. A shared Source Graph, canonical SourceDocument records, provenance history, contradiction review and claim-level citation controls remain open.
- Submission attachments (press releases, media and documents), embargo handling policy, spam review, deletion/retention controls and final privacy text remain open. The form stays closed by default.
- The status gate checks core evidence and rights. Duplicate-event detection, source reachability checks, editorial override policy, SEO/distribution metadata, persona relevance and external legal/security escalation need explicit implementation before the full Phase 4 exit gate.

## Current verification

`npm run check` covers TypeScript, unit tests and a production build. Tests exercise role restrictions, password/session primitives, origin checks, input allowlists and quality gates. It does not prove Atlas transactions or a real login flow without configured infrastructure.
