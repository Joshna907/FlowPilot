import assert from "node:assert/strict";
import test from "node:test";
import { executeDelay, executeFilter } from "./flowControl";

test("delay caps waits and returns configured duration", async () => {
  const startedAt = Date.now();
  const result = await executeDelay({ durationMs: 1 });

  assert.equal(result.durationMs, 1);
  assert.ok(Date.now() - startedAt < 100);
});

test("filter passes when values match", async () => {
  const result = await executeFilter({
    left: "paid",
    operator: "equals",
    right: "paid",
  });

  assert.equal(result.passed, true);
});

test("filter blocks when values do not match", async () => {
  const result = await executeFilter({
    left: "trial",
    operator: "equals",
    right: "paid",
  });

  assert.equal(result.passed, false);
});
