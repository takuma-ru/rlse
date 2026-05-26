import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { cliPath, createTempProject, publicApiPath } from "./test-helpers.mts";

void test("uses config-defined cli args in flow", () => {
  const projectDir = createTempProject();

  try {
    writeFileSync(
      path.join(projectDir, "rlse.config.mjs"),
      `import { defineConfig, steps, z } from "${publicApiPath}";

export default defineConfig({
  args: z.object({
    level: z.enum(["patch", "minor"]).default("patch").describe("Release level"),
  }),
  flow: ({ args }) => [
    steps.resolvePackage({ name: "rlse-config-version-fixture" }),
    steps.calculateNextSemver({
      currentVersion: ({ results }) =>
        results.findLast(({ step }) => step === "resolvePackage").value
          .packageJson.version,
      level: args.level,
    }),
    steps.writePackageVersion({
      packageJsonPath: ({ results }) =>
        results.findLast(({ step }) => step === "resolvePackage").value
          .packageJsonPath,
      version: ({ results }) =>
        results.findLast(({ step }) => step === "calculateNextSemver").value
          .nextVersion,
    }),
  ],
});\n`,
    );

    execFileSync("node", [cliPath, "--level", "minor"], {
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

void test("rejects config args that collide with built-in dry-run", () => {
  const projectDir = createTempProject();

  try {
    writeFileSync(
      path.join(projectDir, "rlse.config.mjs"),
      `import { defineConfig, z } from "${publicApiPath}";

export default defineConfig({
  args: z.object({
    dryRun: z.boolean().default(false),
  }),
  flow: () => [
    {
      name: "noop",
      run: () => undefined,
    },
  ],
});\n`,
    );

    assert.throws(
      () =>
        execFileSync("node", [cliPath], {
          cwd: projectDir,
          stdio: "pipe",
        }),
      /--dry-run is reserved by rlse/,
    );
  } finally {
    rmSync(projectDir, { recursive: true, force: true });
  }
});
