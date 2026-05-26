import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  cliPath,
  createTempProject,
  importPublicApi,
  publicApiPath,
} from "./helpers.mts";

void test("uses npm release preset", () => {
  const projectDir = createTempProject();

  try {
    writeFileSync(
      path.join(projectDir, "rlse.config.mjs"),
      `import { defineConfig, presets } from "${publicApiPath}";

export default defineConfig(
  presets.npmRelease({
    resolvePackage: { name: "rlse-config-version-fixture" },
    calculateNextSemver: { version: "3.0.0" },
    publishNpmPackage: false,
    commit: false,
    push: false,
  }),
);\n`,
    );

    execFileSync("node", [cliPath], {
      cwd: projectDir,
      stdio: "pipe",
    });

    const packageJson = JSON.parse(
      readFileSync(path.join(projectDir, "package.json"), "utf8"),
    );

    assert.equal(packageJson.version, "3.0.0");
  } finally {
    rmSync(projectDir, { recursive: true, force: true });
  }
});

void test("npm release preset includes publish safety checks by default", async () => {
  const { presets } = await importPublicApi();

  const flow = presets.npmRelease({
    resolvePackage: { name: "rlse-config-version-fixture" },
    calculateNextSemver: { version: "1.3.0" },
    commit: false,
    push: false,
  });

  assert.deepEqual(
    flow.map((step) => step.name),
    [
      "resolvePackage",
      "resolvePublishedVersion",
      "calculateNextSemver",
      "writePackageVersion",
      "checkNpmPackageVersionAvailable",
      "publishNpmPackage",
      "verifyPublishedNpmPackage",
    ],
  );
});
