import clsx from "clsx";
import type { ClassAttributes, HTMLAttributes } from "react";
import { copyButton, pre } from "./Pre.css";

export const Pre: React.FC<
  JSX.IntrinsicAttributes &
    ClassAttributes<HTMLPreElement> &
    HTMLAttributes<HTMLPreElement>
> = (properties) => {
  return (
    <>
      <pre {...properties} className={clsx(pre, properties.className)}>
        <button className={copyButton} type="button">
          copy
        </button>
        {properties.children}
      </pre>
    </>
  );
};
