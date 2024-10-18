import clsx from "clsx";
import {
  Children,
  type ClassAttributes,
  type HTMLAttributes,
  type ReactNode,
  isValidElement,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  copyButton,
  fileNameText,
  langText,
  metaContainer,
  pre,
  preContainer,
} from "./Pre.css";

import type React from "react";
import MaterialSymbolsContentCopyOutlineRounded from "~icons/material-symbols/content-copy-outline-rounded";
import MaterialSymbolsDoneAll from "~icons/material-symbols/done-all";
import { LangIcon } from "./utils/LangIcon";

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

export const Pre: React.FC<
  JSX.IntrinsicAttributes &
    ClassAttributes<HTMLPreElement> &
    HTMLAttributes<HTMLPreElement>
> = ({ children, className, lang, ...attr }) => {
  const preRef = useRef<HTMLPreElement | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    if (preRef.current) {
      const filename = preRef.current.getAttribute("data-filename");
      setFileName(filename);
    }
  }, []);

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
    <div className={preContainer}>
      <div className={metaContainer}>
        <span className={fileNameText}>{fileName}</span>
        <span className={langText}>
          <span>{lang}</span>
          <LangIcon lang={lang} />
        </span>
      </div>
      <pre ref={preRef} {...attr} lang={lang} className={clsx(pre, className)}>
        {/* {lang === "shell" && <span className={promptText}>$</span>} */}
        {children}
      </pre>
      <button className={copyButton} type="button" onClick={handleCopy}>
        {isCopied ? (
          <MaterialSymbolsDoneAll />
        ) : (
          <MaterialSymbolsContentCopyOutlineRounded />
        )}
      </button>
    </div>
  );
};
