import assert from "node:assert/strict";
import test from "node:test";
import { publicAddress } from "./fetch";

test("collector rejects private and loopback network targets", () => {
  assert.equal(publicAddress("127.0.0.1"), false);
  assert.equal(publicAddress("10.10.10.10"), false);
  assert.equal(publicAddress("::1"), false);
  assert.equal(publicAddress("1.1.1.1"), true);
});
