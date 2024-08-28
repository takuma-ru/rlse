import type { FC } from "react";
import { config } from "../../../config";
import { header, titleAnchor, titleText } from "./Header.css";

export const Header: FC = () => {
  return (
    <header className={header}>
      <a className={titleAnchor} href="/">
        <h3 className={titleText}>{config.packageName}</h3>
      </a>
    </header>
  );
};
