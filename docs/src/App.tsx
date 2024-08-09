import { MDXProvider } from "@mdx-js/react";
import type { MDXComponents } from "mdx/types";
import AppMd from "./App.mdx";
import { Pre } from "./components/mdx/Pre/Pre";

const components: MDXComponents = {
  pre: Pre,
};

function App() {
  return (
    <MDXProvider components={components}>
      <AppMd />
    </MDXProvider>
  );
}

export default App;
