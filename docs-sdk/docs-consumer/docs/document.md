# @alicloud/console-toolkit-docs-consumer

从指定地址加载文档模块。

文档模块是由`@alicloud/console-toolkit-preset-docs`构建的。

## 使用方式

安装依赖：

```sh
npm install -S @alicloud/console-toolkit-docs-consumer
```

使用加载器：

```tsx
import { EntryLoader } from "@alicloud/console-toolkit-docs-consumer";

export function App() {
  return (
    <EntryLoader
      // 地址可以是 cdn 地址，也可以是文档本地开发服务器的地址。
      servePath="http://localhost:3333/"
      // 文档微应用的id
      consoleOSId="breezr-docs-fixture"
      // 要加载哪个文档
      entryKey={"docs/md1"}
      // markdown渲染相关的参数
      markdownOpts={{ toc: true }}
      // useSelfDeps使用文档模块自带的依赖，你也可以通过deps指定依赖
      useSelfDeps
    />
  );
}
```
