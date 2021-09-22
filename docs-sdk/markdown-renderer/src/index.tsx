import React, { useMemo, useState, useCallback, useRef } from "react";
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

import { IDemoOpts } from "@alicloud/console-toolkit-docs-consumer";
import { useScrollToAnchor } from "./utils/useScrollToAnchor";

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
  resolveDemoOpts,
}) => {
  const compiledJSX = useMemo(() => {
    const actualComponents = {
      ...mdComps,
      ...components,
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
                  value: node.value,
                },
              ],
            });
          },
        },
      })
      .use(rehypeRaw)
      .use(sanitize, {
        clobber: [],
        tagNames: [...githubSanitizeSchema.tagNames, "inlinecode"],
        attributes: {
          ...githubSanitizeSchema.attributes,
          "*": ["className", ...githubSanitizeSchema.attributes["*"]],
        },
      })
      .use(rehypeSlug)
      .use(rehypePlugins)
      .use(transformLinkNode)
      // .use(debugPlugin, "re2")
      .use(rehype2react, {
        createElement: React.createElement,
        Fragment: React.Fragment,
        components: actualComponents,
      })
      .processSync(source).result as React.ReactElement;

    return jsx;

    // 仅在source更新时重新编译markdown
  }, [source]);

  const ctnRef = useRef<HTMLDivElement>(null);

  const { headings, check } = useTOC(toc, ctnRef);
  const scrollToAnchor = useScrollToAnchor(ctnRef);

  const ctxValue = useMemo(() => {
    return {
      checkHeadings: check,
      resolveAppServePath,
      resolveAppDeps,
      resolveDemoOpts,
      scrollToAnchor,
    };
  }, [
    check,
    resolveAppServePath,
    resolveAppDeps,
    resolveDemoOpts,
    scrollToAnchor,
  ]);

  if (embedded) {
    return (
      <ctx.Provider value={ctxValue}>
        <div className="markdown-embedded" ref={ctnRef}>
          {compiledJSX}
        </div>
      </ctx.Provider>
    );
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
      ((node) => node.type === "element" && node.tagName === "a") as any,
      (node: any, ancestors: any[]) => {
        if (Array.isArray(node.children) && node.children.length === 1) {
          const linkTextNode = node.children[0];
          if (
            linkTextNode.type === "text" &&
            (linkTextNode.value.startsWith("$XView") ||
              linkTextNode.value.startsWith("$XDemo"))
          ) {
            const parent = ancestors[ancestors.length - 1];
            parent.children.splice(parent.children.indexOf(node), 1);
            // 先将找到的内联demo按顺序存到【顶层祖先元素】的数组中，
            // 最后一起将内联demo加到【顶层祖先元素】后面
            // （如果找到一个demo马上append，会造成当一个段落包含多个demo时，最终append的顺序逆转）
            ancestors[1]._toBeAppended = ancestors[1]._toBeAppended ?? [];
            ancestors[1]._toBeAppended.push(node);
          }
        }
        return visit.CONTINUE;
      }
    );

    for (let i = 0; i < tree.children.length; ++i) {
      const node = tree.children[i];
      if (Array.isArray(node._toBeAppended)) {
        tree.children.splice(i + 1, 0, ...node._toBeAppended);
      }
      delete node._toBeAppended;
    }
  };
}
