import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  chmodSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import test from "node:test";

import { cliPath, createTempProject, publicApiPath } from "./helpers.mts";

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

void test("npm release preset stops before publish when next version is already published", () => {
  const projectDir = createTempProject();
  const binDir = path.join(projectDir, "bin");
  const npmRecordPath = path.join(projectDir, "npm-record.jsonl");
  const originalPath = process.env.PATH;

  try {
    mkdirSync(binDir);
    writeFileSync(
      path.join(binDir, "npm"),
      `#!/usr/bin/env node
import { appendFileSync } from "node:fs";

const args = process.argv.slice(2);
appendFileSync(process.env.RLSE_TEST_NPM_RECORD, JSON.stringify(args) + "\\n");

if (args[0] === "show") {
  console.log("1.2.3");
  process.exit(0);
}

if (args[0] === "view" && args[1] === "rlse-config-version-fixture@1.3.0") {
  console.log("1.3.0");
  process.exit(0);
}

process.exit(1);
`,
    );
    chmodSync(path.join(binDir, "npm"), 0o755);
    process.env.PATH = `${binDir}${path.delimiter}${originalPath}`;
    process.env.RLSE_TEST_NPM_RECORD = npmRecordPath;

    writeFileSync(
      path.join(projectDir, "rlse.config.mjs"),
      `import { defineConfig, presets } from "${publicApiPath}";

export default defineConfig(
  presets.npmRelease({
    resolvePackage: { name: "rlse-config-version-fixture" },
    calculateNextSemver: { level: "minor" },
    commit: false,
    push: false,
  }),
);\n`,
    );

    assert.throws(
      () =>
        execFileSync("node", [cliPath], {
          cwd: projectDir,
          stdio: "pipe",
        }),
      /already published/,
    );

    const npmCalls = readFileSync(npmRecordPath, "utf8")
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line) as string[]);

    assert.deepEqual(npmCalls, [
      ["show", "rlse-config-version-fixture", "version"],
      ["view", "rlse-config-version-fixture@1.3.0", "version"],
    ]);
  } finally {
    process.env.PATH = originalPath;
    delete process.env.RLSE_TEST_NPM_RECORD;
    rmSync(projectDir, { recursive: true, force: true });
  }
});
