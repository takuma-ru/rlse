import { Command } from "commander";
import { releaseAction } from "./action/releaseAction";

const program = new Command();

program
  .name("rlse")
  .description("Release npm package")
  .option("-n, --name <name>", "package name")
  .option("--pre", "Release new pre-release")
  .option("-l, --level <patch | minor | major | pre>", "release level")
  .option("-b, --build-cmd <cmd>", "build command")
  .option("--dry-run", "dry run")
  .action(async (options) => {
    releaseAction(options);
  });

program.parse();
