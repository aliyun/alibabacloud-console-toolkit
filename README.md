# Breezr

## 介绍
```console-toolkit``` 又名 （💨breezr 💨读作 [briːzr]，来源是 breeze）。定位是可插拔的阿里云控制台构建系统，覆盖源码到构建部署的整个生命周期。在核心插件机制的配合下，支持各种业务和功能的扩展。

## 特性

 * 📦 开箱即用，内置了开发阿里云控制台的脚手架，dev server 和 构建器
 * 🏂 内置文件系统路由，用户不用关心路由配置
 * 🚀 高性能，内置长效缓存策略，一键 code splitting
 * 📎 完善的插件体系
 * 🔥 preset 机制，根据业务组合构建体系更方便

## 使用文档

新建目录

```
$ mkdir consoleApp && cd consoleApp
```

初始化项目代码

```
$ npx breezr init
```

调试项目

```
$ cd consoleApp
$ npm run start
```

构建项目
```
$ cd consoleApp
$ npm run build
```

## 贡献指南

参见[贡献指南](https://github.com/aliyun/alibabacloud-console-toolkit/blob/master/CONTRIBUTING.md)
