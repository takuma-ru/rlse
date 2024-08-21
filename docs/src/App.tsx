import { MDXProvider } from "@mdx-js/react";
import type { MDXComponents } from "mdx/types";
import AppMd from "./App.mdx";
import { AppLayout } from "./components/layouts/AppLayout/AppLayout";
import { Code } from "./components/mdx/Code/Code";
import { Pre } from "./components/mdx/Pre/Pre";

const components: MDXComponents = {
  code: Code,
  pre: Pre,
};

function App() {
  return (
    <MDXProvider components={components}>
      <AppLayout>
        <AppMd />
      </AppLayout>
    </MDXProvider>
  );
}

export default App;
