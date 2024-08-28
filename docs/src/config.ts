type Config = {
  packageName: string;
  registry: "npm" | "github";
};

export const config = {
  packageName: "@takuma-ru/rlse",
  registry: "npm",
} as const satisfies Config;
