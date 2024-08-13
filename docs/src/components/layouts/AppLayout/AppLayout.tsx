import type { FC, PropsWithChildren } from "react";
import { main } from "./AppLayout.css";

type Props = PropsWithChildren;

export const AppLayout: FC<Props> = ({ children }) => {
  return (
    <div id="app">
      <main className={main}>{children}</main>
    </div>
  );
};
