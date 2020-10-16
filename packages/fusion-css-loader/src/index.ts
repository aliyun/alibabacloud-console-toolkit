import { getOptions } from "loader-utils";
import postcss from "postcss";
import postcssPackage from "postcss/package.json";
import { satisfies } from "semver";
import * as qs from "query-string";

module.exports = async function fusionCssLoader(
  this: any,
  content,
  sourceMap,
  meta
) {
  const callback = this.async();
  const options = getOptions(this);
  const resourceQuery = qs.parse(this.resourceQuery || "");

  let fusionPrefix, fusionVarScope, root;

  if (resourceQuery.fusionPrefix) {
    fusionPrefix = resourceQuery.fusionPrefix;
  }

  if (resourceQuery.fusionVarScope) {
    fusionVarScope = resourceQuery.fusionVarScope;
  }

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

  const selectorTransformers = [] as any[];
  if (typeof options.selectorTransformer === "function") {
    selectorTransformers.push(options.selectorTransformer);
  }

  if (fusionVarScope || typeof options.fusionVarScope === "string") {
    selectorTransformers.push(selector => {
      if (selector === ":root") {
        return fusionVarScope || options.fusionVarScope;
      }
    });
  }

  if (fusionPrefix || typeof options.fusionPrefix === "string") {
    selectorTransformers.push(selector => {
      if (selector.startsWith(".next")) {
        return selector.replace(
          /\.next-/g,
          fusionPrefix || options.fusionPrefix
        );
      }
    });
  }

  if (selectorTransformers.length === 0) {
    throw new Error(
      `Must provide at least one of the loader options: fusionPrefix or fusionVarScope or selectorTransformer`
    );
  }

  const result = await postcss(
    selectorTransformers.map(m => modifySelectorPostcssPlugin(m))
  ).process(root || content, {
    from: undefined
  });

  const ast = {
    type: "postcss",
    version: result.processor.version,
    root: result.root
  };

  callback(null, result.css, undefined, { ast });
};

function modifySelectorPostcssPlugin(transform) {
  return function(css) {
    css.walkRules(rule => {
      const newSelectors = rule.selectors.map(selector => {
        const res = transform(selector);
        if (res) return res;
        return selector;
      });
      rule.selectors = newSelectors;
    });
  };
}
