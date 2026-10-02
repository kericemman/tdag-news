import assert from "node:assert/strict";
import test from "node:test";
import { renderRss } from "./rss";

test("RSS escapes editorial text and encodes article slugs", () => {
  const xml = renderRss("A & B", "<News>", [{ id: "1", slug: "a b", headline: "One < two", standfirst: "Tom & Jane", category: "AI", type: "news", authorName: "TDAG News Team", publishedAt: "2026-10-01T12:00:00.000Z" }]);
  assert.match(xml, /<title>A &amp; B<\/title>/);
  assert.match(xml, /<description>&lt;News&gt;<\/description>/);
  assert.match(xml, /<link>https:\/\/news\.thedigitalagame\.com\/article\/a%20b<\/link>/);
  assert.match(xml, /<title>One &lt; two<\/title>/);
});
