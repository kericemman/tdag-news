import assert from "node:assert/strict";
import test from "node:test";
import { newDraft } from "./story";
import { storyInputSchema } from "./story";
import { checkStoryQuality } from "./quality";

const sourceId = "11111111-1111-4111-8111-111111111111";
const claimId = "22222222-2222-4222-8222-222222222222";

function draft() {
  return newDraft({ slug: "verified-test-story", headline: "A verified test story", standfirst: "The context readers need.", type: "news", category: "ai", authorName: "TDAG News Team",
    document: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "The official announcement confirms the change." }] }] },
    sources: [{ id: sourceId, publisher: "Official source", title: "Announcement", url: "https://example.org/announcement", authority: "primary", accessState: "accessible", retrievedAt: new Date().toISOString() }],
    citations: [{ blockIndex: 0, sourceId }], claims: [{ id: claimId, text: "The change was announced", status: "verified", important: true, sourceIds: [sourceId] }],
  });
}

test("source-backed article passes the publication quality gate", () => {
  assert.deepEqual(checkStoryQuality(draft()), []);
});

test("unsupported claim, missing citation and uncleared image block review", () => {
  const story = draft();
  story.claims[0].status = "contested";
  story.citations = [];
  story.hero = { src: "https://example.org/image.jpg", alt: "An image", width: 800, height: 600, caption: "Image", credit: "Owner", rightsStatus: "pending" };
  const codes = checkStoryQuality(story).map((issue) => issue.code);
  assert.ok(codes.includes("unsupported_claim"));
  assert.ok(codes.includes("uncited_paragraph"));
  assert.ok(codes.includes("media_rights"));
});

test("editorial input rejects executable source URLs and invented bylines", () => {
  const story = draft();
  const input = { slug: story.slug, headline: story.headline, standfirst: story.standfirst, type: story.type, category: story.category, authorName: "AI Reporter", document: story.document, sources: [{ ...story.sources[0], url: "javascript:alert(1)" }], citations: story.citations, claims: story.claims };
  assert.equal(storyInputSchema.safeParse(input).success, false);
});
