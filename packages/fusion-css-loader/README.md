# @alicloud/console-toolkit-fusion-css-loader

这是一个 webpack loader，用来修改 fusion 的 css 的类名前缀。比如把`.next-btn`的类名修改成`.my-prefix-btn`。
这样做的目的是，让一个页面中可以同时存在多份不同版本的 fusion，同时不会出现样式冲突。

## 使用方式

先配置 webpack，让这个 loader 在 css-loader 之前执行：

```js
/* config.module.rule('css') */
{
  test: /\.css$/,
  rules: [
    /* config.module.rule('css').rule('style-loader') */
    {
      use: [
        /* config.module.rule('css').rule('style-loader').use('style-loader') */
        {
          loader: 'style-loader'
        }
      ]
    },
    /* config.module.rule('css').rule('css-loader') */
    {
      use: [
        /* config.module.rule('css').rule('css-loader').use('css-loader') */
        {
          loader: 'css-loader'
        }
      ]
    },
    /* config.module.rule('css').rule('fusion-css-loader') */
    {
      resourceQuery: /fusionPrefix/,
      use: [
        /* config.module.rule('css').rule('fusion-css-loader').use('fusion-css-loader') */
        {
          loader: '@alicloud/console-toolkit-fusion-css-loader'
        }
      ]
    }
  ]
}
```

然后在源代码中这样引入 fusion 样式：

```js
import "path/to/fusion.css?fusionPrefix=.my-prefix-";
```

在打包的时候，就会对这个样式文件内的 CSS 选择器进行转换。
