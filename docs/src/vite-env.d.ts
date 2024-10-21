/// <reference types="vite/client" />
/// <reference types="unplugin-icons/types/react" />

declare module "*.mdx" {
  let MDXComponent: (props) => JSX.Element;
  export default MDXComponent;
}
