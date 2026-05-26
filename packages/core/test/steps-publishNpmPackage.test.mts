import assert from "node:assert/strict";
import {
  chmodSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import test from "node:test";

import { createTempProject, importPublicApi } from "./helpers.mts";

void test("temporarily writes dry-run publish version and restores package json", async () => {
  const projectDir = createTempProject();
  const binDir = path.join(projectDir, "bin");
  const npmRecordPath = path.join(projectDir, "npm-record.json");
  const packageJsonPath = path.join(projectDir, "package.json");
  const originalPath = process.env.PATH;
  const originalPackageJson = readFileSync(packageJsonPath, "utf8");

  try {
    mkdirSync(binDir);
    writeFileSync(
      path.join(binDir, "npm"),
      `#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const packageJson = JSON.parse(
  readFileSync(path.join(process.cwd(), "package.json"), "utf8"),
);

writeFileSync(
  process.env.RLSE_TEST_NPM_RECORD,
  JSON.stringify({ argv: process.argv.slice(2), version: packageJson.version }),
);
`,
    );
    chmodSync(path.join(binDir, "npm"), 0o755);
    process.env.PATH = `${binDir}${path.delimiter}${originalPath}`;
    process.env.RLSE_TEST_NPM_RECORD = npmRecordPath;

    const { runFlow, steps } = await importPublicApi();

    const context = await runFlow(
      [
        steps.publishNpmPackage({
          packageName: "rlse-config-version-fixture",
          packageDir: projectDir,
          dryRun: true,
          dryRunVersion: "9.9.9",
        }),
      ],
      { cwd: projectDir },
    );

    assert.equal(readFileSync(packageJsonPath, "utf8"), originalPackageJson);
    assert.deepEqual(JSON.parse(readFileSync(npmRecordPath, "utf8")), {
      argv: ["publish", "--dry-run"],
      version: "9.9.9",
    });
    assert.deepEqual(context.results.findStep("publishNpmPackage"), {
      packageName: "rlse-config-version-fixture",
      packageDir: projectDir,
      dryRun: true,
      dryRunVersion: "9.9.9",
      published: false,
    });
  } finally {
    process.env.PATH = originalPath;
    delete process.env.RLSE_TEST_NPM_RECORD;
    rmSync(projectDir, { recursive: true, force: true });
  }
});

void test("restores dry-run publish version when npm publish fails", async () => {
  const projectDir = createTempProject();
  const binDir = path.join(projectDir, "bin");
  const packageJsonPath = path.join(projectDir, "package.json");
  const originalPath = process.env.PATH;
  const originalPackageJson = readFileSync(packageJsonPath, "utf8");

  try {
    mkdirSync(binDir);
    writeFileSync(
      path.join(binDir, "npm"),
      `#!/usr/bin/env node
process.exit(1);
`,
    );
    chmodSync(path.join(binDir, "npm"), 0o755);
    process.env.PATH = `${binDir}${path.delimiter}${originalPath}`;

    const { runFlow, steps } = await importPublicApi();

    await assert.rejects(
      () =>
        runFlow(
          [
            steps.publishNpmPackage({
              packageName: "rlse-config-version-fixture",
              packageDir: projectDir,
              dryRun: true,
              dryRunVersion: "9.9.9",
            }),
          ],
          { cwd: projectDir },
        ),
      /Command failed/,
    );

    assert.equal(readFileSync(packageJsonPath, "utf8"), originalPackageJson);
  } finally {
    process.env.PATH = originalPath;
    rmSync(projectDir, { recursive: true, force: true });
  }
});
