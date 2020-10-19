import React from "react";
import { MDXProvider } from "@mdx-js/react";
import mdComps from "./MarkdownComponents";
import Layout from "./Layout";

/** 打包mdx文档得到的模块 */
export interface IOriginalMdxModule {
  /** yaml格式的frontmatter */
  _frontMatter: any;
  /** export const frontmatter... 格式的 frontmatter */
  frontmatter: any;
  /** 文档渲染组件 */
  default: React.FC;
}

export interface IWrappedMdxModule {
  default: React.FC;
  frontmatter: any;
}

export function wrapMdxModule(
  mdxExport: IOriginalMdxModule
): IWrappedMdxModule {
  const frontmatter = getFrontmatter(mdxExport);
  const DocComp = mdxExport.default;
  const WrappedDocComp: React.FC = () => {
    return (
      <MDXProvider components={mdComps}>
        <Layout>
          <DocComp />
        </Layout>
      </MDXProvider>
    );
  };
  return {
    ...mdxExport,
    default: WrappedDocComp,
    frontmatter
  };
}

function getFrontmatter(mdxExport: IOriginalMdxModule) {
  const {
    // 在markdown顶部通过yaml来定义的元数据
    _frontMatter: classicFrontmatter = {},
    // 使用mdx的export const frontmatter = {}来定义的元数据
    frontmatter: exportFrontmatter = {}
  } = mdxExport;
  return {
    ...classicFrontmatter,
    ...exportFrontmatter
  };
}
