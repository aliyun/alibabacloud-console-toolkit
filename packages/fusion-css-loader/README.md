# @alicloud/console-toolkit-fusion-css-loader

这是一个 webpack loader，用来修改 fusion 的 css 的类名前缀。比如把`.next-btn`的类名修改成`.my-prefix-btn`。
这样做的目的是，让一个页面中可以同时存在多份不同版本的 fusion，同时不会出现样式冲突。

## 使用方式

先配置 webpack，让这个 loader 在 css-loader 之前执行：

```js
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  mode: "development",
  entry: path.resolve(__dirname, "index.js"),
  output: {
    path: path.resolve(__dirname, "dist"),
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
                loader: "@alicloud/console-toolkit-fusion-css-loader"
              }
            ]
          }
        ]
      }
    ]
  },
  plugins: [new MiniCssExtractPlugin()]
};
```

## fusion css isolation

在源代码中引入 fusion 样式时（比如主题包中的[next.var.css](https://unpkg.alipay.com/browse/@alife/theme-xconsole-v4@0.4.13/dist/next.var.css)），可以这样引入：

```js
import "path/to/fusion.css?fusionPrefix=.my-prefix-";
```

它的作用是对这个 css 文件中的 CSS 选择器进行转换，把`.next-btn`的类名修改成`.my-prefix-btn`。从而限制 fusion 组件样式作用范围，避免多份 fusion 主题同时存在时出现样式冲突。

## fusion css variable scope

如果想要引用 fusion 主题的 css-variable 定义，比如[主题包中的 variables.css](https://unpkg.alipay.com/browse/@alife/theme-xconsole-v4@0.4.13/variables.css)，可以这样引入：

```js
import "./fusion-theme/variables.css?fusionVarScope=.my-container";
```

它的作用是将这个 css 文件中的所有`:root`选择器转换成`.my-container`。从而限制该 fusion 主题的 css-variable 作用范围，避免多份 fusion 主题同时存在时出现样式冲突。

## 示例

[webpack 项目示例](https://github.com/aliyun/alibabacloud-console-toolkit/tree/preset-demos/packages/fusion-css-loader/fixture)。
