# Phase 5 status

Phase 5 implementation is in progress. This document distinguishes working code from launch readiness.

## Implemented

- Staff source registry with proposal, editor activation/pause, fetch schedule, authority, geography, topics and access notes.
- Approved RSS/Atom fetch worker, bounded feed parsing, candidate normalization and deduplication, fetch history and failure backoff. Manual candidate entry and incoming triage are available in the newsroom.
- Three illustrative source proposals in `scripts/propose-sources.ts`. They are **not** approved, active or installed automatically.
- Free email signup with explicit consent, confirmation token, welcome email, unsubscribe flow and Resend webhook processing. Signup is off by default (`EMAIL_SIGNUP_OPEN=false`).
- Email delivery and subscriber records in MongoDB. Bounce and complaint events suppress further sends.
- Public search already uses the published-story boundary and a MongoDB text index over headlines and standfirsts. It needs relevance and filter acceptance against real content.

## Still required for Phase 5 completion

1. Configure and test MongoDB Atlas, Redis, Resend domain verification, webhook signing, production `APP_URL`, and email token secret in staging. Do not commit secrets.
2. Review each proposed source's URL, reliability, usage terms and editorial value before activating. Run the worker and observe successful fetches and failure handling against real feeds.
3. Add staff controlled newsletter composition, test send, recipient selection, send approval, queueing and delivery reconciliation. The present email flow covers subscription only; it does not send a briefing.
4. Validate public search relevance against real stories and add the planned topic, author and opportunity filters.
5. Finish legal and public policy pages with owner approved text; prepare real original stories, image rights and corrections workflow acceptance.
6. Perform staging acceptance across signup, confirmation, unsubscribe, webhook, collector, editor and publication with real provider credentials. Add monitoring, backups and restore verification.
7. Configure Hostinger VPS, Nginx, TLS, DNS, deployment process and production health checks for `news.thedigitalagame.com`; obtain final owner launch approval.

## Known implementation limits

- Feed URL validation checks DNS before the HTTP request, but the HTTP client may resolve DNS again. Address this DNS rebinding window before broadening source activation beyond a small trusted list.
- Email provider calls are idempotent through Resend keys, but the local database and provider are not one transaction. Reconcile interrupted sends and webhook events during staging.
- The simple welcome email has no preference center. A frequency setting exists in the data model but is not exposed or used to send briefings yet.
- Launch has not been verified, and the site is not claimed live.
