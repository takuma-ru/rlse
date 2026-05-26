import assert from "node:assert/strict";
import test from "node:test";

import { importPublicApi } from "./helpers.mts";

void test("builds rerunnable release branch names from environment variables", async () => {
  const previousRunId = process.env.GITHUB_RUN_ID;
  const previousRunAttempt = process.env.GITHUB_RUN_ATTEMPT;

  try {
    process.env.GITHUB_RUN_ID = "12345";
    process.env.GITHUB_RUN_ATTEMPT = "2";

    const { runFlow, steps } = await importPublicApi();
    const branch = steps.releaseBranchName({
      version: "1.2.3",
      suffix: steps.env(["GITHUB_RUN_ID", "GITHUB_RUN_ATTEMPT"]),
    });
    const context = await runFlow([
      {
        name: "branchName",
        run: (rlseContext) => branch(rlseContext),
      },
    ]);

    assert.equal(
      context.results.findStep("branchName"),
      "release/1.2.3-12345-2",
    );
  } finally {
    if (previousRunId === undefined) {
      delete process.env.GITHUB_RUN_ID;
    } else {
      process.env.GITHUB_RUN_ID = previousRunId;
    }

    if (previousRunAttempt === undefined) {
      delete process.env.GITHUB_RUN_ATTEMPT;
    } else {
      process.env.GITHUB_RUN_ATTEMPT = previousRunAttempt;
    }
  }
});

void test("respects empty release branch name options", async () => {
  const { runFlow, steps } = await importPublicApi();
  const branch = steps.releaseBranchName({
    version: "1.2.3",
    prefix: "",
    suffix: "",
    separator: "",
  });
  const context = await runFlow([
    {
      name: "branchName",
      run: (rlseContext) => branch(rlseContext),
    },
  ]);

  assert.equal(context.results.findStep("branchName"), "1.2.3-");
});
