# TDAG News

Source-aware, human-controlled technology news and intelligence for Kenya, Africa and globally relevant developments. The public pages and editorial templates are implemented, but the publication is not live until approved content and its data source are connected.

## Requirements

- Node.js 22 or later and npm.
- MongoDB Atlas and Redis for database and worker integration. The public pages can run without them; the worker requires `REDIS_URL`.
- Provider accounts are added only as their modules are implemented. See [Phase 1 status](docs/phase-1-status.md).

## Local setup

1. Run `npm ci`.
2. Copy `.env.example` to an untracked `.env.local` and fill only the values needed for the feature under test. Never commit secrets. An existing `backend/.env` is deliberately ignored and has not been inspected.
3. Run `npm run dev` for the web application.
4. Run `npm run worker:dev` separately when Redis is configured.
5. Run `npm run check` before review.

Public liveness: `GET /api/health`. Internal readiness: `GET /api/internal/ready` with `x-healthcheck-token` matching `HEALTHCHECK_TOKEN`; it checks MongoDB and Redis without returning infrastructure details. Configure the internal check only over a trusted network or reverse proxy.

## Documentation

- [Approved project brief](docs/project-brief.md)
- [Complete delivery roadmap](docs/delivery-roadmap.md)
- [Phase 0 working decisions](docs/phase-0-foundation.md)
- [Phase 1 status and integration gates](docs/phase-1-status.md)
- [Phase 3 public publication status](docs/phase-3-status.md)

The target production architecture is a Next.js web process and a separate BullMQ worker behind Nginx on a Hostinger VPS, with MongoDB Atlas as the managed database. No source item or AI output can publish automatically.
