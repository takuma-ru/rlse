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

  const result = context.results.findStep("publishPackages") as {
    tasks: Record<string, { status: string; value?: { packageName: string } }>;
  };

  assert.equal(maxActiveTasks, 2);
  assert.deepEqual(
    Object.values(result.tasks)
      .map((task) => task.value?.packageName)
      .sort((a, b) => String(a).localeCompare(String(b))),
    ["a", "b", "c"],
  );
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

  const result = context.results.findStep("dryRunParallel") as {
    dryRun: boolean;
  };

  assert.equal(ran, false);
  assert.equal(result.dryRun, true);
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

void test("reports task and rollback failures together", async () => {
  const { runFlow, steps } = await importPublicApi();
  const events: string[] = [];

  await assert.rejects(
    () =>
      runFlow([
        steps.parallel({
          name: "parallelRollbackFailure",
          concurrency: 1,
          tasks: [
            {
              name: "task:succeed",
              run: () => {
                events.push("run:succeed");
              },
              rollback: () => {
                events.push("rollback:succeed");
                throw new Error("rollback failed");
              },
            },
            {
              name: "task:fail",
              run: () => {
                events.push("run:fail");
                throw new Error("task failed");
              },
            },
          ],
        }),
      ]),
    /Parallel step parallelRollbackFailure failed for: task:fail; rollback failed for: task:succeed/,
  );

  assert.deepEqual(events, ["run:succeed", "run:fail", "rollback:succeed"]);
});
