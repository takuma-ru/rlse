import { join } from "node:path";
import consola from "consola";
import { ZodError } from "zod";
import { cmd } from "../utils/cmd";
import { releaseSchema } from "../validation/validation";
import { findPackageJsonByName } from "./findPackageJsonByName";
import { packageVersionControl } from "./packageVersionUp";

const resetAction = ({
  baseBranch,
  releaseBranch,
}: {
  baseBranch: string;
  releaseBranch: string;
}) => {
  cmd("git reset --hard HEAD~");
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

  const baseBranch = cmd(`git branch --show-current`, {
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
  versionUp();

  cmd(`git switch -c ${releaseBranch}`);
  cmd(`git push --set-upstream origin ${releaseBranch}`);

  cmd(buildCmd);

  cmd(`git add ${join(__dirname, packageJsonPath)}`);
  cmd(`git commit -m "Release ${packageName} ${newVersion}"`);
  cmd(`git push origin ${releaseBranch}`);

  cmd(
    `pnpm publish --filter ${packageName} --no-git-checks ${
      dryRun ? "--dry-run" : ""
    }`,
    {
      successCallback: (stdout) => {
        if (dryRun) {
          versionReset();
          resetAction({ baseBranch, releaseBranch });
        }

        return stdout;
      },
    }
  );
};
