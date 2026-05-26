import assert from "node:assert/strict";
import test from "node:test";

import { importPublicApi } from "./helpers.mts";

void test("runs parallel tasks with aggregate results", async () => {
  const { runFlow, steps } = await importPublicApi();
  let activeTasks = 0;
  let maxActiveTasks = 0;
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const context = await runFlow([
    steps.parallel({
      name: "publishPackages",
      concurrency: 2,
      tasks: ["a", "b", "c"].map((packageName) => ({
        name: `publish:${packageName}`,
        run: async () => {
          activeTasks += 1;
          maxActiveTasks = Math.max(maxActiveTasks, activeTasks);
          await sleep(5);
          activeTasks -= 1;
          return { packageName };
        },
      })),
    }),
  ]);

  assert.equal(maxActiveTasks, 2);
  assert.deepEqual(context.results.findStep("publishPackages"), {
    ok: true,
    dryRun: false,
    concurrency: 2,
    taskCount: 3,
    tasks: {
      "publish:a": {
        name: "publish:a",
        status: "succeeded",
        value: { packageName: "a" },
      },
      "publish:b": {
        name: "publish:b",
        status: "succeeded",
        value: { packageName: "b" },
      },
      "publish:c": {
        name: "publish:c",
        status: "succeeded",
        value: { packageName: "c" },
      },
    },
    succeededTaskNames: ["publish:a", "publish:b", "publish:c"],
    failedTaskNames: [],
    skippedTaskNames: [],
  });
});

void test("skips parallel tasks during dry-run", async () => {
  const { runFlow, steps } = await importPublicApi();
  let ran = false;

  const context = await runFlow(
    [
      steps.parallel({
        name: "dryRunParallel",
        tasks: [
          {
            name: "task:a",
            run: () => {
              ran = true;
            },
          },
        ],
      }),
    ],
    { dryRun: true },
  );

  assert.equal(ran, false);
  assert.deepEqual(context.results.findStep("dryRunParallel"), {
    ok: true,
    dryRun: true,
    concurrency: 1,
    taskCount: 1,
    tasks: {
      "task:a": {
        name: "task:a",
        status: "skipped",
      },
    },
    succeededTaskNames: [],
    failedTaskNames: [],
    skippedTaskNames: ["task:a"],
  });
});

void test("rolls back successful parallel tasks on failure", async () => {
  const { runFlow, steps } = await importPublicApi();
  const events: string[] = [];

  await assert.rejects(
    () =>
      runFlow([
        steps.parallel({
          name: "parallelFailure",
          concurrency: 1,
          tasks: [
            {
              name: "task:first",
              run: () => {
                events.push("run:first");
                return "first-result";
              },
              rollback: (_, result) => {
                events.push(`rollback:${result.step}:${String(result.value)}`);
              },
            },
            {
              name: "task:second",
              run: () => {
                events.push("run:second");
                throw new Error("second failed");
              },
            },
            {
              name: "task:third",
              run: () => {
                events.push("run:third");
              },
            },
          ],
        }),
      ]),
    /Parallel step parallelFailure failed for: task:second/,
  );

  assert.deepEqual(events, [
    "run:first",
    "run:second",
    "rollback:task:first:first-result",
  ]);
});

void test("does not start queued parallel tasks after observing a failure", async () => {
  const { runFlow, steps } = await importPublicApi();
  const events: string[] = [];

  await assert.rejects(
    () =>
      runFlow([
        steps.parallel({
          name: "parallelFailFast",
          concurrency: 2,
          tasks: [
            {
              name: "task:succeed",
              run: () => {
                events.push("run:succeed");
                return "succeed-result";
              },
              rollback: (_, result) => {
                events.push(`rollback:${result.step}:${String(result.value)}`);
              },
            },
            {
              name: "task:fail",
              run: () => {
                events.push("run:fail");
                return Promise.reject(new Error("fail rejected"));
              },
            },
            {
              name: "task:queued",
              run: () => {
                events.push("run:queued");
              },
            },
          ],
        }),
      ]),
    /Parallel step parallelFailFast failed for: task:fail/,
  );

  assert.deepEqual(events, [
    "run:succeed",
    "run:fail",
    "rollback:task:succeed:succeed-result",
  ]);
});

void test("includes rollback failures in parallel task errors", async () => {
  const { RlseFlowError, RlseStepError, runFlow, steps } =
    await importPublicApi();

  await assert.rejects(
    () =>
      runFlow([
        steps.parallel({
          name: "parallelRollbackFailure",
          concurrency: 1,
          tasks: [
            {
              name: "task:succeed",
              run: () => "succeed-result",
              rollback: () => {
                throw new Error("rollback failed");
              },
            },
            {
              name: "task:fail",
              run: () => {
                throw new Error("task failed");
              },
            },
          ],
        }),
      ]),
    (error) => {
      assert.ok(error instanceof RlseFlowError);
      assert.equal(error.failed.step, "parallelRollbackFailure");
      assert.ok(error.failed.error instanceof RlseStepError);
      assert.ok(error.failed.error.cause instanceof AggregateError);
      assert.match(
        error.failed.error.cause.message,
        /Parallel step parallelRollbackFailure failed for: task:fail; rollback failed for: task:succeed/,
      );
      assert.equal(error.failed.error.cause.errors.length, 2);
      assert.deepEqual(error.failed.partialResult.failedTaskNames, [
        "task:fail",
      ]);
      assert.deepEqual(error.failed.partialResult.succeededTaskNames, [
        "task:succeed",
      ]);

      return true;
    },
  );
});
