import { mkdir, readFileSync, writeFile } from "node:fs";
import path from "node:path";
import { cwd } from "node:process";
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/main.ts", "src/bin.ts"],
  format: ["esm", "cjs"],
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
  onSuccess: async () => {
    const binDir = path.join(cwd(), "/bin");
    mkdir(binDir, { recursive: true }, (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });

    const filesToCopy = ["dist/bin.cjs", "dist/bin.js"];

    for (const file of filesToCopy) {
      const content = await readFileSync(file, { encoding: "utf8" });
      const updatedContent = `#!/usr/bin/env node\n${content}`;
      const destPath = path.join(binDir, path.basename(file));
      writeFile(
        destPath,
        updatedContent,
        {
          encoding: "utf8",
        },
        (err) => {
          if (err) {
            console.error(err);
            throw err;
          }
        }
      );
    }
  },
});
