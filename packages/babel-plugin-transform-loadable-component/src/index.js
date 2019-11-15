const {
  getJSXAttr,
  createObjectExpression,
  createCalleeCallExpression,
} = require('./ast')

// eslint-disable-next-line max-lines-per-function
module.exports = ({ types }) => {
  const defaultReactLoadableSpecifier = '__React$$Loadable__'
  const defaultReactLoadableSource = 'react-loadable'

  // 用于记录 import 和被引用 JSX 的访问器
  const collectImportsVisitor = {
    /**
     * 遍历 import 声明
     * @param {NodePath} p
     */
    ImportDeclaration(p) {
      const specifiers = p.get('specifiers')
      const source = p.get('source')

      if (
        // 如果没有 specifier, 如 import 'module' 则直接略过该次遍历
        !specifiers ||
        !specifiers.length ||
        // 如果 source 非法则直接略过该次遍历
        !source ||
        !source.isStringLiteral()
      ) {
        return
      }

      // 目前只解析 default import 标识, 如果未发现 default import 特征, 则直接略过该次遍历
      const firstSpecifier = specifiers[0]
      if (!firstSpecifier || !firstSpecifier.isImportDefaultSpecifier()) {
        return
      }

      // 获得当前的 default import 标识
      const defaultImportIdentifier = firstSpecifier.get('local').node.name
      const importSource = source.node.value
      const importDeclarationMap = {
        source: importSource,
        path: p,
      }

      if (importSource === defaultReactLoadableSource) {
        // 如果找到了 react-loadable 的 import 引用, 则记录下来避免误删
        // 并在后续的转换过程直接使用该 identifier 作为引用值
        this.reactLoadableImport.set('path', p)
        this.reactLoadableImport.set('identifier', defaultImportIdentifier)
      } else {
        this.defaultImportsMap.set(
          defaultImportIdentifier,
          importDeclarationMap
        )
      }
    },
  }

  const transJSXElementVisitor = {
    /**
     * 遍历 JSX 元素
     * @param {NodePath} p
     */
    // eslint-disable-next-line max-len
    // eslint-disable-next-line max-lines-per-function, sonarjs/cognitive-complexity
    JSXElement(p) {
      let hasReferencedComponentProp = false
      let hasAsyncProp = false
      let hasLoadingProp = false
      let loadable = false
      const removeImports = []

      const COMPONENT = Symbol('__COMPONENT__')
      const ASYNC = Symbol('__ASYNC__')
      const LOADING = Symbol('__LOADING__')

      const attrs = p.get('openingElement').get('attributes')

      attrs.forEach((attrPath) => {
        // 如果不是一般的 attr (譬如 JSXSpreadAttribute), 则直接跳过检查
        if (!attrPath.isJSXAttribute()) {
          return
        }

        const { name, value, type } = getJSXAttr(attrPath)

        // 检查是否匹配 props.component: ReferencedIdentifier
        if (
          name === 'component' &&
          type === 'expression' &&
          value.isReferencedIdentifier() &&
          this.defaultImportsMap.has(value.node.name)
        ) {
          hasReferencedComponentProp = true
          // eslint-disable-next-line no-param-reassign
          attrPath[COMPONENT] = true
        }

        // 检查是否匹配 props.__async: true
        if (name === '__async') {
          hasAsyncProp = true
          // eslint-disable-next-line no-param-reassign
          attrPath[ASYNC] = true

          if (value === true) {
            loadable = true
          } else if (type === 'expression' && value.isBooleanLiteral()) {
            loadable = value.node.value
          }
        }

        if (name === '__loading' && type === 'expression') {
          hasLoadingProp = true
          // eslint-disable-next-line no-param-reassign
          attrPath[LOADING] = true
        }
      })

      if (hasReferencedComponentProp || hasAsyncProp || hasLoadingProp) {
        let newAttrs = attrs
        const existingReactLoadableIdentifier = this.reactLoadableImport.get(
          'identifier'
        )

        const loadingAttrPath = newAttrs.filter(
          attrPath => attrPath[LOADING]
        )[0]

        if (loadable && hasReferencedComponentProp) {
          newAttrs = newAttrs.map((attrPath) => {
            if (!attrPath[COMPONENT]) {
              return attrPath
            }

            const { value: originComponentValue } = getJSXAttr(attrPath)
            const {
              source,
              path: importDeclarationPath,
            } = this.defaultImportsMap.get(
              originComponentValue.node.name
            )

            this.matchedJSXSet.add(p)
            removeImports.push(importDeclarationPath)

            return {
              node: types.JSXAttribute(
                types.JSXIdentifier('component'),
                types.JSXExpressionContainer(
                  createCalleeCallExpression(
                    // eslint-disable-next-line max-len
                    existingReactLoadableIdentifier || defaultReactLoadableSpecifier,
                    [
                      createObjectExpression({
                        loader: types.arrowFunctionExpression(
                          [],
                          createCalleeCallExpression('import', [
                            types.stringLiteral(source),
                          ])
                        ),
                        loading: loadingAttrPath ?
                          loadingAttrPath.get('value').get('expression').node :
                          undefined,
                      }),
                    ]
                  )
                )
              ),
            }
          })
        }

        // eslint-disable-next-line no-param-reassign
        p.node.openingElement.attributes = newAttrs
          .filter(attrPath => (!attrPath[ASYNC] && !attrPath[LOADING]))
          .map(attrPath => attrPath.node)
      }

      removeImports.forEach((importPath) => {
        importPath && importPath.remove()
      })
    },
  }

  return {
    pre() {
      // 在开始遍历之前, 首先创建一个缓存对象, 用于存储 default import 声明
      //
      // 存储的规则为:
      // - key {string} ImportDefaultSpecifier.Identifier
      // - value {Map}
      //   - source: ImportSource.Literal
      //   - path: NodePath
      //
      // 如:
      // import DefaultExports from 'source'
      // 会被记录为
      // 'DefaultExports': {
      //   'path': NodePath,
      //   'source': String
      // }
      //
      this.defaultImportsMap = new Map()

      // 存储模式匹配的 jsx 声明
      //
      // 匹配模式:
      // - 包含 props.__async 属性声明
      // - 包含 props.component 属性声明, 其值必须是一个引用值
      // - 可能包含 props.__loading 属性声明
      // TODO(xingda.xd):目前先使用内置的模式, 将来考虑将这里做成配置项
      //
      this.matchedJSXSet = new Set()

      // 记录 react-loadable 的 import 引用
      //
      // 存储的规则为:
      // - identifier: Identifier
      // - path: NodePath
      //
      // 如:
      // import Loadable from 'react-loadable'
      // 会被记录为
      // { identifier: 'Loadable', path: NodePath }
      //
      this.reactLoadableImport = new Map()
    },

    post() {
      // 遍历结束之后释放对象引用以避免内存泄露
      this.defaultImportsMap = null
      this.matchedJSXSet = null
      this.reactLoadableImport = null
    },

    visitor: {
      Program: {
        enter(p) {
          // 在 AST 根节点进行遍历操作, 用来记录 AST 中所有的 default import 节点
          p.traverse(collectImportsVisitor, {
            defaultImportsMap: this.defaultImportsMap,
            matchedJSXSet: this.matchedJSXSet,
            reactLoadableImport: this.reactLoadableImport,
          })
          // 遍历 import 节点之后对 jsx 进行遍历, 对模式匹配的节点进行替换操作
          p.traverse(transJSXElementVisitor, {
            defaultImportsMap: this.defaultImportsMap,
            matchedJSXSet: this.matchedJSXSet,
            reactLoadableImport: this.reactLoadableImport,
          })
        },
        exit(p) {
          // eslint-disable-next-line max-len
          const existingReactLoadableIdentifier = this.reactLoadableImport.get('identifier')
          const hasLoadableComponent = this.matchedJSXSet.size

          // 如果存在模式匹配的组件, 则插入 react-loadable 的引用
          if (!existingReactLoadableIdentifier && hasLoadableComponent) {
            p.unshiftContainer('body', types.importDeclaration(
              [types.importDefaultSpecifier(
                types.identifier(defaultReactLoadableSpecifier)
              )],
              types.stringLiteral(defaultReactLoadableSource)
            ))
          }
        },
      },
    },
  }
}
