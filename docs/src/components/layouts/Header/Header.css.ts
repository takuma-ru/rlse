import { style } from "@vanilla-extract/css";
import { colors } from "../../../theme.css";

export const header = style({
  position: "sticky",
  zIndex: "calc(infinity)",
  top: 0,
  left: 0,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "1rem",
  height: 64,
  backgroundColor: colors.background.primary,
  // backdropFilter: "blur(5px)",
  // WebkitBackdropFilter: "opacity(90%) blur(5px)",
  borderBottom: `1px solid ${colors.background.secondary}`,
});

export const titleAnchor = style({
  textDecoration: "none",
});

export const titleText = style({
  color: colors.text.primary,
  fontWeight: "bold",
  margin: 0,
});
