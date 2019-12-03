---
name: project
zhName: 创建一个项目
sort: 3
---

# 初始化项目代码

```bash
$ npx @alicloud/console-toolkit-cli init
```

命令行会你提示选取一个 preset。 你可以
### 调试项目

启动本地调试服务器

```bash
$ cd consoleApp
$ npm run start
```

然后在 在 http://localhost:3333, 可以访问到当前的页面.

### 构建项目

npm run build 执行整个项目的构建

```bash
$ cd consoleApp
$ npm run build
```