# @takuma-ru/rlse

## Description

All-in-one release flow execution package.

## Getting Started

### 1. Install

```shell
npm install @takuma-ru/rlse
```

### 2. Add script to package.json

```json filename=package.json
{
  "scripts": {
    "rlse": "rlse -n <name> -l <patch | minor | major | pre> -c <build command>"
  }
}
```

### 3. Run

```shell
npm run rlse
```

## Configure settings via CLI

| Option        | Description   | Type   | Default |
| ------------- | ------------- | ------ | ------- |
| -n, --name    | Package name  | string |         |
| -l, --level   | Release level | string |         |
| -c, --command | Build command | string |         |
| ...           |               |        |         |

## Configure settings via Setting file

You can configure it without specifying options in the cli by creating `rlse.config.ts` in the project root.
In addition to ts, the following file formats are supported.

- `rlse.config.ts`
- `rlse.config.js`
  - `rlse.config.mjs`
  - `rlse.config.cjs`
- `rlse.config.json`

```ts filename=rlse.config.ts
import { defineConfig } from "@takuma-ru/rlse";

export default defineConfig({
  name: "vanilla-ts",
  level: "patch",
  pre: false,
  buildCmd: "pnpm build",
  gitUserName: "github-actions[bot]",
  gitUserEmail: "41898282+github-actions[bot]@users.noreply.github.com",
  dryRun: true,
  skipStep: ["config", "commit-changes", "create-release-branch"],
});
```

## License

[GNU Lesser General Public License v3.0](https://www.gnu.org/licenses/agpl-3.0.html.en#license-text)

> [!NOTE]
> Highlights information that users should take into account, even when skimming.
