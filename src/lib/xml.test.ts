import assert from "node:assert/strict";
import test from "node:test";
import { escapeXml } from "./xml";

test("XML feed values escape markup characters", () => {
  assert.equal(escapeXml(`A & B <C> "D" 'E'`), "A &amp; B &lt;C&gt; &quot;D&quot; &apos;E&apos;");
});
