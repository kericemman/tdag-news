import assert from "node:assert/strict";
import test from "node:test";
import { opportunityIsOpen } from "./opportunities";

test("opportunity deadline expires at the stated instant", () => {
  const now = new Date("2026-10-03T12:00:00Z");
  assert.equal(opportunityIsOpen("2026-10-03T15:01:00+03:00", now), true);
  assert.equal(opportunityIsOpen("2026-10-03T15:00:00+03:00", now), false);
  assert.equal(opportunityIsOpen("2026-10-03T14:59:00+03:00", now), false);
});
