import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import test from "node:test";

import { cliPath, createTempProject, packageRoot } from "./helpers.mts";

void test("loads TypeScript config", () => {
  const projectDir = createTempProject();

  try {
    mkdirSync(path.join(projectDir, "node_modules"), { recursive: true });
    symlinkSync(packageRoot, path.join(projectDir, "node_modules", "rlse.ts"));

    writeFileSync(
      path.join(projectDir, "rlse.config.ts"),
      `import { defineConfig, presets } from "rlse.ts";

export default defineConfig(
  presets.npmRelease({
    resolvePackage: { name: "rlse-config-version-fixture" },
    calculateNextSemver: { version: "4.0.0" },
    publishNpmPackage: false,
    commit: false,
    push: false,
  }),
);
`,
    );

    execFileSync("node", [cliPath], {
      cwd: projectDir,
      stdio: "pipe",
    });

    const packageJson = JSON.parse(
      readFileSync(path.join(projectDir, "package.json"), "utf8"),
    );

    assert.equal(packageJson.version, "4.0.0");
  } finally {
    rmSync(projectDir, { recursive: true, force: true });
  }
});

void test("loads TypeScript config in ESM project", () => {
  const projectDir = createTempProject();

  try {
    writeFileSync(
      path.join(projectDir, "package.json"),
      JSON.stringify(
        {
          name: "rlse-config-version-fixture",
          version: "1.2.3",
          type: "module",
        },
        null,
        2,
      ),
    );
    mkdirSync(path.join(projectDir, "node_modules"), { recursive: true });
    symlinkSync(packageRoot, path.join(projectDir, "node_modules", "rlse.ts"));

    writeFileSync(
      path.join(projectDir, "rlse.config.ts"),
      `import { defineConfig, presets } from "rlse.ts";

export default defineConfig(
  presets.npmRelease({
    resolvePackage: { name: "rlse-config-version-fixture" },
    calculateNextSemver: { version: "5.0.0" },
    publishNpmPackage: false,
    commit: false,
    push: false,
  }),
);
`,
    );

    execFileSync("node", [cliPath], {
      cwd: projectDir,
      stdio: "pipe",
    });

    const packageJson = JSON.parse(
      readFileSync(path.join(projectDir, "package.json"), "utf8"),
    );

    assert.equal(packageJson.version, "5.0.0");
  } finally {
    rmSync(projectDir, { recursive: true, force: true });
  }
});

void test("loads TypeScript config with extensionless relative import", () => {
  const projectDir = createTempProject();

  try {
    writeFileSync(
      path.join(projectDir, "package.json"),
      JSON.stringify(
        {
          name: "rlse-config-version-fixture",
          version: "1.2.3",
          type: "module",
        },
        null,
        2,
      ),
    );
    mkdirSync(path.join(projectDir, "node_modules"), { recursive: true });
    symlinkSync(packageRoot, path.join(projectDir, "node_modules", "rlse.ts"));

    writeFileSync(
      path.join(projectDir, "release-options.ts"),
      `export const releaseVersion = "6.0.0";
`,
    );
    writeFileSync(
      path.join(projectDir, "rlse.config.ts"),
      `import { defineConfig, presets } from "rlse.ts";
import { releaseVersion } from "./release-options";

export default defineConfig(
  presets.npmRelease({
    resolvePackage: { name: "rlse-config-version-fixture" },
    calculateNextSemver: { version: releaseVersion },
    publishNpmPackage: false,
    commit: false,
    push: false,
  }),
);
`,
    );

    execFileSync("node", [cliPath], {
      cwd: projectDir,
      stdio: "pipe",
    });

    const packageJson = JSON.parse(
      readFileSync(path.join(projectDir, "package.json"), "utf8"),
    );

    assert.equal(packageJson.version, "6.0.0");
  } finally {
    rmSync(projectDir, { recursive: true, force: true });
  }
});

void test("does not load CommonJS config", () => {
  const projectDir = createTempProject();

  try {
    writeFileSync(
      path.join(projectDir, "rlse.config.cjs"),
      `module.exports = [];
`,
    );

    assert.throws(
      () =>
        execFileSync("node", [cliPath], {
          cwd: projectDir,
          stdio: "pipe",
        }),
      /No configuration file found/,
    );
  } finally {
    rmSync(projectDir, { recursive: true, force: true });
  }
});
