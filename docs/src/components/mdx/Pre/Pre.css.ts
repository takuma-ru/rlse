import { style } from "@vanilla-extract/css";

export const copyButton = style({
  position: "absolute",
  top: 0,
  right: 0,
  padding: "0.5em",
  cursor: "pointer",
  opacity: 0,
  transition: "opacity 0.2s",
  ":hover": {
    opacity: 1,
  },
});

export const pre = style({
  position: "relative",
  overflow: "auto",
  padding: "1em",
  border: "1px solid",
  borderColor: "transparent",
  borderRadius: "0.25em",
  ":hover": {
    borderColor: "currentColor",
  },
});
