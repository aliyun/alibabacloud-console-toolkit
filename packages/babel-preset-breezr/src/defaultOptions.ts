import { IOptions } from './types';

const defaultOptions: IOptions = {
  env: process.env.NODE_ENV || process.env.BABEL_ENV || 'production',
  useInternalRuntime: false,
  typescript: false,
  module: false,
  esModules: true,
  proposal: {
    functionBind: true,
    exportDefaultFrom: true,
    logicalAssignmentOperators: true,
    optionalChaining: true,
    pipelineOperator: true,
    nullishCoalescingOperator: true,
    decorators: true,
    functionSent: true,
    exportNamespaceFrom: true,
    numericSeparator: true,
    throwExpressions: true,
    dynamicImport: true,
    importMeta: true,
    classProperties: true,
    jsonStrings: true,
  },
};

export default defaultOptions;
