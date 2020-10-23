import React, { useMemo } from "react";
import mdComps from "./MarkdownComponents";
import styled from "styled-components";
import unified from "unified";
import remarkParse from "remark-parse";
import gfm from "remark-gfm";
import remark2rehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import sanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehype2react from "rehype-react";
import visit from "unist-util-visit-parents";

const Wrapper = styled.div`
  font-size: 14px;
  line-height: 1.67;
  color: #333333;
  min-height: 200px;
  min-width: 300px;
`;

/** 打包md文档得到的模块 */
export interface IOriginalMdxModule {
  default: React.FC;
}

export const markdownComponents = mdComps;

export interface IProps {
  source: string;
  components?: any;
  remarkPlugins?: any[];
  rehypePlugins?: any[];
}

export const MarkdownRenderer: React.FC<IProps> = ({
  source,
  remarkPlugins = [],
  rehypePlugins = [],
  components
}) => {
  const compiledJSX = useMemo(() => {
    const actualComponents = {
      ...mdComps,
      ...components
    };

    const jsx = unified()
      .use(remarkParse)
      .use(gfm)
      .use(remarkPlugins)
      .use(remark2rehype, {
        allowDangerousHtml: true
      })
      .use(rehypeRaw)
      .use(sanitize, { clobber: [] })
      .use(rehypeSlug)
      .use(rehypePlugins)
      .use(transformLinkNode)
      // .use(debugPlugin, "re2")
      .use(rehype2react, {
        createElement: React.createElement,
        Fragment: React.Fragment,
        components: actualComponents
      })
      .processSync(source).result as React.ReactElement;

    return jsx;

    // 仅在source更新时重新编译markdown
  }, [source]);

  return <Wrapper>{compiledJSX}</Wrapper>;
};

function debugPlugin(name: string) {
  return (tree, vfile) => {
    debugger;
  };
}

function transformLinkNode() {
  return (tree, vfile) => {
    visit(
      tree,
      (node =>
        node.type === "element" &&
        node.tagName === "a" &&
        !node.transformLinkNodeFlag) as any,
      (node: any, ancestors: any[]) => {
        if (Array.isArray(node.children) && node.children.length === 1) {
          const linkTextNode = node.children[0];
          if (
            linkTextNode.type === "text" &&
            linkTextNode.value.startsWith("$XView")
          ) {
            const parent = ancestors[ancestors.length - 1];
            const root = ancestors[0];
            parent.children.splice(parent.children.indexOf(node), 1);
            node.transformLinkNodeFlag = true;
            root.children.splice(
              root.children.indexOf(ancestors[1]) + 1,
              0,
              node
            );
          }
        }
        return visit.CONTINUE;
      }
    );
  };
}
