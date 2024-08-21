import { style } from "@vanilla-extract/css";
import { colors } from "../../theme.css";

export const base = style({
  color: colors.text.primary,
  backgroundColor: colors.background.secondary,
  padding: "0.5em 1.5em",
  borderRadius: "0.5em",
  textAlign: "center",
  transition: "transform 0.1s ease-in-out",
  lineHeight: 1.5,
  cursor: "pointer",
  ":active": {
    transform: "scale(0.95)",
  },
});

export const anchor = style([
  base,
  {
    display: "inline-block",
  },
]);

export const button = style([
  base,
  {
    border: "none",
  },
]);
