import assert from "node:assert/strict";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { createTempProject, importPublicApi } from "../../test-helpers.mts";

void test("updates changelog and rolls it back when a later step fails", async () => {
  const projectDir = createTempProject();
  const changelogPath = path.join(projectDir, "CHANGELOG.md");

  try {
    writeFileSync(
      changelogPath,
      "# Changelog\n\n## 1.2.3 - 2024-01-01\n\n- Previous.\n",
    );

    const { runFlow, steps } = await importPublicApi();

    await assert.rejects(
      () =>
        runFlow(
          [
            steps.updateChangelog({
              version: "1.3.0",
              date: "2024-02-01",
              changes: ["Added release safety checks."],
            }),
            {
              name: "fail",
              run: () => {
                throw new Error("fail after changelog");
              },
            },
          ],
          { cwd: projectDir },
        ),
      /fail after changelog/,
    );

    assert.equal(
      readFileSync(changelogPath, "utf8"),
      "# Changelog\n\n## 1.2.3 - 2024-01-01\n\n- Previous.\n",
    );
  } finally {
    rmSync(projectDir, { recursive: true, force: true });
  }
});
