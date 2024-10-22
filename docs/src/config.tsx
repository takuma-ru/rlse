type Config = {
  packageName: `@${string}/${string}` | string;
  registry: "npm" | "github" | "jsr";
  links?: Array<{
    type: "npm" | "github" | "jsr" | "x" | "blue-sky";
    href: `https://${string}`;
  }>;
  hero?: {
    title: string;
    subTitle?: string;
    description?: string | JSX.Element;
    logo?:
      | string
      | {
          dark: string;
          light: string;
        };
    links?: Array<
      | {
          type: "npm" | "github" | "jsr" | "x" | "blue-sky";
          href: `https://${string}`;
        }
      | {
          type: "in-page";
          href: `/${string}`;
        }
    >;
  };
  meta?: {
    title: string;
    description: string;
    keywords?: string[];
    author?: string;
    twitter?: string;
    image?: string;
  };
};

export const config = {
  packageName: "@takuma-ru/rlse",
  registry: "npm",
  links: [
    {
      type: "npm",
      href: "https://www.npmjs.com/package/@takuma-ru/rlse",
    },
    {
      type: "github",
      href: "https://github.com/takuma-ru/rlse/",
    },
  ],
  hero: {
    title: "@takuma-ru/rlse",
    subTitle: "All-in-one release flow execution package",
    description: (
      <>
        <p>
          📦 <strong>Automatically</strong> update the version in
          <code>package.json</code>.
        </p>
        <p>
          🌿 <strong>Automatically</strong> create a release branch.
        </p>
        <p>
          🛠️ <strong>Automatically</strong> build the project.
        </p>
        <p>
          📝 <strong>Automatically</strong> commit the changes.
        </p>
        <p>
          🚀 <strong>Automatically</strong> publish the package.
        </p>
      </>
    ),
  },
} as const satisfies Config;
