import assert from "node:assert/strict";
import test from "node:test";

import { importPublicApi } from "../test-helpers.mts";

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

void test("rolls back completed steps after a later step fails", async () => {
  const { runFlow } = await importPublicApi();
  const events: string[] = [];

  await assert.rejects(
    () =>
      runFlow([
        {
          name: "prepare",
          run: () => {
            events.push("run:prepare");
          },
          rollback: () => {
            events.push("rollback:prepare");
          },
        },
        {
          name: "uploadAssets",
          run: () => {
            events.push("run:uploadAssets");
            throw new Error("upload unavailable");
          },
        },
        {
          name: "notify",
          run: () => {
            events.push("run:notify");
          },
        },
      ]),
    /Release flow failed at uploadAssets: upload unavailable/,
  );

  assert.deepEqual(events, [
    "run:prepare",
    "run:uploadAssets",
    "rollback:prepare",
  ]);
});

void test("keeps the original failure visible when rollback also fails", async () => {
  const { runFlow } = await importPublicApi();
  const events: string[] = [];

  await assert.rejects(
    () =>
      runFlow([
        {
          name: "first",
          run: () => {
            events.push("run:first");
          },
          rollback: () => {
            events.push("rollback:first");
          },
        },
        {
          name: "second",
          run: () => {
            events.push("run:second");
          },
          rollback: () => {
            events.push("rollback:second");
            throw new Error("cleanup failed");
          },
        },
        {
          name: "third",
          run: () => {
            events.push("run:third");
            throw new Error("publish failed");
          },
        },
      ]),
    /Release flow failed at third: publish failed/,
  );

  assert.deepEqual(events, [
    "run:first",
    "run:second",
    "run:third",
    "rollback:second",
    "rollback:first",
  ]);
});
