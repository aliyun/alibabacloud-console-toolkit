`npm run doc-dev` 启动本地开发服务器，构建当前 package 的文档。

因为文档工具依赖于这个 package，所以要先`npm run prepare`，否则打包的时候回提示找不到'@alicloud/console-toolkit-docs-consumer'。
