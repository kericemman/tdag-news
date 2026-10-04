# Core workflow audit and acceptance order

Status: **open**. This audit was made on 4 October 2026 against the local newsroom and the Phase 1–7 status records. A route loading or a build passing does not prove the workflow works with real data and providers. No phase should be marked complete on that basis.

## What was observed locally

| Area | Current result | Acceptance still needed |
| --- | --- | --- |
| Staff access | The seeded super admin signed in previously; protected routes were visible during the audit. The browser session later expired and returned to sign-in. | Repeat sign-in, expiry, sign-out, denial and recovery checks with staging accounts and production access rules. |
| Story dashboard | Overview, New story and the story queues load. The Atlas database currently shows zero stories. Queue totals now use database-wide counts and each queue queries the same statuses shown in its metric. | Create and move a real staging story through every state, including failed quality checks, concurrency conflict, publication and correction. |
| Sources and incoming | Routes load, but there are zero active sources and no incoming leads. | Approve a source after editorial and access review; observe fetch, deduplication, triage and failure recovery. |
| Collector health | The page reports that queue status is unavailable. | Connect Redis, run the worker, verify queue health, retries and replay. |
| Clusters, entities, opportunities and submissions | Routes load but have no records. Submissions remain closed by configuration. | Prove each with real approved source material after the source and worker path works; keep submissions closed until privacy and operational approval. |
| Public publication and email | Public launch and email signup remain disabled by configuration. | Approve content and policies, verify delivery providers, then conduct staging and launch acceptance before enabling them. |

## Prior phase gates that remain open

1. **Phase 1 — platform:** staging and production environments, branch protection, Atlas CRUD/index and backup restore, Redis queue proof, deployed web and worker, and account-level provider proofs. See [phase-1-status.md](phase-1-status.md).
2. **Phase 2 — design/contracts:** final owner review of responsive pages, logo variants, accessibility, schemas and editorial patterns. See [phase-2-status.md](phase-2-status.md).
3. **Phase 3 — publication:** owner-approved legal/editorial pages, real sourced articles and cleared media, live SEO/feed checks. `PUBLICATION_LIVE` must stay false until launch approval. See [phase-3-status.md](phase-3-status.md).
4. **Phase 4 — newsroom:** Atlas-backed create, edit, review, owner approval, publish and correction acceptance; role and session checks; account recovery/MFA; media rights workflow and remaining editor/source controls. See [phase-4-status.md](phase-4-status.md).
5. **Phase 5 — collection/distribution:** approved active sources, working Redis and worker, real fetch/retry proof, newsletter composition and test send, Resend verification, deployment and launch checks. See [phase-5-status.md](phase-5-status.md).
6. **Phase 6 — intelligence intake:** durable adapters and pipeline stages, entity/provenance links, cluster controls, opportunity extraction and staging failure tests. See [phase-6-status.md](phase-6-status.md).
7. **Phase 7 — AI support:** live OpenAI/Vector Search proof, evaluation fixtures, cost controls and retrieval provenance. This depends on the earlier source and editorial gates. See [phase-7-status.md](phase-7-status.md).

## Next acceptance sequence

1. **Story path:** use a non-production Atlas database and disposable staging story. Save a draft, revise it, attach source and citations, test quality blocks, send it through editorial and owner review, approve, schedule or publish manually, then publish a correction. Verify revision history and public visibility boundary. Confirm writer/editor denial for owner actions.
2. **Source path:** review and activate one permitted source. Start Redis and the worker, confirm a fetch creates an incoming candidate, and test pause, duplicate handling, outage, retry and replay. No candidate becomes a published story automatically.
3. **Distribution path:** verify Resend domain/webhook in staging, build and approve a newsletter briefing, test send and reconcile delivery/bounce/unsubscribe states. Keep signup closed until policy approval.
4. **Launch path:** complete account security, rights-cleared launch content, legal review, backups, monitoring, production private newsroom access, DNS/TLS and owner acceptance. Enable public flags only as an explicit launch action.
5. **Intelligence path:** once the source and story paths produce trustworthy records, exercise clustering, entities, opportunities, AI research and vector retrieval against reviewed examples.

The dashboard now puts the story and source paths first and groups later tools under **More tools**. Empty states indicate missing data or services rather than implying those features are complete.
