import clsx from "clsx";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  FC,
  PropsWithChildren,
} from "react";
import { anchor, button } from "./Button.css";

type Props = PropsWithChildren & (AnchorProps | ButtonProps);
type AnchorProps = { tagType: "a" } & AnchorHTMLAttributes<HTMLAnchorElement>;
type ButtonProps = {
  tagType: "button";
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button: FC<Props> = (props) => {
  switch (props.tagType) {
    case "a": {
      const { children, ...attr } = props;

      return (
        <a {...attr} className={clsx(anchor, attr.className)}>
          {children}
        </a>
      );
    }
    case "button": {
      const { children, ...attr } = props;

      return (
        <button {...attr} className={clsx(button, attr.className)}>
          {children}
        </button>
      );
    }
  }
};
