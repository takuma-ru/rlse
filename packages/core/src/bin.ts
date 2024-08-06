import { Command } from "commander";

import { releaseAction } from "./action/releaseAction";
import { loadRlseConfig } from "./config/loadRlseConfig";

const program = new Command();

program
  .name("rlse")
  .description("Release npm package")
  .option("-n, --name <name>", "package name")
  .option("--pre", "Release new pre-release")
  .option("-l, --level <patch | minor | major | pre>", "release level")
  .option("-c, --build-cmd <cmd>", "build command")
  .option("--git-user-name <name>", "git config --local user.name <name>")
  .option("--git-user-email <email>", "git config --local user.email <email>")
  .option("--dry-run", "dry run")
  .option("--no-run", "no run")
  .action(async (options) => {
    const optionFromFile = await loadRlseConfig();
    const mergedOptions = { ...optionFromFile, ...options };
    releaseAction(mergedOptions);
  });

program.parse();
