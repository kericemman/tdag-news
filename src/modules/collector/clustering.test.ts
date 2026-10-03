import assert from "node:assert/strict";
import test from "node:test";
import { clusterKey, normalizedTitle, sameEventTitle } from "./clustering";

test("normalization removes punctuation and trivial words", () => {
  assert.equal(normalizedTitle("The Kenya AI Launch: A New Platform!"), "kenya ai launch new platform");
});

test("same-event grouping needs a strong title and close publication dates", () => {
  assert.equal(sameEventTitle("Kenya regulator publishes new mobile money rules", "Kenya regulator publishes new mobile-money rules", "2026-10-01T00:00:00Z", "2026-10-02T00:00:00Z"), true);
  assert.equal(sameEventTitle("Kenya regulator publishes new mobile money rules", "Kenya regulator publishes new mobile money rules", "2026-10-01T00:00:00Z", "2026-11-01T00:00:00Z"), false);
  assert.equal(sameEventTitle("AI funding rises", "AI funding rises", "2026-10-01T00:00:00Z", "2026-10-01T01:00:00Z"), false);
});

test("short headlines keep distinct URL identities", () => {
  assert.notEqual(clusterKey("AI funding rises", "https://a.example/1", "2026-10-01"), clusterKey("AI funding rises", "https://a.example/2", "2026-10-01"));
});
