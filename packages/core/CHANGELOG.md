# V2.0.0

- 配置归一
  - 不再支持通过 package.json 依赖解析插件的嵌套依赖插件
- 插件 PluginAPI 废弃，升级为 context
  - context 为全局唯一单例
  - 集成 shared-utils 相关工具方法
  - context 提供统一的 cwd（readonly），不建议插件内部自行获取 cwd
- node.js >= 14
- 内置了 cli 初始化功能
- 内置了 脚手架 功能
  - 支持 本地/npm 形式加载模版