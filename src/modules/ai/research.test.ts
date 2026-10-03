import assert from "node:assert/strict";
import test from "node:test";
import { validateResearchSources } from "./research";

const output = {
  synopsis: "Two source leads appear to cover a product announcement; the details need confirmation.",
  sourceLeads: [{ candidateId: "known", relevance: "Potential primary announcement", caveat: "Publication date not confirmed" }],
  openQuestions: ["When will the product be available?"],
  kenyaAfricaAngle: "Not yet established from these leads.",
  suggestedNextSteps: ["Confirm with the official newsroom."],
};

test("research source references must match stored candidate IDs", () => {
  assert.deepEqual(validateResearchSources(output, ["known"]), output);
  assert.throws(() => validateResearchSources(output, ["different"]), /UNSUPPORTED_SOURCE_REFERENCE/);
});
