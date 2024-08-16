import {
  assignVars,
  createGlobalTheme,
  createGlobalThemeContract,
  globalStyle,
} from "@vanilla-extract/css";

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

export const colorLightTokens = {
  background: {
    primary: "#eeeeee",
    secondary: "#f6f6f6",
  },
  text: {
    primary: "#1d1d1d",
    secondary: "#bfbfbf",
  },
} as const satisfies GlobalColorTheme;

export const colorDarkTokens = {
  background: {
    primary: "#1d1d1d",
    secondary: "#2C2C2C",
  },
  text: {
    primary: "#f6f6f6",
    secondary: "#9b9b9b",
  },
} as const satisfies GlobalColorTheme;

export const colors = createGlobalThemeContract({
  background: {
    primary: "background-primary",
    secondary: "background-secondary",
  },
  text: {
    primary: "text-primary",
    secondary: "text-secondary",
  },
});
