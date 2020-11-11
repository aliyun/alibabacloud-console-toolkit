import React, { useMemo, useState, useCallback } from "react";
import mdComps from "./MarkdownComponents";
import unified from "unified";
import remarkParse from "remark-parse";
import gfm from "remark-gfm";
import remark2rehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import sanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehype2react from "rehype-react";
import visit from "unist-util-visit-parents";
import Layout from "./Layout";
import { useTOC } from "./utils/useTOC";
// @ts-ignore
import githubSanitizeSchema from "hast-util-sanitize/lib/github.json";

import { IDemoOpts } from "@alicloud/console-toolkit-multi-entry-loader";

export const ctx = React.createContext<any>({});

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
  toc?: boolean;
  embedded?: boolean;
  resolveAppServePath?: (consoleOSId: string) => string;
  resolveAppDeps?: (consoleOSId: string) => any;
  resolveDemoOpts?: (consoleOSId: string) => IDemoOpts;
}

export const MarkdownRenderer: React.FC<IProps> = ({
  source,
  remarkPlugins = [],
  rehypePlugins = [],
  components,
  toc = false,
  embedded = false,
  resolveAppServePath,
  resolveAppDeps,
  resolveDemoOpts
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
        allowDangerousHtml: true,
        handlers: {
          inlineCode(h, node) {
            return Object.assign({}, node, {
              type: "element",
              tagName: "inlinecode",
              properties: {},
              children: [
                {
                  type: "text",
                  value: node.value
                }
              ]
            });
          }
        }
      })
      .use(rehypeRaw)
      .use(sanitize, {
        clobber: [],
        tagNames: [...githubSanitizeSchema.tagNames, "inlinecode"],
        attributes: {
          ...githubSanitizeSchema.attributes,
          "*": ["className", ...githubSanitizeSchema.attributes["*"]]
        }
      })
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

  const { ctnRef, headings, check } = useTOC(toc);

  const ctxValue = useMemo(() => {
    return {
      checkHeadings: check,
      resolveAppServePath,
      resolveAppDeps,
      resolveDemoOpts
    };
  }, [check, resolveAppServePath, resolveAppDeps, resolveDemoOpts]);

  if (embedded) {
    return <ctx.Provider value={ctxValue}>{compiledJSX}</ctx.Provider>;
  }

  return (
    <ctx.Provider value={ctxValue}>
      <Layout ctnRef={ctnRef} headings={headings}>
        {compiledJSX}
      </Layout>
    </ctx.Provider>
  );
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
            (linkTextNode.value.startsWith("$XView") ||
              linkTextNode.value.startsWith("$XDemo"))
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
