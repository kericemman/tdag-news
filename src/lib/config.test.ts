import assert from "node:assert/strict";
import test from "node:test";
import { readConfig } from "./config";

test("blank optional secrets do not block local staff bootstrap", () => {
  const config = readConfig({ APP_URL: "http://localhost:3000", NODE_ENV: "development", MONGODB_URI: "mongodb://localhost:27017/test", REDIS_URL: "", HEALTHCHECK_TOKEN: "  ", WHATCHIMP_API_KEY: "", PAYSTACK_SECRET_KEY: "" } as NodeJS.ProcessEnv);
  assert.equal(config.MONGODB_URI, "mongodb://localhost:27017/test");
  assert.equal(config.REDIS_URL, undefined);
  assert.equal(config.HEALTHCHECK_TOKEN, undefined);
});
