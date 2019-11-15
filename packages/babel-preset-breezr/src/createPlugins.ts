import { dirname } from 'path';
import combineCreators from './combineCreators';
import createPluginCreator, {
  createPluginOptionsGetter
} from './createPluginCreator';

const createTransformRuntime = createPluginCreator(
  require('@babel/plugin-transform-runtime').default,
  true,
  (options) => {
    const absoluteRuntimePath: string | boolean = (
      options.useInternalRuntime &&
      dirname(require.resolve('@babel/runtime/package.json'))
    );

    return {
      // Do not replace things like `Promise` or `Symbol`
      // with the library functions in `core-js`
      // https://babeljs.io/docs/en/babel-plugin-transform-runtime#corejs
      // https://babeljs.io/docs/en/next/babel-runtime-corejs2.html#difference-from-babel-runtime
      corejs: false,

      // Replace babel helpers with calls to moduleName
      // https://babeljs.io/docs/en/babel-plugin-transform-runtime#helpers
      // https://babeljs.io/docs/en/babel-plugin-transform-runtime#helper-aliasing
      helpers: true,

      // Transform generator functions to use a regenerator runtime
      // that does not pollute the global scope
      // https://babeljs.io/docs/en/babel-plugin-transform-runtime#regenerator
      // https://babeljs.io/docs/en/babel-plugin-transform-runtime#regenerator-aliasing
      regenerator: true,

      // Prefer ES6 Modules
      // https://babeljs.io/docs/en/babel-plugin-transform-runtime#useesmodules
      useESModules: options.esModules,

      // Resolving runtime in this package
      // https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-runtime/src/index.js#L41
      absoluteRuntime: absoluteRuntimePath,
    };
  }
);

const createFunctionBind = createPluginCreator(
  // This proposal introduces a new operator ::
  // which performs this binding and method extraction
  // https://github.com/tc39/proposal-bind-operator
  // https://babeljs.io/docs/en/next/babel-plugin-proposal-function-bind.html
  require('@babel/plugin-proposal-function-bind'),
  (options) => options.proposal.functionBind
);

const createExportDefaultFrom = createPluginCreator(
  // The export ___ from "module" statements are a very useful mechanism
  // for building up "package" modules in a declarative way.
  // https://github.com/tc39/proposal-export-default-from
  // https://babeljs.io/docs/en/next/babel-plugin-proposal-export-default-from.html
  require('@babel/plugin-proposal-export-default-from'),
  (options) => options.proposal.exportDefaultFrom
);

const createLogicalAssignmentOperators = createPluginCreator(
  // To combine logical operators and assignment expressions.
  // https://github.com/tc39/proposal-logical-assignment
  // https://babeljs.io/docs/en/next/babel-plugin-proposal-logical-assignment-operators.html
  require('@babel/plugin-proposal-logical-assignment-operators'),
  (options) => options.proposal.logicalAssignmentOperators
);


const createOptionalChaining = createPluginCreator(
  // Allows to handle many of checking a property value
  // whether intermediate nodes exist in a tree-like structure
  // without repeating themselves and/or assigning intermediate results
  // in temporary variables
  // https://github.com/tc39/proposal-optional-chaining
  // https://babeljs.io/docs/en/next/babel-plugin-proposal-optional-chaining.html
  require('@babel/plugin-proposal-optional-chaining'),
  (options) => options.proposal.optionalChaining,
  createPluginOptionsGetter((options) => options.proposal.optionalChaining, {
    // Strict equality checks against both null and undefined
    // https://babeljs.io/docs/en/next/babel-plugin-proposal-optional-chaining.html#loose
    loose: false,
  })
);

const createPipelineOperator = createPluginCreator(
  // Make streamlining chained function calls in a readable,
  // functional manner, and provides a practical alternative
  // to extending built-in prototypes.
  // https://github.com/tc39/proposal-pipeline-operator
  // https://babeljs.io/docs/en/next/babel-plugin-proposal-pipeline-operator.html
  require('@babel/plugin-proposal-pipeline-operator'),
  (options) => options.proposal.pipelineOperator,
  createPluginOptionsGetter((options) => options.proposal.pipelineOperator, {
    // This plugin should use a configuration with the "proposal" option.
    // Only "minimal" is currently supported.
    // https://babeljs.io/docs/en/next/babel-plugin-proposal-pipeline-operator.html#via-babelrc-recommended
    proposal: 'minimal',
  })
);

const createNullishCoalescingOperator = createPluginCreator(
  // To provide a default value if the result of that property access
  // is null or undefined. At present, a typical way to express this intent
  // in JavaScript is by using the `||` operator.
  // https://github.com/tc39-transfer/proposal-nullish-coalescing
  // https://babeljs.io/docs/en/babel-plugin-proposal-nullish-coalescing-operator
  require('@babel/plugin-proposal-nullish-coalescing-operator'),
  (options) => options.proposal.nullishCoalescingOperator,
  createPluginOptionsGetter(
    (options) => options.proposal.nullishCoalescingOperator,
    {
      // To strict equality checks against both null and undefined
      // like proposal.optionalChaining.
      // https://babeljs.io/docs/en/babel-plugin-proposal-nullish-coalescing-operator#loose
      loose: false,
    }
  )
);

const createDecorator = createPluginCreator(
  // To make it possible to annotate and modify classes and properties
  // at design time.
  // https://github.com/wycats/javascript-decorators
  // https://github.com/tc39/proposal-decorators
  // https://babeljs.io/docs/en/next/babl-plugin-proposal-decorators.html
  require('@babel/plugin-proposal-decorators'),
  (options) => options.proposal.decorators,
  createPluginOptionsGetter((options) => options.proposal.decorators, {
    // Use the legacy (stage 1) decorators syntax and behavior.
    // https://babeljs.io/docs/en/next/babel-plugin-proposal-decorators.html#legacy
    legacy: true,
  })
);

const createFunctionSent = createPluginCreator(
  // The value of function.sent within the body of a Generator Function
  // is the value passed to the generator by the next method
  // that most recently resumed execution of the generator.
  // In particular, referencing `function.sent` prior
  // to the first evaluation of a yield operator
  // returns the argument value passed by the next call
  // that started evaluation of the GeneratorBody.
  // https://github.com/allenwb/ESideas/blob/master/Generator%20metaproperty.md
  // https://babeljs.io/docs/en/next/babel-plugin-proposal-function-sent.html
  require('@babel/plugin-proposal-function-sent'),
  (options) => options.proposal.functionSent
);

const createExportNamespaceFrom = createPluginCreator(
  // The import statement which does not have corresponding
  // export-from statement, exporting the `ModuleNameSpace` object
  // as a named export.
  // https://github.com/tc39/proposal-export-ns-from
  // https://babeljs.io/docs/en/babel-plugin-proposal-export-namespace-from
  require('@babel/plugin-proposal-export-namespace-from'),
  (options) => options.proposal.exportNamespaceFrom
);

const createNumericSeparator = createPluginCreator(
  // to make their numeric literals more readable
  // by creating a visual separation between groups of digits.
  // https://github.com/tc39/proposal-numeric-separator
  // https://babeljs.io/docs/en/babel-plugin-proposal-numeric-separator
  require('@babel/plugin-proposal-numeric-separator'),
  (options) => options.proposal.numericSeparator
);

const createThrowExpressions = createPluginCreator(
  // A throw expression allows you to throw exceptions
  // in expression contexts.
  // https://github.com/tc39/proposal-throw-expressions
  // https://babeljs.io/docs/en/babel-plugin-proposal-throw-expressions
  require('@babel/plugin-proposal-throw-expressions'),
  (options) => options.proposal.throwExpressions
);

const createDynamicImport = createPluginCreator(
  // To provide a 'function-like' `import()` module loading syntactic
  // form to JavaScript.
  // https://github.com/tc39/proposal-dynamic-import
  // https://babeljs.io/docs/en/babel-plugin-syntax-dynamic-import
  require('@babel/plugin-syntax-dynamic-import'),
  (options) => options.proposal.dynamicImport
);

const createImportMeta = createPluginCreator(
  // For holding host-specific metadata about the current module.
  // https://github.com/tc39/proposal-import-meta
  // https://babeljs.io/docs/en/babel-plugin-syntax-import-meta
  require('@babel/plugin-syntax-import-meta'),
  (options) => options.proposal.importMeta
);

const createClassProperties = createPluginCreator(
  // To support for 'Class instance fields' and 'Class static fields'
  // https://github.com/jeffmo/es-class-static-properties-and-fields
  // https://babeljs.io/docs/en/next/babel-plugin-proposal-class-properties.html
  require('@babel/plugin-proposal-class-properties'),
  (options) => options.proposal.classProperties,
  createPluginOptionsGetter((options) => options.proposal.classProperties, {
    // When `true`, class properties are compiled to
    // use an assignment expression instead of `Object.defineProperty`.
    // https://babeljs.io/docs/en/next/babel-plugin-proposal-class-properties.html#loose
    //
    // This plugin must be used in loose mode to support the
    // **@babel/plugin-proposal-decorators**
    // which using the `legacy: true` mode
    // https://babeljs.io/docs/en/next/babel-plugin-proposal-decorators.html#legacy
    loose: true,
  })
);

const createJSONStrings = createPluginCreator(
  // To process valid JSON into valid ECMAScript before embedding it.
  // https://github.com/tc39/proposal-json-superset
  require('@babel/plugin-proposal-json-strings'),
  (options) => options.proposal.jsonStrings
);

export default combineCreators([
  createTransformRuntime,
  createFunctionBind,
  createExportDefaultFrom,
  createLogicalAssignmentOperators,
  createOptionalChaining,
  createPipelineOperator,
  createNullishCoalescingOperator,
  createDecorator,
  createFunctionSent,
  createExportNamespaceFrom,
  createNumericSeparator,
  createThrowExpressions,
  createDynamicImport,
  createImportMeta,
  createClassProperties,
  createJSONStrings,
]);
