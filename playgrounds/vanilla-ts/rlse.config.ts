import { defineConfig } from "@takuma-ru/rlse";

export default defineConfig({
  name: "vanilla-ts",
  level: "patch",
  pre: false,
  buildCmd: "pnpm build",
  gitUserName: "github-actions[bot]",
  gitUserEmail: "41898282+github-actions[bot]@users.noreply.github.com",
  dryRun: true,
  noRun: false,
});
