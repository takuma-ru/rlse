import { join } from "node:path";
import consola from "consola";
import { ZodError } from "zod";
import { cmd } from "../utils/cmd";
import { releaseSchema } from "../validation/validation";
import { packageVersionUp } from "./packageVersionUp";
import { findPackageJsonByName } from "./findPackageJsonByName";

export const releaseAction = async (options: unknown) => {
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

  try {
    const { name, pre, level, buildCmd, dryRun } = releaseSchema.parse(options);

    const packageJsonPath = await findPackageJsonByName(name);
    if (!packageJsonPath) {
      throw consola.error(`package.json for ${name} not found`);
    }

    const { newVersion, packageName } = packageVersionUp({
      level,
      pre,
      packageJsonPath,
    });

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
            cmd("git reset --hard HEAD~");
            cmd(`git switch ${baseBranch}`);
            cmd(`git branch -D ${releaseBranch}`);
            cmd(`git push origin --delete ${releaseBranch}`);
          }

          return stdout;
        },
      }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return consola.error(error.errors.map((e) => e.message).join(", "));
    }

    cmd("git reset --hard HEAD~");
    cmd(`git switch ${baseBranch}`);
    cmd(`git branch -D ${releaseBranch}`);
    cmd(`git push origin --delete ${releaseBranch}`);

    consola.error(error);
    process.exit(1);
  }
};
