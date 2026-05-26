import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import test from "node:test";

import { commitAll, createTempProject, importPublicApi } from "./helpers.mts";

void test("rolls back created git tags when a later step fails", async () => {
  const projectDir = createTempProject();

  try {
    commitAll(projectDir);

    const { runFlow, steps } = await importPublicApi();

    await assert.rejects(
      () =>
        runFlow(
          [
            steps.tag({ name: "v1.2.3" }),
            {
              name: "fail",
              run: () => {
                throw new Error("fail after tag");
              },
            },
          ],
          { cwd: projectDir },
        ),
      /fail after tag/,
    );

    const tags = execFileSync("git", ["tag", "--list", "v1.2.3"], {
      cwd: projectDir,
      encoding: "utf8",
    }).trim();

    assert.equal(tags, "");
  } finally {
    rmSync(projectDir, { recursive: true, force: true });
  }
});

void test("skips existing local git tags when requested", async () => {
  const projectDir = createTempProject();

  try {
    commitAll(projectDir);
    execFileSync("git", ["tag", "v1.2.3"], {
      cwd: projectDir,
      stdio: "pipe",
    });
    const tagBefore = execFileSync("git", ["rev-parse", "refs/tags/v1.2.3"], {
      cwd: projectDir,
      encoding: "utf8",
    }).trim();

    const { runFlow, steps } = await importPublicApi();
    const context = await runFlow(
      [steps.tag({ name: "v1.2.3", ifExists: "skip" })],
      { cwd: projectDir },
    );
    const tagAfter = execFileSync("git", ["rev-parse", "refs/tags/v1.2.3"], {
      cwd: projectDir,
      encoding: "utf8",
    }).trim();

    assert.deepEqual(context.results.findStep("tag"), {
      name: "v1.2.3",
      message: undefined,
      dryRun: false,
      tagged: false,
      skipped: true,
    });
    assert.equal(tagAfter, tagBefore);
  } finally {
    rmSync(projectDir, { recursive: true, force: true });
  }
});
