# Breezr docs

`/docs-sdk`文件夹脱离于仓库的 lerna 管理，它独立使用 pnpm 来管理。`/docs-sdk`下的所有包都处于一个 pnpm workspace 下。

- 通过`pnpm install`命令来安装依赖，并 link 本地依赖。
- 通过`npm run pub`脚本来发布所有尚未发布的包。注意不要自己使用`npm publish`来发布，因为 package.json 中包含一些特殊的`workspace:`语法（它们是用来[指导 pnpm link 本地依赖](https://pnpm.io/workspaces#workspace-protocol-workspace)的），因此**必须使用 pnpm 来发布**，pnpm 会在发布之前剔除掉特殊语法。
- package.json 中还有一些方便的脚本，来更新依赖、更新版本号、同步 tnpm。这些你可以选择不用。
