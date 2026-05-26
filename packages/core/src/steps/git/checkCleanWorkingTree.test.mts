import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import test from "node:test";

import {
  commitAll,
  createTempProject,
  importPublicApi,
} from "../../test-helpers.mts";

void test("checks for a clean working tree", async () => {
  const projectDir = createTempProject();

  try {
    const { runFlow, steps } = await importPublicApi();

    await assert.rejects(
      () =>
        runFlow([steps.checkCleanWorkingTree()], {
          cwd: projectDir,
        }),
      /Working tree is not clean/,
    );

    commitAll(projectDir);

    const context = await runFlow([steps.checkCleanWorkingTree()], {
      cwd: projectDir,
    });

    assert.deepEqual(context.results.findStep("checkCleanWorkingTree"), {
      clean: true,
      allowUntracked: false,
    });
  } finally {
    rmSync(projectDir, { recursive: true, force: true });
  }
});
