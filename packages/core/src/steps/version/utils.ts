import { type ReleaseType, inc } from "semver";
import { RlseStepError } from "../../flow/errors";
import type { ReleaseLevel } from "../../types/RlseConfig";
import type { PackageJson } from "../package/utils";
import type { VersionOptions } from "./types";

export const resolveNextVersion = ({
  currentVersion,
  packageJson,
  options,
  pre,
}: {
  currentVersion: string;
  packageJson?: PackageJson;
  options: VersionOptions;
  pre: boolean;
}) => {
  if (typeof options.version === "function") {
    if (!packageJson) {
      throw new RlseStepError("Package JSON is required for version resolver");
    }

    return options.version({
      currentVersion,
      packageJson: { ...packageJson },
      level: options.level,
      pre,
      inc,
    });
  }

  if (options.version) {
    return options.version;
  }

  const nextVersion = inc(
    currentVersion,
    getReleaseType(options.level, pre),
    "beta",
  );
  if (!nextVersion) {
    throw new RlseStepError(
      `Failed to increment version from ${currentVersion}`,
      {
        partialResult: {
          currentVersion,
          level: options.level,
          pre,
        },
      },
    );
  }

  return nextVersion;
};

const getReleaseType = (level?: ReleaseLevel, pre = false): ReleaseType => {
  switch (level) {
    case "patch": {
      if (pre) return "prepatch";
      return "patch";
    }
    case "minor": {
      if (pre) return "preminor";
      return "minor";
    }
    case "major": {
      if (pre) return "premajor";
      return "major";
    }
    case "preup": {
      return "prerelease";
    }
    case "fix": {
      throw new RlseStepError("Version is required for fix level");
    }
    case undefined: {
      throw new RlseStepError(
        "Release level is required when version is not configured",
      );
    }
  }
};
