import assert from "node:assert/strict";
import test from "node:test";

import { importPublicApi } from "./helpers.mts";

void test("skips github release creation during dry-run", async () => {
  const { runFlow, steps } = await importPublicApi();

  const context = await runFlow(
    [
      steps.githubRelease({
        tag: "v1.2.3",
        title: "Release v1.2.3",
        notes: "Test release",
      }),
    ],
    { dryRun: true },
  );

  assert.deepEqual(context.results.findStep("githubRelease"), {
    tag: "v1.2.3",
    title: "Release v1.2.3",
    notes: "Test release",
    draft: false,
    prerelease: false,
    dryRun: true,
    released: false,
  });
});
