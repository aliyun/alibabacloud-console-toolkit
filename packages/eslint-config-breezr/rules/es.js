// es5/6 通用
module.exports = {
  /*
   * 跟集团的基本一致，除了对 parameters 和 arguments 这里由 1 改成了 2
   */
  indent: ['error', 2, {
    SwitchCase: 1,
    VariableDeclarator: 1,
    outerIIFEBody: 1,
    // MemberExpression: null,
    FunctionDeclaration: {
      parameters: 2,
      body: 1
    },
    FunctionExpression: {
      parameters: 2,
      body: 1
    },
    CallExpression: {
      arguments: 2
    },
    ArrayExpression: 1,
    ObjectExpression: 1,
    ImportDeclaration: 1,
    flatTernaryExpressions: false,
    // list derived from https://github.com/benjamn/ast-types/blob/master/def/jsx.ts
    ignoredNodes: [
      'JSXElement',
      'JSXElement > *',
      'JSXAttribute',
      'JSXIdentifier',
      'JSXNamespacedName',
      'JSXMemberExpression',
      'JSXSpreadAttribute',
      'JSXExpressionContainer',
      'JSXOpeningElement',
      'JSXClosingElement',
      'JSXText',
      'JSXEmptyExpression',
      'JSXSpreadChild'
    ],
    ignoreComments: false
  }],
  /*
   * eslint-config-ali 用的是 multi-line，且说「多行语句必须用大括号包裹，单行语句推荐用大括号包裹」
   * 但这会导致不一致，且容易在增加代码的时候出错
   */
  curly: ['error', 'all'],
  /*
   * 这条规则其实可以提高代码的可理解度
   * eslint-config-ali 把它关了
   * https://eslint.org/docs/rules/no-else-return
   */
  'no-else-return': ['warn', {
    allowElseIf: false
  }],
  /*
   * eslint-config-ali 把 props 设成了 true，然后加了 ignorePropertyModificationsFor 配置，
   * 然而更合理的 ignorePropertyModificationsFor 应该由应用层级来设置
   */
  'no-param-reassign': ['warn', {
    props: false
  }],
  /*
   * 忽略空行和注释中的尾部空白
   */
  'no-trailing-spaces': ['error', {
    skipBlankLines: true,
    ignoreComments: true
  }],
  /*
   * eslint-config-ali 设置了 off，合理的空行 padding 对阅读理解很有帮助
   */
  'padding-line-between-statements': ['error', {
    blankLine: 'always',
    prev: ['const', 'let', 'var', 'if', 'for', 'while', 'switch', 'try'],
    next: '*'
  }, {
    blankLine: 'any',
    prev: ['const', 'let', 'var'],
    next: ['const', 'let', 'var']
  }, {
    blankLine: 'always',
    prev: '*',
    next: ['return', 'throw', 'break', 'continue', 'if', 'for', 'while', 'switch', 'try']
  }]
};
