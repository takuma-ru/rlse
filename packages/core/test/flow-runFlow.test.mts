import assert from "node:assert/strict";
import test from "node:test";

import { importPublicApi } from "./helpers.mts";

void test("collects flow step results", async () => {
  const { runFlow } = await importPublicApi();

  const context = await runFlow([
    {
      name: "first",
      run: () => ({ ok: true }),
    },
    {
      name: "second",
      run: ({ results }) => ({ previousStep: results[0].step }),
    },
  ]);

  assert.deepEqual(context.results, [
    { step: "first", value: { ok: true } },
    { step: "second", value: { previousStep: "first" } },
  ]);
});

void test("finds latest flow step result value", async () => {
  const { runFlow } = await importPublicApi();

  const context = await runFlow([
    {
      name: "package",
      run: () => ({ packageName: "first" }),
    },
    {
      name: "package",
      run: () => ({ packageName: "latest" }),
    },
  ]);

  assert.equal(
    (context.results.findStep("package") as { packageName: string })
      .packageName,
    "latest",
  );
});

void test("throws when flow step result is missing", async () => {
  const { runFlow } = await importPublicApi();

  const context = await runFlow([]);

  assert.throws(
    () => context.results.findStep("missing"),
    /missing result was not found/,
  );
});

void test("wraps failed steps with partial results in a flow error", async () => {
  const { RlseFlowError, RlseStepError, runFlow } = await importPublicApi();
  const cause = new Error("upload unavailable");

  await assert.rejects(
    () =>
      runFlow([
        {
          name: "prepare",
          run: () => ({ prepared: true }),
          rollback: () => {},
        },
        {
          name: "uploadAssets",
          run: () => {
            throw new RlseStepError("Failed to upload assets", {
              cause,
              partialResult: {
                uploaded: ["dist/index.js"],
              },
            });
          },
        },
      ]),
    (error) => {
      assert.ok(error instanceof RlseFlowError);
      assert.equal(error.name, "RlseFlowError");
      assert.equal(error.failed.step, "uploadAssets");
      assert.equal(error.failed.status, "failed");
      assert.ok(error.failed.error instanceof RlseStepError);
      assert.equal(error.failed.error.cause, cause);
      assert.equal(Object.hasOwn(error, "cause"), true);
      assert.equal(Object.hasOwn(error.failed.error, "cause"), true);
      assert.equal(Object.keys(error).includes("cause"), false);
      assert.equal(Object.keys(error.failed.error).includes("cause"), false);
      assert.deepEqual(error.failed.partialResult, {
        uploaded: ["dist/index.js"],
      });
      assert.deepEqual(error.succeeded, [
        { step: "prepare", value: { prepared: true } },
      ]);
      assert.equal(
        (error.succeeded.findStep("prepare") as { prepared: boolean }).prepared,
        true,
      );
      assert.deepEqual(error.rollbacks, [
        {
          step: "prepare",
          status: "rolledBack",
          result: { step: "prepare", value: { prepared: true } },
        },
      ]);
      assert.deepEqual(error.rollbackFailures, []);

      return true;
    },
  );
});

void test("records rollback failures without replacing the original failure", async () => {
  const { RlseFlowError, runFlow } = await importPublicApi();
  const flowFailure = new Error("publish failed");
  const rollbackFailure = new Error("cleanup failed");

  await assert.rejects(
    () =>
      runFlow([
        {
          name: "first",
          run: () => ({ value: 1 }),
          rollback: () => {},
        },
        {
          name: "second",
          run: () => ({ value: 2 }),
          rollback: () => {
            throw rollbackFailure;
          },
        },
        {
          name: "third",
          run: () => {
            throw flowFailure;
          },
        },
      ]),
    (error) => {
      assert.ok(error instanceof RlseFlowError);
      assert.equal(error.failed.step, "third");
      assert.equal(error.failed.error, flowFailure);
      assert.deepEqual(error.succeeded, [
        { step: "first", value: { value: 1 } },
        { step: "second", value: { value: 2 } },
      ]);
      assert.deepEqual(error.rollbacks, [
        {
          step: "second",
          status: "rollbackFailed",
          result: { step: "second", value: { value: 2 } },
          error: rollbackFailure,
        },
        {
          step: "first",
          status: "rolledBack",
          result: { step: "first", value: { value: 1 } },
        },
      ]);
      assert.deepEqual(error.rollbackFailures, [
        {
          step: "second",
          status: "rollbackFailed",
          result: { step: "second", value: { value: 2 } },
          error: rollbackFailure,
        },
      ]);

      return true;
    },
  );
});
