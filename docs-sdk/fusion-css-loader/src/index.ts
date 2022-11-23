import { getOptions } from "loader-utils";
import postcss from "postcss";
import type { Root, Declaration } from "postcss";
import postcssPackage from "postcss/package.json";
import { satisfies } from "semver";
import * as qs from "query-string";
import { pascalCase } from "pascal-case";

module.exports = async function fusionCssLoader(
  this: any,
  content,
  sourceMap,
  meta
) {
  const callback = this.async();
  const options = getOptions(this);
  const resourceQuery = qs.parse(this.resourceQuery || "");

  let fusionPrefix = resourceQuery.fusionPrefix ?? options.fusionPrefix;
  let fusionPrefixPascalCase = fusionPrefix ? pascalCase(fusionPrefix) : "Next";
  let fusionVarScope = resourceQuery.fusionVarScope ?? options.fusionVarScope;
  let styleContainer = resourceQuery.styleContainer ?? options.styleContainer;
  let selectorTransformer = options.selectorTransformer;

  let root;

  // Reuse PostCSS AST from other loaders
  // https://github.com/webpack-contrib/postcss-loader/blob/6c9f6b5058158f5cbee81e410c94abb23b85bb56/src/index.js#L86
  if (
    meta &&
    meta.ast &&
    meta.ast.type === "postcss" &&
    satisfies(meta.ast.version, `^${postcssPackage.version}`)
  ) {
    ({ root } = meta.ast);
  }

  const transformers = [] as any[];
  if (typeof selectorTransformer === "function") {
    transformers.push(modifySelectorPostcssPlugin(selectorTransformer));
  }

  if (typeof fusionVarScope === "string") {
    transformers.push(
      modifySelectorPostcssPlugin((selector) => {
        if (selector === ":root") {
          return fusionVarScope;
        }
      })
    );
  }

  if (typeof styleContainer === "string") {
    transformers.push(
      modifySelectorPostcssPlugin(function (selector: string) {
        // 未来可以使用 postcss-selector-parser 做更精确的识别和判断

        // 将明显的根容器选择器替换成styleContainer
        if (
          selector === "html" ||
          selector === "body" ||
          selector === ":host"
        ) {
          return styleContainer;
        }
        // 不能在前面插入styleContainer的选择器，不作处理
        if (
          selector.includes("html") ||
          selector.includes(":root") ||
          selector.includes(":host") ||
          selector.includes(styleContainer)
        ) {
          return selector;
        }
        // fusion组件样式，不做处理
        // 组件的样式隔离通过 fusionPrefix 的替换来完成
        if (selector.includes(".next-")) {
          return selector;
        }
        // 其他选择器直接在前面插入styleContainer
        return styleContainer + " " + selector;
      })
    );
  }

  if (typeof fusionPrefix === "string") {
    transformers.push(function (css: Root) {
      function processDecl(decl: Declaration) {
        if (decl.prop === "font-family" && decl.value === "NextIcon") {
          decl.value = fusionPrefixPascalCase + "Icon";
        }
        // replace font-family: var(--xconsole-icon-font-family, NextIcon)
        // to font-family: var(--xconsole-icon-font-family, MyPrefixIcon)
        if (decl.prop === "font-family" && decl.value?.match(/var\(.*,\s?NextIcon\)/)) {
          decl.value = decl.value.replace("NextIcon", fusionPrefixPascalCase + "Icon");
        }
        // replace --xconsole-icon-font-family: NextIcon;
        // to --xconsole-icon-font-family: MyPrefixIcon;
        if (decl.prop === "--xconsole-icon-font-family" && decl.value) {
          decl.value = fusionPrefixPascalCase + "Icon";
        }
      }
      // css.walkAtRules((rule) => {
      //   if (rule.name === "font-face") {
      //     rule.walkDecls(processDecl)
      //   }
      // })
      css.walkDecls(processDecl);
      // css.walkRules((rule) => {
      //   const newSelectors = rule.selectors.map((selector) => {
      //     const res = transform(selector);
      //     if (res) return res;
      //     return selector;
      //   });
      //   rule.selectors = newSelectors;
      // });
    });
    transformers.push(
      modifySelectorPostcssPlugin((selector) => {
        if (selector.includes(".next-")) {
          return selector.replace(/\.next-/g, fusionPrefix);
        }
      })
    );
  }

  if (transformers.length === 0) {
    throw new Error(
      `Must provide at least one of the loader options: fusionPrefix or fusionVarScope or selectorTransformer or styleContainer`
    );
  }

  const result = await postcss(transformers).process(root || content, {
    from: undefined,
  });

  const ast = {
    type: "postcss",
    version: result.processor.version,
    root: result.root,
  };

  callback(null, result.css, undefined, { ast });
};

function modifySelectorPostcssPlugin(transform) {
  return function (css) {
    css.walkRules((rule) => {
      // @keyframes 里面的 0% 声明也是一种 rule，我们不考虑这种rule
      if (rule?.parent?.name === "keyframes") return;
      const newSelectors = rule.selectors.map((selector) => {
        const res = transform(selector);
        if (res) return res;
        return selector;
      });
      rule.selectors = newSelectors;
    });
  };
}
