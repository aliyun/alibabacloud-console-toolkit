import combineCreators from './combineCreators';
import createPluginCreator, {
  createPluginOptionsGetter,
} from './createPluginCreator';

const createFunctionBind = createPluginCreator(
  // This proposal introduces a new operator ::
  // which performs this binding and method extraction
  // https://github.com/tc39/proposal-bind-operator
  // https://babeljs.io/docs/en/next/babel-plugin-proposal-function-bind.html
  require('@babel/plugin-proposal-function-bind'),
  (options) => options.proposal.functionBind,
);

const createExportDefaultFrom = createPluginCreator(
  // The export ___ from "module" statements are a very useful mechanism
  // for building up "package" modules in a declarative way.
  // https://github.com/tc39/proposal-export-default-from
  // https://babeljs.io/docs/en/next/babel-plugin-proposal-export-default-from.html
  require('@babel/plugin-proposal-export-default-from'),
  (options) => options.proposal.exportDefaultFrom,
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
    // https://babeljs.io/docs/en/next/babel-plugin-proposal-pipeline-operator.html#via-babelrc-recommended
    topicToken: '^^',
  }),
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
    version: '2023-05',
  }),
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
  (options) => options.proposal.functionSent,
);

const createThrowExpressions = createPluginCreator(
  // A throw expression allows you to throw exceptions
  // in expression contexts.
  // https://github.com/tc39/proposal-throw-expressions
  // https://babeljs.io/docs/en/babel-plugin-proposal-throw-expressions
  require('@babel/plugin-proposal-throw-expressions'),
  (options) => options.proposal.throwExpressions,
);

const createAsyncDoExpression = createPluginCreator(
  /**
   * https://babeljs.io/docs/babel-plugin-proposal-async-do-expressions
   */
  require('@babel/plugin-proposal-async-do-expressions'),
  (options) => options.proposal.doExpression,
);

const createDestructuringPrivate = createPluginCreator(
  /**
   * https://babeljs.io/docs/babel-plugin-proposal-destructuring-private
   */
  require('@babel/plugin-proposal-destructuring-private'),
  (options) => options.proposal.destructuringPrivate,
);

const createDoExpression = createPluginCreator(
  /**
   * https://babeljs.io/docs/babel-plugin-proposal-do-expressions
   */
  require('@babel/plugin-proposal-do-expressions'),
  (options) => options.proposal.doExpression,
);

const createDuplicateNamedRegex = createPluginCreator(
  /**
   * https://babeljs.io/docs/babel-plugin-proposal-duplicate-named-capturing-groups-regex
   */
  require('@babel/plugin-proposal-duplicate-named-capturing-groups-regex'),
  (options) => options.proposal.duplicateNamedCapturingGroupsRegex,
);

const createExplicitResourceManagement = createPluginCreator(
  /**
   * https://babeljs.io/docs/babel-plugin-proposal-explicit-resource-management
   */
  require('@babel/plugin-proposal-explicit-resource-management'),
  (options) => options.proposal.explicitResourceManagement,
);

const createPartialApplication = createPluginCreator(
  /**
   * https://babeljs.io/docs/babel-plugin-proposal-partial-application
   */
  require('@babel/plugin-proposal-partial-application'),
  (options) => options.proposal.partialApplication,
);

const createRecordAndTuple = createPluginCreator(
  /**
   * https://babeljs.io/docs/babel-plugin-proposal-record-and-tuple
   */
  require('@babel/plugin-proposal-record-and-tuple'),
  (options) => options.proposal.recordAndTuple,
  createPluginOptionsGetter((options) => options.proposal.recordAndTuple, {
    importPolyfill: true,
  }),
);

const createRegexpModifiers = createPluginCreator(
  /**
   * https://babeljs.io/docs/babel-plugin-proposal-regexp-modifiers
   */
  require('@babel/plugin-proposal-regexp-modifiers'),
  (options) => options.proposal.regexpModifiers,
);

const createImportAttributes = createPluginCreator(
  /**
   * https://babeljs.io/docs/babel-plugin-syntax-import-attributes
   */
  require('@babel/plugin-syntax-import-attributes'),
  (options) => options.proposal.importAttributes,
);

export default combineCreators([
  createFunctionBind,
  createExportDefaultFrom,
  createPipelineOperator,
  createDecorator,
  createFunctionSent,
  createThrowExpressions,
  createAsyncDoExpression,
  createDestructuringPrivate,
  createDoExpression,
  createDuplicateNamedRegex,
  createExplicitResourceManagement,
  createPartialApplication,
  createRecordAndTuple,
  createRegexpModifiers,
  createImportAttributes,
]);
