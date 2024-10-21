import type { Element } from "hast";
import type { Node } from "unist";
import { visit } from "unist-util-visit";

function rehypeInlineCodeLang() {
  return (tree: Node) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName === "code" && !node.properties?.className) {
        node.properties = node.properties || {};
        node.properties.lang = "inline";
      }
    });
  };
}

export { rehypeInlineCodeLang };
