import type { FC, PropsWithChildren } from "react";
import { Footer } from "../Footer/Footer";
import { Header } from "../Header/Header";
import { main } from "./AppLayout.css";

type Props = PropsWithChildren;

export const AppLayout: FC<Props> = ({ children }) => {
  return (
    <div id="app">
      <Header />
      <main className={main}>{children}</main>
      <Footer />
    </div>
  );
};
