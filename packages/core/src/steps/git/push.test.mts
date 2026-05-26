import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  commitAll,
  createTempProject,
  importPublicApi,
} from "../../test-helpers.mts";

void test("skips pushing existing git branches when requested", async () => {
  const projectDir = createTempProject();
  const remoteDir = mkdtempSync(path.join(tmpdir(), "rlse-remote-"));

  try {
    commitAll(projectDir);
    execFileSync("git", ["init", "--bare", remoteDir], {
      stdio: "pipe",
    });
    execFileSync("git", ["push", remoteDir, "main"], {
      cwd: projectDir,
      stdio: "pipe",
    });

    const { runFlow, steps } = await importPublicApi();
    const context = await runFlow(
      [steps.push({ branch: "main", remote: remoteDir, ifExists: "skip" })],
      { cwd: projectDir },
    );

    assert.deepEqual(context.results.findStep("push"), {
      branch: "main",
      remote: remoteDir,
      setUpstream: false,
      dryRun: false,
      pushed: false,
      skipped: true,
    });
  } finally {
    rmSync(projectDir, { recursive: true, force: true });
    rmSync(remoteDir, { recursive: true, force: true });
  }
});
