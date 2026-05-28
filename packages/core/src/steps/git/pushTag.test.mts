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

void test("rolls back pushed git tags when a later step fails", async () => {
  const projectDir = createTempProject();
  const remoteDir = mkdtempSync(path.join(tmpdir(), "rlse-remote-"));

  try {
    commitAll(projectDir);
    execFileSync("git", ["init", "--bare", remoteDir], {
      stdio: "pipe",
    });

    const { runFlow, steps } = await importPublicApi();

    await assert.rejects(
      () =>
        runFlow(
          [
            steps.tag({ name: "v1.2.3" }),
            steps.pushTag({ tag: "v1.2.3", remote: remoteDir }),
            {
              name: "fail",
              run: () => {
                throw new Error("fail after push tag");
              },
            },
          ],
          { cwd: projectDir },
        ),
      /fail after push tag/,
    );

    const remoteTags = execFileSync(
      "git",
      ["--git-dir", remoteDir, "tag", "--list", "v1.2.3"],
      {
        encoding: "utf8",
      },
    ).trim();
    const localTags = execFileSync("git", ["tag", "--list", "v1.2.3"], {
      cwd: projectDir,
      encoding: "utf8",
    }).trim();

    assert.equal(remoteTags, "");
    assert.equal(localTags, "");
  } finally {
    rmSync(projectDir, { recursive: true, force: true });
    rmSync(remoteDir, { recursive: true, force: true });
  }
});

void test("skips pushing git tags during dry-run", async () => {
  const { runFlow, steps } = await importPublicApi();

  const context = await runFlow(
    [steps.pushTag({ tag: "v1.2.3", remote: "origin" })],
    { dryRun: true },
  );

  assert.deepEqual(context.results.findStep("pushTag"), {
    tag: "v1.2.3",
    remote: "origin",
    dryRun: true,
    pushed: false,
    skipped: false,
  });
});

void test("skips pushing existing git tags when requested", async () => {
  const projectDir = createTempProject();
  const remoteDir = mkdtempSync(path.join(tmpdir(), "rlse-remote-"));

  try {
    commitAll(projectDir);
    execFileSync("git", ["init", "--bare", remoteDir], {
      stdio: "pipe",
    });
    execFileSync("git", ["tag", "v1.2.3"], {
      cwd: projectDir,
      stdio: "pipe",
    });
    execFileSync("git", ["push", remoteDir, "refs/tags/v1.2.3"], {
      cwd: projectDir,
      stdio: "pipe",
    });

    const { runFlow, steps } = await importPublicApi();
    const context = await runFlow(
      [steps.pushTag({ tag: "v1.2.3", remote: remoteDir, ifExists: "skip" })],
      { cwd: projectDir },
    );

    assert.deepEqual(context.results.findStep("pushTag"), {
      tag: "v1.2.3",
      remote: remoteDir,
      dryRun: false,
      pushed: false,
      skipped: true,
    });
  } finally {
    rmSync(projectDir, { recursive: true, force: true });
    rmSync(remoteDir, { recursive: true, force: true });
  }
});
