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
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        rules: [
          {
            use: [
              {
                // 这里也可以使用 "style-loader"
                loader: MiniCssExtractPlugin.loader,
              },
            ],
          },
          {
            use: [
              {
                loader: "css-loader",
              },
            ],
          },
          {
            resourceQuery: /fusionPrefix|fusionVarScope/,
            use: [
              {
                loader: "@alicloud/console-toolkit-fusion-css-loader",
              },
            ],
          },
        ],
      },
    ],
  },
  plugins: [new MiniCssExtractPlugin()],
};
```

## fusion css isolation

在源代码中引入 fusion 样式时（比如主题包中的[next.var.css](https://unpkg.alipay.com/browse/@alife/theme-xconsole-v4@0.4.13/dist/next.var.css)），可以这样引入：

```js
import "path/to/fusion.css?fusionPrefix=.my-prefix-";
```

它的作用是对这个 css 文件中的 CSS 选择器进行转换，把`.next-btn`的类名修改成`.my-prefix-btn`。从而限制 fusion 组件样式作用范围，避免多份 fusion 同时存在时出现样式冲突。

### 自动 fusion icon 字体隔离

上述用法会自动对 fusion icon 的字体做隔离，避免多份 fusion 出现 icon 冲突。

问题背景：过去，如果一个页面中同时存在多份不同版本的 fusion，并且这些 fusion 对有不同的 icon 定义。那么其中一份 fusion 的 icon 字体会被另一份覆盖，造成前者的 icon 错乱甚至不显示。问题根源是所有 icon 使用了相同的`font-family`名字`NextIcon`。

如果按照上述方式使用本 loader，它会自动将输入中的这种样式：

```css
@font-face {
  font-family: NextIcon;
  src: url("//at.alicdn.com/t/font_1899989_e0hzok75tkg.eot");
  src: url("//at.alicdn.com/t/font_1899989_e0hzok75tkg.eot?#iefix") format("embedded-opentype"),
    url("//at.alicdn.com/t/font_1899989_e0hzok75tkg.woff2") format("woff2"),
    url("//at.alicdn.com/t/font_1899989_e0hzok75tkg.woff") format("woff"), url("//at.alicdn.com/t/font_1899989_e0hzok75tkg.ttf")
      format("truetype"),
    url("//at.alicdn.com/t/font_1899989_e0hzok75tkg.svg#NextIcon") format("svg");
}

.next-icon {
  display: inline-block;
  font-family: NextIcon;
}
```

转换成这样：

```css
@font-face {
  font-family: MyPrefixIcon;
  src: url("//at.alicdn.com/t/font_1899989_e0hzok75tkg.eot");
  src: url("//at.alicdn.com/t/font_1899989_e0hzok75tkg.eot?#iefix") format("embedded-opentype"),
    url("//at.alicdn.com/t/font_1899989_e0hzok75tkg.woff2") format("woff2"),
    url("//at.alicdn.com/t/font_1899989_e0hzok75tkg.woff") format("woff"), url("//at.alicdn.com/t/font_1899989_e0hzok75tkg.ttf")
      format("truetype"),
    url("//at.alicdn.com/t/font_1899989_e0hzok75tkg.svg#NextIcon") format("svg");
}

.my-prefix-icon {
  display: inline-block;
  font-family: MyPrefixIcon;
}
```

因此，每份 fusion 使用的是各自指定的`font-family`名字，避免 icon 冲突。

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

> 很多时候，全局 reset 样式不会造成什么问题，因此你可以忽略这一小节。

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

> 大部分用户可以忽略这一小节。

如果想要引用 fusion 主题的 css-variable 定义，比如[主题包中的 variables.css](https://unpkg.alipay.com/browse/@alife/theme-xconsole-v4@0.4.13/variables.css)，可以这样引入：

```js
import "./fusion-theme/variables.css?fusionVarScope=.my-container";
```

它的作用是将这个 css 文件中的所有`:root`选择器转换成`.my-container`。从而限制该 fusion 主题的 css-variable 作用范围，避免多份 fusion 主题同时存在时出现样式冲突。

## 示例

[webpack 项目示例](https://github.com/aliyun/alibabacloud-console-toolkit/tree/preset-demos/packages/fusion-css-loader/fixture)。
