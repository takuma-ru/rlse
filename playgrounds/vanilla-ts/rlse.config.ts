import { defineConfig } from "@takuma-ru/rlse";

export default defineConfig({
  isStopFlow: false,
  name: "vanilla-ts",
  level: "patch",
  pre: false,
  buildCmd: "pnpm build",
  dryRun: true,
  noRun: true,
});
