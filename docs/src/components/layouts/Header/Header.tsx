import type { FC } from "react";
import SimpleIconsGithub from "~icons/simple-icons/github";
import SimpleIconsNpm from "~icons/simple-icons/npm";
import { config } from "../../../config";
import { header, links, titleAnchor, titleText } from "./Header.css";

export const Header: FC = () => {
  return (
    <header className={header}>
      <a className={titleAnchor} href="/">
        <h3 className={titleText}>{config.packageName}</h3>
      </a>
      <div className={links}>
        <a
          href="https://github.com/takuma-ru/rlse"
          target="_blank"
          rel="noreferrer"
        >
          <SimpleIconsGithub />
        </a>
        <a
          href="https://www.npmjs.com/package/@takuma-ru/rlse"
          target="_blank"
          rel="noreferrer"
        >
          <SimpleIconsNpm />
        </a>
      </div>
    </header>
  );
};
