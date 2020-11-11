# @alicloud/console-toolkit-fusion-css-loader

这是一个 webpack loader，用来修改 fusion 的 css 的选择器类名前缀。比如把`.next-btn`的类名修改成`.my-prefix-btn`。
这样做的目的是，**控制 fusion 样式的作用范围，让一个页面中可以同时存在多份不同版本的 fusion，同时不会出现样式冲突**。

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

它的作用是对这个 css 文件中的 CSS 选择器进行转换，把`.next-btn`的类名修改成`.my-prefix-btn`。从而限制 fusion 组件样式作用范围，避免多份 fusion 同时存在时出现样式冲突。

### 限制 fusion reset 样式的影响范围

即使按照上面的方式替换了 fusion prefix，在 fusion 样式中的 reset 样式依然是全局性的，比如

```css
body {
  margin: 0;
}
h1 {
  font-size: 2em;
  margin: 0.67em 0;
}
```

如果你希望限制这种 fusion reset 样式的影响范围，你可以在 import 的 query 中增加`styleContainer`，比如：

```js
import "path/to/fusion.css?fusionPrefix=.my-prefix-&styleContainer=my-style-container";
```

会把上面例子的样式转化成

```css
my-style-container {
  margin: 0;
}
my-style-container h1 {
  font-size: 2em;
  margin: 0.67em 0;
}
```

注意我们提供的`styleContainer`是一个 tag 名称而不是一个类名，这是为了避免 reset 的选择器权重过高。比如，如果使用`.my-cls`作为`styleContainer`，那么生成的 reset 选择器就是`.my-cls h1`，它的权重比很多用户定义样式还高。

## fusion css variable scope

如果想要引用 fusion 主题的 css-variable 定义，比如[主题包中的 variables.css](https://unpkg.alipay.com/browse/@alife/theme-xconsole-v4@0.4.13/variables.css)，可以这样引入：

```js
import "./fusion-theme/variables.css?fusionVarScope=.my-container";
```

它的作用是将这个 css 文件中的所有`:root`选择器转换成`.my-container`。从而限制该 fusion 主题的 css-variable 作用范围，避免多份 fusion 主题同时存在时出现样式冲突。

## 示例

[webpack 项目示例](https://github.com/aliyun/alibabacloud-console-toolkit/tree/preset-demos/packages/fusion-css-loader/fixture)。
