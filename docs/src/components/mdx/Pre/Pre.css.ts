import { style } from "@vanilla-extract/css";
import { colors } from "../../../theme.css";

export const preContainer = style({
  position: "relative",
  overflow: "auto",
  margin: "1rem 0",
  backgroundColor: colors.background.secondary,
  borderRadius: "0.5em",
});

export const metaContainer = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  margin: "0.5rem 1rem 0",
});

export const fileNameText = style({
  color: colors.text.secondary,
  fontWeight: "bold",
  fontSize: "0.8rem",
});

export const langText = style({
  display: "flex",
  gap: "0.25rem",
  alignItems: "center",
  color: colors.text.secondary,
  fontSize: "0.8rem",
});

export const promptText = style({
  userSelect: "none",
  marginRight: "0.75rem",
});

export const copyButton = style({
  position: "absolute",
  top: "calc(0.75rem + 0.5rem + 0.75rem)",
  right: "0.5rem",
  padding: "0.25em",
  cursor: "pointer",
  width: "2rem",
  height: "2rem",
  aspectRatio: "1/1",
  background: "transparent",
  border: "none",
  opacity: 0.5,
  transition: "all 0.2s ease-in-out",
  userSelect: "none",
  ":active": {
    transform: "scale(0.8)",
  },
  ":hover": {
    opacity: 1,
  },
});

export const pre = style({
  position: "relative",
  overflow: "auto",
  padding: "1rem",
  margin: 0,
  border: "1px solid",
  borderColor: "transparent",
  borderRadius: "0 0 0.5em 0.5em",
});
