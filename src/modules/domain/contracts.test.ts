import assert from "node:assert/strict";
import test from "node:test";
import { subscriptionSchema, userProfileSchema } from "./contracts";

test("profile cannot duplicate its primary persona", () => {
  const result = userProfileSchema.safeParse({
    userId: "u-1", displayName: "Example Reader", primaryPersona: "developer",
    secondaryPersonas: ["developer"], updatedAt: "2026-10-02T00:00:00Z",
  });
  assert.equal(result.success, false);
});

test("subscription stores money in minor units with explicit state", () => {
  const result = subscriptionSchema.safeParse({
    id: "s-1", userId: "u-1", provider: "paystack", providerReference: "test-ref",
    planId: "plan-1", amountMinor: 99900, billingPeriod: "monthly",
    status: "active", updatedAt: "2026-10-02T00:00:00Z",
  });
  assert.equal(result.success, true);
  if (result.success) assert.equal(result.data.currency, "KES");
});
