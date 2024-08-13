import { createGlobalTheme } from "@vanilla-extract/css";

type GlobalColorTheme = {
  background: {
    primary: string;
    secondary: string;
  };
  text: {
    primary: string;
    secondary: string;
  };
};

type GlobalColorThemeWithModes = {
  light: GlobalColorTheme;
  dark: GlobalColorTheme;
};

const colorTokens = {
  light: {
    background: {
      primary: "#eeeeee",
      secondary: "#f6f6f6",
    },
    text: {
      primary: "#1d1d1d",
      secondary: "#bfbfbf",
    },
  },
  dark: {
    background: {
      primary: "#1d1d1d",
      secondary: "#2C2C2C",
    },
    text: {
      primary: "#f6f6f6",
      secondary: "#9b9b9b",
    },
  },
} as const satisfies GlobalColorThemeWithModes;

export const colors = createGlobalTheme(":root", colorTokens);
