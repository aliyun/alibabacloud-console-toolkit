# @alicloud/console-toolkit-plugin-docs

> [@alicloud/console-toolkit-plugin-docs](https://github.com/aliyun/alibabacloud-console-toolkit/tree/master/packages/plugin-docs) 是一套基于 `webpack` 的文档、`demo` 开发环境。（由 [csr632](https://github.com/csr632) 开发的 [@alicloud/console-toolkit-preset-docs](https://github.com/aliyun/alibabacloud-console-toolkit/tree/v1.2.58/docs-sdk/docs-provider) 修改而来）  
> 可以将文档分拆到各自项目中进行维护，方便随着项目源代码开发进行发布，在官网站点中，可以将各个仓库中文档汇集起来，给用户提供全面的文档。  
> 示例项目：

## 使用文档

> 不建议单独使用，可以通过 [@alicloud/console-toolkit-preset-component](https://github.com/aliyun/alibabacloud-console-toolkit/tree/master/packages/preset-wind-component) 进行使用。  
> **`consoleOSId` 需使用符合 `URL` 规范的字符!!!**

### 参数文档

> 后续补充...

### 配置文件示例

```typescript
import path from 'path';

module.exports = {
  presets: [
    [
      '@alicloud/console-toolkit-preset-component',
      {
        moduleName: 'docs-example',
        useTypescript: true,
        docs: {
          consoleOSId: 'docs-example',
          externals: [
            {
              moduleName: '@alicloud/test-button',
              usePathInDev: path.resolve(__dirname, '../src/index.ts'),
            },
            'styled-components',
          ],
        },
      },
    ],
  ],
};
```

### 移动端配置文件示例

> 移动端 `Demo` 容器组件开发中...

```typescript
import path from "path";

module.exports = {
  presets: [
    [
      "@alicloud/console-toolkit-preset-component",
      {
        moduleName: "mobile-docs-example",
        useTypescript: true,
        docs: {
          consoleOSId: "mobile-docs-demo",
          demoType: "mobile",
          externals: [
            {
              moduleName: "@ali/console-mobile-components-basic-list",
              usePathInDev: path.resolve(__dirname, "../src/index.tsx"),
            },
            "styled-components",
          ],
          demoOptsPath: path.resolve(__dirname, "./demoOpts"),
        },
      },
    ],
  ],
};
```

## 开发文档

> `src` 目录：插件基础代码  
`src2` 目录：生成文档的预览页面代码

## 相关依赖

> 本项目依赖 [docs-sdk](https://github.com/aliyun/alibabacloud-console-toolkit/tree/master/docs-sdk) 中部分依赖。

- [@alicloud/console-toolkit-docs-consumer](https://github.com/aliyun/alibabacloud-console-toolkit/tree/master/docs-sdk/docs-consumer)：文档展示组件
- [@alicloud/console-toolkit-fusion-css-loader](https://github.com/aliyun/alibabacloud-console-toolkit/tree/master/docs-sdk/fusion-css-loader)：用来修改 fusion 的 css 的选择器类名前缀
- [@alicloud/console-toolkit-markdown-renderer](https://github.com/aliyun/alibabacloud-console-toolkit/tree/master/docs-sdk/markdown-renderer)：`MarkDown` 文档生成
- [@alicloud/console-toolkit-docs-shared](https://github.com/aliyun/alibabacloud-console-toolkit/tree/master/docs-sdk/shared)：共享类型文件
