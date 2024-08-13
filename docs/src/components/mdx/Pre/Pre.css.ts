import { style } from "@vanilla-extract/css";

export const preContainer = style({
  position: "relative",
  overflow: "auto",
  margin: "1rem 0",
});

export const copyButton = style({
  position: "absolute",
  top: "0.75rem",
  right: "0.5rem",
  padding: "0.25em",
  cursor: "pointer",
  width: "2rem",
  height: "2rem",
  aspectRatio: "1/1",
  background: "transparent",
  border: "none",
  transition: "transform 0.2s ease-in-out",
  userSelect: "none",
  ":active": {
    transform: "scale(0.9)",
  },
});

export const pre = style({
  position: "relative",
  overflow: "auto",
  padding: "1rem",
  margin: 0,
  border: "1px solid",
  borderColor: "transparent",
  borderRadius: "0.5em",
});
