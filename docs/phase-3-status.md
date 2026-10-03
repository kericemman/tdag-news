# Phase 3 — public publication and editorial templates

## Implemented

- Responsive homepage, category pages, search, brief index, article, brief, author, topic and company routes.
- Article renderer for structured text, citations, source list, corrections, image credit, and article JSON-LD. Empty or unknown records return a clear empty state or 404; no synthetic articles are published.
- About, editorial policy, corrections, authors, contact, privacy, terms, sponsored content, premium, submission, personalization and account information pages. Draft policy and unavailable product pages are clearly labeled and excluded from indexing.
- RSS feed, category RSS feeds, sitemap, Google News sitemap and robots rules. `PUBLICATION_LIVE=false` is the default; it blocks indexing and leaves public feeds empty. The News sitemap includes only published news from the previous 48 hours once real content is connected.
- Typed `PublicationRepository` boundary. Phase 4 now connects article reads to owner-published MongoDB records; briefs still return an honest empty state. When `PUBLICATION_LIVE=false`, the public article read returns no stories.

## Remaining gates before this phase can serve a live publication

1. Phase 4 must provide approved, versioned editorial records and connect the public read boundary to them. This includes publication status, embargoes, corrections, category/topic/company links, source records, image rights and canonical URLs.
2. The owner must approve final editorial policy, privacy, terms, corrections procedure, contact details and sponsored content wording. Draft pages remain `noindex` and must not appear in the sitemap until approved.
3. Supply the first fact-checked articles and briefs with licensed or official imagery, alt text, credits, captions and source links. No automatic publishing is allowed.
4. Configure production Cloudinary image hosts, caching and any image transformations once actual media URLs are known. Validate responsive rendering with real article lengths and media aspect ratios.
5. Verify live URL inspection, structured data, news sitemap eligibility, feed validity and robots behavior after `PUBLICATION_LIVE` is enabled for launch. The flag must stay false until the owner authorizes launch.

## Current verification

Run `npm run check`. The suite includes TypeScript, unit tests and a production Next.js build. Route smoke tests should cover homepage, category, information page, empty search, valid and invalid feed, robots, sitemaps and unknown article 404.
