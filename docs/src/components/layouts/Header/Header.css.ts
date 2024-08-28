import { style } from "@vanilla-extract/css";
import { colors } from "../../../theme.css";

export const header = style({
  position: "fixed",
  zIndex: "calc(infinity)",
  width: "100%",
  height: 64,
  top: 0,
  left: 0,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "1rem",
  backgroundColor: `color-mix(in srgb, ${colors.background.primary} 80%, transparent)`,
  backdropFilter: "blur(4px)",
  WebkitBackdropFilter: "blur(4px)",
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
