import clsx from "clsx";
import type { ClassAttributes, FC, HTMLAttributes } from "react";
import { inlineCode } from "./Code.css";

export const Code: FC<
  JSX.IntrinsicAttributes &
    ClassAttributes<HTMLElement> &
    HTMLAttributes<HTMLElement>
> = ({ children, ...attr }) => {
  return (
    <code
      {...attr}
      className={clsx(attr.lang === "inline" && inlineCode, attr.className)}
    >
      {children}
    </code>
  );
};
