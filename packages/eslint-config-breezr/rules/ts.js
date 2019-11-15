module.exports = {
  '@typescript-eslint/indent': ['error', 2, {
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
  '@typescript-eslint/no-use-before-define': ['error', {
    functions: true,
    classes: true
  }],
  '@typescript-eslint/camelcase': ['error', {
    properties: 'always'
  }],
  '@typescript-eslint/interface-name-prefix': ['error', 'always'],
  '@typescript-eslint/explicit-member-accessibility': ['error', {
    accessibility: 'no-public'
  }],
  '@typescript-eslint/explicit-function-return-type': ['warn', {
    allowExpressions: true,
    allowTypedFunctionExpressions: true
  }],
  '@typescript-eslint/no-empty-interface': ['error', {
    allowSingleExtends: true
  }],
  '@typescript-eslint/no-non-null-assertion': 'off'
};
