import assert from "node:assert/strict";
import test from "node:test";
import { canEdit, canTransition } from "./policy";

test("only the owner can approve and publish", () => {
  assert.equal(canTransition("editor", "owner_review", "approved"), false);
  assert.equal(canTransition("writer", "approved", "published"), false);
  assert.equal(canTransition("super_admin", "owner_review", "approved"), true);
  assert.equal(canTransition("super_admin", "approved", "published"), true);
});

test("analysts and distribution managers cannot edit stories", () => {
  assert.equal(canEdit("analyst"), false);
  assert.equal(canEdit("distribution_manager"), false);
});
