import assert from "node:assert/strict";
import test from "node:test";

import { importPublicApi } from "./helpers.mts";

void test("skips npm publish verification after dry-run publish", async () => {
  const { runFlow, steps } = await importPublicApi();

  const context = await runFlow(
    [
      steps.verifyPublishedNpmPackage({
        packageName: "vanilla-ts",
        version: "0.0.1",
      }),
    ],
    {
      results: [
        {
          step: "publishNpmPackage",
          value: {
            packageName: "vanilla-ts",
            published: false,
          },
        },
      ],
    },
  );

  assert.deepEqual(context.results.findStep("verifyPublishedNpmPackage"), {
    packageName: "vanilla-ts",
    version: "0.0.1",
    dryRun: true,
    verified: false,
  });
});
