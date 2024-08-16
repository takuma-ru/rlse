import mdx from "@mdx-js/rollup";
import rehypeShiki from "@shikijs/rehype";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import react from "@vitejs/plugin-react";
import remarkGfm from "remark-gfm";
import Fonts from "unplugin-fonts/vite";
import Icons from "unplugin-icons/vite";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    vanillaExtractPlugin(),
    Fonts({
      google: {
        families: [{ name: "Open Sans", styles: "wght@0,300..800;1,300..800" }],
      },
    }),
    Icons({
      compiler: "jsx",
      jsx: "react",
    }),
    {
      enforce: "pre",
      ...mdx({
        providerImportSource: "@mdx-js/react",
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          [
            rehypeShiki,
            {
              themes: {
                light: "github-light",
                dark: "github-dark",
              },
            },
          ],
        ],
      }),
    },
  ],
  optimizeDeps: {
    include: ["react/jsx-runtime"],
  },
});
