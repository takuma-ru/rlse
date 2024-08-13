import clsx from "clsx";
import {
  Children,
  type ClassAttributes,
  type HTMLAttributes,
  type ReactNode,
  isValidElement,
  useState,
} from "react";
import { copyButton, pre, preContainer } from "./Pre.css";

import type React from "react";
import MaterialSymbolsContentCopyOutlineRounded from "~icons/material-symbols/content-copy-outline-rounded";
import MaterialSymbolsDoneAll from "~icons/material-symbols/done-all";

export const Pre: React.FC<
  JSX.IntrinsicAttributes &
    ClassAttributes<HTMLPreElement> &
    HTMLAttributes<HTMLPreElement>
> = ({ children, className, ...attr }) => {
  const [isCopied, setIsCopied] = useState(false);

  const extractTextFromChildren = (children: ReactNode): string => {
    let text = "";

    Children.forEach(children, (child) => {
      if (typeof child === "string" || typeof child === "number") {
        text += child;
      } else if (isValidElement(child)) {
        text += extractTextFromChildren(child.props.children);
      }
    });

    return text;
  };

  const handleCopy = () => {
    if (isCopied) {
      return;
    }

    if (!children) {
      return;
    }

    navigator.clipboard
      .writeText(extractTextFromChildren(children))
      .then(() => {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      })
      .catch(() => {
        setIsCopied(false);
      });
  };

  return (
    <>
      <div className={preContainer}>
        <pre {...attr} className={clsx(pre, className)}>
          {children} {/* <code></code> */}
        </pre>
        <button className={copyButton} type="button" onClick={handleCopy}>
          {isCopied ? (
            <MaterialSymbolsDoneAll />
          ) : (
            <MaterialSymbolsContentCopyOutlineRounded />
          )}
        </button>
      </div>
    </>
  );
};
