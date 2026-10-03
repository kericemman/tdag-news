import assert from "node:assert/strict";
import test from "node:test";
import { normalizeCandidateUrl, parseFeed } from "./feed";

test("RSS items normalize into source candidates", () => {
  const items = parseFeed('<?xml version="1.0"?><rss version="2.0"><channel><title>Updates</title><item><title>New API</title><link>https://example.org/update?utm_source=rss</link><guid>guid-1</guid><description>Details</description><pubDate>Thu, 01 Oct 2026 10:00:00 GMT</pubDate></item></channel></rss>');
  assert.equal(items.length, 1);
  assert.equal(items[0].canonicalUrl, "https://example.org/update");
  assert.equal(items[0].externalId, "guid-1");
  assert.ok(items[0].contentHash.length === 64);
});

test("Atom alternate links and dates are parsed", () => {
  const items = parseFeed('<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom"><entry><id>tag:example.org,2026:one</id><title>Release</title><link rel="alternate" href="https://example.org/release"/><updated>2026-10-01T10:00:00Z</updated></entry></feed>');
  assert.equal(items[0].canonicalUrl, "https://example.org/release");
  assert.equal(items[0].publishedAt, "2026-10-01T10:00:00.000Z");
});

test("feed parser rejects DTDs and non-web URLs", () => {
  assert.throws(() => parseFeed('<!DOCTYPE rss><rss/>'), /FEED_DTD_FORBIDDEN/);
  assert.equal(normalizeCandidateUrl("javascript:alert(1)"), null);
});
