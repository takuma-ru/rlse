import { style } from "@vanilla-extract/css";
import { colors } from "../../../theme.css";

export const inlineCode = style({
  backgroundColor: colors.background.secondary,
  color: colors.text.highlight,
  padding: "0.1em 0.3em",
  borderRadius: "0.25em",
  fontSize: "0.9em",
  fontFamily:
    "ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace",
});
