import { globalStyle } from "@vanilla-extract/css";
import { colors } from "./theme.css";

globalStyle(":root", {
  fontFamily:
    '"Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
  lineHeight: 1.5,
  fontWeight: 500,
  colorScheme: "light dark",
  color: colors.light.text.primary,
  backgroundColor: colors.light.background.primary,
  fontSynthesis: "none",
  textRendering: "optimizeLegibility",
  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",

  "@media": {
    "(prefers-color-scheme: dark)": {
      color: colors.dark.text.primary,
      backgroundColor: colors.dark.background.primary,
    },
  },
});

globalStyle("*", {
  outline: "none",
});

globalStyle("body", {
  margin: 0,
  minWidth: 320,
  minHeight: "100vh",
});

globalStyle(".shiki, .shiki span", {
  backgroundColor: colors.light.background.secondary,
  "@media": {
    "(prefers-color-scheme: dark)": {
      fontFamily:
        "ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace",
      color: "var(--shiki-dark) !important",
      backgroundColor: `${colors.dark.background.secondary} !important`,
      fontStyle: "var(--shiki-dark-font-style) !important",
      fontWeight: "var(--shiki-dark-font-weight) !important",
      textDecoration: "var(--shiki-dark-text-decoration) !important",
    },
  },
});
