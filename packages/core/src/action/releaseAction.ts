import consola from "consola";
import { cmd } from "../utils/cmd";
import { releaseSchema } from "../validation/validation";
import { findPackageJsonByName } from "./findPackageJsonByName";
import { packageVersionControl } from "./packageVersionControl";

const resetAction = ({
  baseBranch,
  releaseBranch,
}: {
  baseBranch: string;
  releaseBranch: string;
}) => {
  // cmd("git reset --hard HEAD~");
  cmd(`git switch ${baseBranch}`);
  cmd(`git branch -D ${releaseBranch}`);
  cmd(`git push origin --delete ${releaseBranch}`);
};

export const releaseAction = async (options: unknown) => {
  // == Validation ==
  const { data, error } = releaseSchema.safeParse(options);
  if (error) {
    consola.error(error.errors);
    process.exit(1);
  }
  const { name, pre, level, buildCmd, dryRun } = data;

  // == Package info ==
  const packageJsonPath = await findPackageJsonByName(name);
  if (!packageJsonPath) {
    consola.error(`package.json for ${name} not found`);
    process.exit(1);
  }

  const baseBranch = cmd("git branch --show-current", {
    execOptions: {
      stdio: "pipe",
      encoding: "utf8",
    },
    successCallback: (stdout) => stdout.trim(),
  });
  const releaseBranch = `release/${new Date()
    .toISOString()
    .replace(/[-:.]/g, "_")}`;

  const { newVersion, packageName, versionUp, versionReset } =
    packageVersionControl({
      level,
      pre,
      packageJsonPath,
    });

  // == Actions ==
  try {
    versionUp();

    cmd(`git switch -c ${releaseBranch}`, {
      successCallback: (stdout) => {
        consola.success(`Switched to ${releaseBranch}`);
        return stdout;
      },
    });
    cmd(`git push --set-upstream origin ${releaseBranch}`, {
      successCallback: (stdout) => {
        consola.success(`Pushed to ${releaseBranch}`);
        return stdout;
      },
    });

    cmd(buildCmd, {
      execOptions: {
        cwd: process.cwd(),
        encoding: "utf8",
      },
      successCallback: (stdout) => {
        consola.success("Build success");
        return stdout;
      },
    });

    cmd(`git add ${packageJsonPath}`, {
      successCallback: (stdout) => {
        consola.success(`Added ${packageJsonPath}`);
        return stdout;
      },
    });
    cmd(`git commit -m "Release ${packageName} ${newVersion}"`, {
      successCallback: (stdout) => {
        consola.success(`Committed ${packageName} ${newVersion}`);
        return stdout;
      },
    });
    cmd(`git push origin ${releaseBranch}`, {
      successCallback: (stdout) => {
        consola.success(`Pushed ${packageName} ${newVersion}`);
        return stdout;
      },
    });

    cmd(
      `pnpm publish --filter ${packageName} --no-git-checks ${
        dryRun ? "--dry-run" : ""
      }`,
      {
        successCallback: (stdout) => {
          consola.success(`Published ${packageName} ${newVersion}`);

          if (dryRun) {
            versionReset();
            resetAction({ baseBranch, releaseBranch });
          }

          return stdout;
        },
      }
    );
  } catch (error) {
    consola.error(error);
    versionReset();
    resetAction({ baseBranch, releaseBranch });
    process.exit(1);
  }
};
