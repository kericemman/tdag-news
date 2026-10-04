import assert from "node:assert/strict";
import test from "node:test";
import { countStoryView, resolveStoryView } from "./views";

test("dashboard review and published links include every status in their totals", () => {
  const counts = { draft: 2, editorial_review: 1, ready_for_review: 2, owner_review: 3, approved: 1, published: 4, updated: 2 };
  assert.equal(countStoryView(counts, resolveStoryView("review").statuses), 7);
  assert.equal(countStoryView(counts, resolveStoryView("published").statuses), 6);
  assert.equal(countStoryView(counts, resolveStoryView("all").statuses), 15);
  assert.deepEqual(resolveStoryView(undefined, "editorial_review").statuses, ["editorial_review"]);
});
