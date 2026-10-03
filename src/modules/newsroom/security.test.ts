import assert from "node:assert/strict";
import test from "node:test";
import { hashPassword, newSessionToken, sameOrigin, tokenDigest, verifyPassword } from "./security";

test("password hashes and session tokens do not expose secrets", async () => {
  const hash = await hashPassword("a-long-staff-passphrase");
  assert.equal(await verifyPassword("a-long-staff-passphrase", hash), true);
  assert.equal(await verifyPassword("wrong-password", hash), false);
  const token = newSessionToken();
  assert.notEqual(token, tokenDigest(token));
});

test("mutations require the request origin", () => {
  assert.equal(sameOrigin(new Request("https://news.thedigitalagame.com/api/newsroom", { headers: { origin: "https://news.thedigitalagame.com" } })), true);
  assert.equal(sameOrigin(new Request("https://news.thedigitalagame.com/api/newsroom", { headers: { origin: "https://other.example" } })), false);
});
