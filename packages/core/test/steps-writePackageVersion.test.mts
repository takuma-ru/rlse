import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { cliPath, createTempProject, publicApiPath } from "./helpers.mts";

void test("uses version generator from rlse config", () => {
  const projectDir = createTempProject();

  try {
    writeFileSync(
      path.join(projectDir, "rlse.config.mjs"),
      `import { defineConfig, steps } from "${publicApiPath}";

export default defineConfig([
  steps.resolvePackage({ name: "rlse-config-version-fixture" }),
  steps.calculateNextSemver({
    currentVersion: ({ results }) =>
      results.findLast(({ step }) => step === "resolvePackage").value.packageJson
        .version,
    packageJson: ({ results }) =>
      results.findLast(({ step }) => step === "resolvePackage").value.packageJson,
    version: ({ currentVersion, inc }) => inc(currentVersion, "minor"),
  }),
  steps.writePackageVersion({
    packageJsonPath: ({ results }) =>
      results.findLast(({ step }) => step === "resolvePackage").value
        .packageJsonPath,
    version: ({ results }) =>
      results.findLast(({ step }) => step === "calculateNextSemver").value
        .nextVersion,
  }),
]);\n`,
    );

    execFileSync("node", [cliPath], {
      cwd: projectDir,
      stdio: "pipe",
    });

    const packageJson = JSON.parse(
      readFileSync(path.join(projectDir, "package.json"), "utf8"),
    );

    assert.equal(packageJson.version, "1.3.0");
  } finally {
    rmSync(projectDir, { recursive: true, force: true });
  }
});

void test("runs configured flow steps", () => {
  const projectDir = createTempProject();

  try {
    writeFileSync(
      path.join(projectDir, "rlse.config.mjs"),
      `import { defineConfig, steps } from "${publicApiPath}";

export default defineConfig([
  steps.resolvePackage({ name: "rlse-config-version-fixture" }),
  steps.calculateNextSemver({
    currentVersion: ({ results }) =>
      results.findLast(({ step }) => step === "resolvePackage").value.packageJson
        .version,
    version: "2.0.0",
  }),
  steps.writePackageVersion({
    packageJsonPath: ({ results }) =>
      results.findLast(({ step }) => step === "resolvePackage").value
        .packageJsonPath,
    version: ({ results }) =>
      results.findLast(({ step }) => step === "calculateNextSemver").value
        .nextVersion,
  }),
]);\n`,
    );

    execFileSync("node", [cliPath], {
      cwd: projectDir,
      stdio: "pipe",
    });

    const packageJson = JSON.parse(
      readFileSync(path.join(projectDir, "package.json"), "utf8"),
    );

    assert.equal(packageJson.version, "2.0.0");
  } finally {
    rmSync(projectDir, { recursive: true, force: true });
  }
});

void test("does not write package version during dry-run", async () => {
  const projectDir = createTempProject();

  try {
    writeFileSync(
      path.join(projectDir, "rlse.config.mjs"),
      `import { defineConfig, steps } from "${publicApiPath}";

export default defineConfig([
  steps.resolvePackage({ name: "rlse-config-version-fixture" }),
  steps.writePackageVersion({
    packageJsonPath: ({ results }) =>
      results.findStep("resolvePackage").packageJsonPath,
    version: "9.9.9",
  }),
]);\n`,
    );

    execFileSync("node", [cliPath, "--dry-run"], {
      cwd: projectDir,
      stdio: "pipe",
    });

    const packageJson = JSON.parse(
      readFileSync(path.join(projectDir, "package.json"), "utf8"),
    );

    assert.equal(packageJson.version, "1.2.3");
  } finally {
    rmSync(projectDir, { recursive: true, force: true });
  }
});
