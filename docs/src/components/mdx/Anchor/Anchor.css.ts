import { style } from "@vanilla-extract/css";
import { colors } from "../../../theme.css";

export const anchor = style({
  color: colors.text.primary,
  textDecoration: "underline dashed",
});
