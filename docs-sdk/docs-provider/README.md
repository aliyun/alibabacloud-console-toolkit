# breezr-docs

breezr-docs 是一套基于 webpack 的文档、demo 开发环境。

将文档**分拆**到各自的项目维护，靠近各自的源代码，让它们可以随源代码的发布周期进行发布；开发官网站点时，又可以将各个仓库的文档**汇集**起来，给用户提供全面的文档。

一个文档项目，可以包含若干个 demo、markdown 文档；一个官网站点，可以从多个文档项目加载 demo、markdown 文档。

示例项目与文档：
http://gitlab.alibaba-inc.com/sirui.csr/breezr-doc-demo

示例项目2 (在预发控制台加载本地开发的breezr-docs，从而可以在本地开发时直接调用后端接口，不需要绑定任何host)：
https://gitlab.alibaba-inc.com/xconsole/open-platform/blob/673749953499316d5c63ce0d727ce7a8597bb51d/packages/xconsole-open-template/README.md#L11

示例项目3 （通过绑定OneConsole预发hosts + 指定开发服务器的host为控制台域名 + 使用https 来实现本地直接调用后端接口）
https://gitlab.alibaba-inc.com/wind/rc-rd-tree/blob/578faeab93700781ef083c1c3bb34e919b42b530/README.md#L52

## 维护信息

`src/`下是插件代码（运行在node环境）
`src2/`下是客户端代码（运行在浏览器环境）
