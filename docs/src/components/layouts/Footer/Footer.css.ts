import { style } from "@vanilla-extract/css";
import { colors } from "../../../theme.css";

export const footer = style({
  padding: "1rem",
  textAlign: "center",
  fontWeight: "lighter",
  borderTop: `1px solid ${colors.background.secondary}`,
});
