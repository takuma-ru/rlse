import consola from "consola";
import { RlseStepError } from "../../flow/errors";
import type { RlseStep } from "../../flow/types";
import { cmdFile } from "../../utils/cmd";
import { resolveOption, type Resolvable } from "../resolveOption";

export const stageFiles = (options: {
  paths: Resolvable<string[]>;
}): RlseStep => ({
  name: "stageFiles",
  run: (context) => {
    const paths = resolveOption(options.paths, context);

    if (!paths.length) {
      throw new RlseStepError("Files must be provided before stageFiles", {
        partialResult: {
          paths,
          dryRun: context.dryRun,
          staged: false,
        },
      });
    }

    if (context.dryRun) {
      consola.info(`[dry-run] Skip git add ${paths.join(" ")}`);

      return {
        paths,
        dryRun: true,
        staged: false,
      };
    }

    cmdFile("git", ["add", ...paths], {
      execOptions: {
        cwd: context.cwd,
        encoding: "utf8",
      },
      successCallback: (stdout) => {
        consola.success(`Added ${paths.join(", ")}`);
        return stdout;
      },
    });

    return {
      paths,
      dryRun: false,
      staged: true,
    };
  },
});
