import type { AnchorHTMLAttributes, ClassAttributes, FC } from "react";
import MaterialSymbolsOpenInNewRounded from "~icons/material-symbols/open-in-new-rounded";

import { anchor } from "./Anchor.css";

export const Anchor: FC<
  JSX.IntrinsicAttributes &
    ClassAttributes<HTMLAnchorElement> &
    AnchorHTMLAttributes<HTMLAnchorElement>
> = ({ children, ...props }) => {
  const { href } = props;

  const isExternal = href?.startsWith("http") ?? false;

  return (
    <a
      href={href}
      target={isExternal ? "_blank" : props.target}
      className={anchor}
      {...props}
    >
      {children}
      <MaterialSymbolsOpenInNewRounded />
    </a>
  );
};
