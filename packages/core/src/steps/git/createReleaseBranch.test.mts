import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import test from "node:test";

import {
  commitAll,
  createTempProject,
  importPublicApi,
} from "../../test-helpers.mts";

void test("restores base branch after skipping an existing release branch", async () => {
  const projectDir = createTempProject();

  try {
    commitAll(projectDir);
    execFileSync("git", ["branch", "release/1.2.3"], {
      cwd: projectDir,
      stdio: "pipe",
    });
    const branchBefore = execFileSync(
      "git",
      ["rev-parse", "refs/heads/release/1.2.3"],
      {
        cwd: projectDir,
        encoding: "utf8",
      },
    ).trim();

    const { runFlow, steps } = await importPublicApi();
    await assert.rejects(
      () =>
        runFlow(
          [
            steps.createReleaseBranch({
              branch: "release/1.2.3",
              ifExists: "skip",
            }),
            {
              name: "fail",
              run: () => {
                throw new Error("fail after branch skip");
              },
            },
          ],
          { cwd: projectDir },
        ),
      /fail after branch skip/,
    );

    const currentBranch = execFileSync("git", ["branch", "--show-current"], {
      cwd: projectDir,
      encoding: "utf8",
    }).trim();
    const branchAfter = execFileSync(
      "git",
      ["rev-parse", "refs/heads/release/1.2.3"],
      {
        cwd: projectDir,
        encoding: "utf8",
      },
    ).trim();

    assert.equal(currentBranch, "main");
    assert.equal(branchAfter, branchBefore);
  } finally {
    rmSync(projectDir, { recursive: true, force: true });
  }
});
