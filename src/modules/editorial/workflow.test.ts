import assert from "node:assert/strict";
import test from "node:test";
import { citationSchema } from "./contracts";
import { mayTransition } from "./workflow";

test("only owner can authorize publication path", () => {
  assert.equal(mayTransition("owner_review", "approved", "editor"), false);
  assert.equal(mayTransition("owner_review", "approved", "owner"), true);
  assert.equal(mayTransition("approved", "published", "writer"), false);
  assert.equal(mayTransition("approved", "published", "owner"), true);
  assert.equal(mayTransition("candidate", "published", "owner"), false);
});

test("claim citations require an explicit claim target", () => {
  const base = { id: "citation-1", sourceDocumentId: "source-1", scope: "claim" };
  assert.equal(citationSchema.safeParse(base).success, false);
  assert.equal(citationSchema.safeParse({ ...base, claimId: "claim-1" }).success, true);
});
