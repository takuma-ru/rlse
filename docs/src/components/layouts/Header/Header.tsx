import type { FC } from "react";
import { header, titleAnchor, titleText } from "./Header.css";

export const Header: FC = () => {
  return (
    <header className={header}>
      <a className={titleAnchor} href="/">
        <h3 className={titleText}>Header{/* @takuma-ru/rlse */}</h3>
      </a>
    </header>
  );
};
