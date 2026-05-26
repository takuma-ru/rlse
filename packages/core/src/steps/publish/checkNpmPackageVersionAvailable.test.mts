import assert from "node:assert/strict";
import test from "node:test";

import { importPublicApi } from "../../test-helpers.mts";

void test("checks npm package version availability without noisy command errors", async () => {
  const { runFlow, steps } = await importPublicApi();

  const context = await runFlow([
    steps.checkNpmPackageVersionAvailable({
      packageName: "rlse-config-version-fixture-that-should-not-exist",
      version: "99.99.99",
    }),
  ]);

  assert.deepEqual(
    context.results.findStep("checkNpmPackageVersionAvailable"),
    {
      packageName: "rlse-config-version-fixture-that-should-not-exist",
      version: "99.99.99",
      available: true,
    },
  );
});
