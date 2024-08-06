import { execSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFile,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { cwd } from "node:process";
import { promisify } from "node:util";

const promisifyReadFile = promisify(readFile);
const configFiles = [
  "rlse.config.ts",
  "rlse.config.js",
  "rlse.config.mjs",
  "rlse.config.cjs",
  "rlse.config.json",
];

export const loadRlseConfig = async () => {
  for (const file of configFiles) {
    const filePath = path.resolve(cwd(), file);
    if (existsSync(filePath)) {
      const ext = path.extname(file);
      switch (ext) {
        case ".ts": {
          // TypeScriptファイルの処理
          return await importTypeScriptConfig(filePath);
        }

        case ".js":
        case ".mjs":
        case ".cjs": {
          // JavaScriptファイルの処理
          return require(filePath);
        }

        case ".json": {
          // JSONファイルの処理
          const content = await promisifyReadFile(filePath, "utf-8");
          return JSON.parse(content);
        }

        default: {
          throw new Error(`Unsupported file extension: ${ext}`);
        }
      }
    }
  }
  throw new Error("No configuration file found");
};

const importTypeScriptConfig = async (filePath: string) => {
  const tempDir = path.resolve(cwd(), ".temp");
  const tempFilePath = path.resolve(tempDir, "rlse.config.js");
  const customTsConfigPath = path.resolve(tempDir, "tsconfig.json");

  // 一時ディレクトリが存在しない場合は作成する
  try {
    mkdirSync(tempDir, { recursive: true });
  } catch (error) {
    console.error("Error creating temporary directory:", error);
    throw error;
  }

  // カスタムのtsconfig.jsonを作成
  writeFileSync(
    customTsConfigPath,
    JSON.stringify({
      compilerOptions: {
        target: "ES2022",
        useDefineForClassFields: true,
        module: "ESNext",
        lib: ["ESNext", "DOM", "DOM.Iterable", "ES2022"],
        skipLibCheck: true,
        noErrorTruncation: true,

        /* Bundler mode */
        moduleResolution: "bundler",
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        outDir: tempDir,
        rootDir: path.dirname(filePath),

        /* Linting */
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
      },
      exclude: ["node_modules"],
      include: [filePath],
    })
  );

  try {
    execSync(`tsc --project ${customTsConfigPath}`, { stdio: "inherit" });
    const config = await import(tempFilePath);
    return config.default;
  } catch (error) {
    console.error("Error compiling TypeScript file:", error);
    throw error;
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
};
