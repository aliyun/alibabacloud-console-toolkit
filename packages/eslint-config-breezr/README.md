eslint-config-breezr
=====================

[如何写你自己的可共享的 eslint config](https://eslint.org/docs/developer-guide/shareable-configs)

# INSTALL

```sh
npm i -D eslint babel-eslint eslint-config-breezr
```

# USE

## `.eslintrc`

在你的项目根目录下新建 `.eslintrc`，内容如下：

## es5 项目

```json
{
  "extends": [
    "eslint-config-breezr/es5"
  ]
}
```

## es6 项目

```json
{
  "extends": [
    "eslint-config-breezr/es6"
  ]
}
```

## react 项目

```json
{
  "parser": "babel-eslint",
  "extends": [
    "eslint-config-breezr/react"
  ]
}
```

需要在你的项目下安装 `babel-eslint`

```
npm i -D babel-eslint
```

## ts / tsx项目

```json
{
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint-config-breezr/ts"
  ]
}
```

```json
{
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint-config-breezr/tsx"
  ]
}
```

需要在你的项目下安装 `@typescript-eslint/parser`

```
npm i -D @typescript-eslint/parser
```

## `.eslintignore`

```ignore
# common

.*/

# generated

build/
coverage/
lib/
dist/
```

## npm script

在 `package.json` 里的 `"scripts"` 里添加 `lint` 命令：

```json
{
  "script": {
    "lint": "eslint src/"
  }
}
```

在项目根目录下执行 `yarn lint` 或 `npm run lint` 查看结果。

# IDE Support

* [VsCode](https://github.com/Microsoft/vscode-eslint)
* [WebStorm](https://www.jetbrains.com/help/webstorm/eslint.html#ws_js_linters_eslint_install_and_configure)
