import { valid } from "semver";
import { RlseStepError } from "../../flow/errors";
import type { RlseStep } from "../../flow/types";
import { resolveNextVersion } from "./utils";
import type { VersionOptions } from "./types";
import { resolveOption } from "../resolveOption";

export const calculateNextSemver = (options: VersionOptions): RlseStep => ({
  name: "calculateNextSemver",
  run: (context) => {
    const currentVersion = resolveOption(options.currentVersion, context);
    const packageJson = options.packageJson
      ? resolveOption(options.packageJson, context)
      : undefined;
    const pre = options.pre ?? false;

    const nextVersion = resolveNextVersion({
      currentVersion,
      packageJson,
      options,
      pre,
    });

    if (!nextVersion || !valid(nextVersion)) {
      throw new RlseStepError(`Invalid version: ${nextVersion}`, {
        partialResult: {
          currentVersion,
          nextVersion,
          level: options.level,
          pre,
        },
      });
    }

    return {
      currentVersion,
      nextVersion,
      level: options.level,
      pre,
    };
  },
});
