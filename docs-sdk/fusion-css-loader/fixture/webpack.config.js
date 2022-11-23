const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  mode: "development",
  entry: path.resolve(__dirname, "index.js"),
  output: {
    path: path.resolve(__dirname, "dist2"),
    filename: "[name].js"
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        rules: [
          {
            use: [
              {
                // 也可以使用 "style-loader"
                loader: MiniCssExtractPlugin.loader
              }
            ]
          },
          {
            use: [
              {
                loader: "css-loader"
              }
            ]
          },
          {
            resourceQuery: /fusionPrefix|fusionVarScope/,
            use: [
              {
                // loader: "@alicloud/console-toolkit-fusion-css-loader"
                loader: path.resolve(__dirname, "../lib/index.js")
              }
            ]
          },
          {
            resourceQuery: /myCustomFusionModify/,
            use: [
              {
                // loader: "@alicloud/console-toolkit-fusion-css-loader"
                loader: path.resolve(__dirname, "../lib/index.js"),
                options: {
                  fusionPrefix: '.my-prefix-',
                  selectorTransformer: selector => {
                    if (selector === ".theme-xconsole") {
                      return ".my-own-scope";
                    }
                  }
                }
              }
            ]
          }
        ]
      }
    ]
  },
  plugins: [new MiniCssExtractPlugin()]
};
