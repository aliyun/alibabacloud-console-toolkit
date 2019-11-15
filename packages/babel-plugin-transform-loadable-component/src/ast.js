const types = require('babel-types')
const { forOwn } = require('./utils')

const getJSXAttr = (path) => {
  const attrName = path.get('name').node.name
  const attrValuePath = path.get('value')
  const result = { name: attrName, type: 'literal' }

  // 解析没有显式值声明的属性, 如 `visible` 会被解析为 { value: true }
  if (attrValuePath.node === null) {
    return Object.assign(result, { value: true })
  }

  // 解析显式声明为字符串值的属性, 如 `type="primary"` 会被解析为 { value: 'primary' }
  if (attrValuePath.isStringLiteral()) {
    return Object.assign(result, { value: attrValuePath.node.value })
  }

  // 解析显式声明为表达式值的属性
  // 如 `component={Component}` 会被解析为 { value: [[NodePath]] }
  // 可以根据 NodePath 对表达式进行进一步的解析
  if (attrValuePath.isJSXExpressionContainer()) {
    const valueExpressionPath = attrValuePath.get('expression')
    return Object.assign(result, {
      value: valueExpressionPath,
      type: 'expression',
    })
  }

  return result
}

exports.getJSXAttr = getJSXAttr

/**
 * 创建 callee 类型的函数调用表达式
 * @param {String} name
 * @param {Array} args
 */
const createCalleeCallExpression = (name, args) => types.callExpression(
  types.identifier(name),
  args
)

exports.createCalleeCallExpression = createCalleeCallExpression

/**
 * 创建对象属性
 * @param {String} key
 * @param {NodePath} value
 */
const createObjectProperty = (key, value) => types.objectProperty(
  types.identifier(key),
  value
)

exports.createObjectProperty = createObjectProperty

/**
 * 创建对象表达式
 * @param {Object<String, NodePath>} descriptor
 * @param {Object=} options
 */
const createObjectExpression = (descriptor, options = {}) => {
  const {
    // 是否需要剔除 undefined 属性
    omitUndefined = true,
  } = options

  const props = []

  forOwn(descriptor, (value, key) => {
    if (omitUndefined && typeof value === 'undefined') {
      return
    }

    props.push(
      createObjectProperty(key, value)
    )
  })

  return types.objectExpression(props)
}

exports.createObjectExpression = createObjectExpression
