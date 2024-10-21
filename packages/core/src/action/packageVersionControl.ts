import { readFileSync, writeFileSync } from "node:fs";
import consola from "consola";
import { type ReleaseType, inc } from "semver";
import { cmd } from "../utils/cmd";
import type { ReleaseSchemaType } from "../validation/validation";

export const packageVersionControl = ({
  level,
  pre,
  packageJsonPath,
}: Pick<ReleaseSchemaType, "level" | "pre"> & { packageJsonPath: string }) => {
  let packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));

  const currentVersion = cmd(`npm show ${packageJson.name} version`, {
    execOptions: {
      stdio: "pipe",
      encoding: "utf8",
    },
    successCallback: (stdout) => {
      return stdout.trim();
    },
    errorCallback: (error) => {
      consola.error(error.message);
      return packageJson.version;
    },
  });

  consola.info(`Current version: ${currentVersion}`);

  const getReleaseType = (): ReleaseType => {
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
      default: {
        return "patch";
      }
    }
  };
  const newVersion = inc(currentVersion, getReleaseType(), "beta");

  const versionUp = () => {
    packageJson.version = newVersion;
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));

    consola.info(`New version: ${packageJson.version}`);
  };

  const versionReset = () => {
    packageJson.version = currentVersion;
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));

    consola.info(`Reset version: ${packageJson.version}`);
  };

  return {
    packageName: packageJson.name as string,
    currentVersion,
    newVersion,
    versionUp,
    versionReset,
  };
};
