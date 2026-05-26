import { execSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

type PublicApi = typeof import("../src/main.ts");

export const packageRoot = path.resolve(import.meta.dirname, "..");
export const cliPath = path.join(packageRoot, "bin", "bin.js");
export const publicApiPath = pathToFileURL(
  path.join(packageRoot, "dist", "main.js"),
).href;

export const importPublicApi = async () => {
  return (await import(publicApiPath)) as PublicApi;
};

export const createTempProject = () => {
  const projectDir = mkdtempSync(path.join(tmpdir(), "rlse-test-"));

  writeFileSync(
    path.join(projectDir, "package.json"),
    JSON.stringify(
      {
        name: "rlse-config-version-fixture",
        version: "1.2.3",
      },
      null,
      2,
    ),
  );

  execSync("git init -b main", {
    cwd: projectDir,
    stdio: "pipe",
  });

  return projectDir;
};

export const commitAll = (projectDir: string) => {
  execSync("git add .", {
    cwd: projectDir,
    stdio: "pipe",
  });
  execSync(
    "git -c user.name=rlse-test -c user.email=rlse@example.com commit -m init",
    {
      cwd: projectDir,
      stdio: "pipe",
    },
  );
};
