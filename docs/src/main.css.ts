import { assignVars, globalStyle } from "@vanilla-extract/css";
import { colorDarkTokens, colorLightTokens, colors } from "./theme.css";

globalStyle(":root", {
  "@media": {
    "(prefers-color-scheme: light)": {
      vars: assignVars(colors, colorLightTokens),
    },
    "(prefers-color-scheme: dark)": {
      vars: assignVars(colors, colorDarkTokens),
    },
  },
});

globalStyle(":root", {
  fontFamily:
    '"Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
  lineHeight: 1.5,
  fontWeight: 400,
  colorScheme: "light dark",
  color: colors.text.primary,
  backgroundColor: colors.background.primary,
  fontSynthesis: "none",
  textRendering: "optimizeLegibility",
  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",
});

globalStyle("*", {
  outline: "none",
});

globalStyle("body", {
  margin: 0,
  minWidth: 320,
  minHeight: "100vh",
});

globalStyle("ul", {
  listStyle: "initial",
  marginBlockEnd: 0,
  paddingInlineStart: "1.5em",
});

globalStyle("li::marker", {
  fontSize: "0.75em",
});

globalStyle("table", {
  marginBlockStart: "1em",
  width: "100%",
  borderCollapse: "collapse",
  borderSpacing: 0,
  textAlign: "start",
});

globalStyle("th", {
  padding: "0.5em",
  textAlign: "start",
  borderBottom: `2px solid ${colors.text.secondary}`,
});

globalStyle("td", {
  padding: "0.5em",
  borderBottom: `2px solid ${colors.background.secondary}`,
});

globalStyle(".shiki, .shiki span", {
  fontFamily:
    "ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace",
  backgroundColor: `${colors.background.secondary} !important`,
  "@media": {
    "(prefers-color-scheme: dark)": {
      color: "var(--shiki-dark) !important",
      fontStyle: "var(--shiki-dark-font-style) !important",
      fontWeight: "var(--shiki-dark-font-weight) !important",
      textDecoration: "var(--shiki-dark-text-decoration) !important",
    },
  },
});
