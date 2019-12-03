---
name: quick-start
zhName: 快速上手
sort: 1
---

# 快速上手

## 基础环境准备

### node

先安装 Node 环境, 推荐保证是 8.10.x 以上. 请访问 https://nodejs.org/en/download/ 来根据操作系统和环境安装 Node.js

```bash
# mac
$ brew install node
$ node -v
```

### 项目脚手架

```bash
$ mkdir consoleApp && cd consoleApp
```

初始化项目代码

```bash
$ npx @alicloud/console-toolkit-cli init
```

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