import { IOptions } from './types';

const defaultOptions: IOptions = {
  env: process.env.NODE_ENV || process.env.BABEL_ENV || 'production',
  useInternalRuntime: false,
  typescript: false,
  module: false,
  esModules: true,
  plugins: [],
  proposal: {
    asyncDoExpression: true,
    decorators: true,
    destructuringPrivate: true,
    doExpression: true,
    duplicateNamedCapturingGroupsRegex: true,
    explicitResourceManagement: true,
    exportDefaultFrom: true,
    functionBind: true,
    functionSent: true,
    partialApplication: true,
    pipelineOperator: true,
    recordAndTuple: true,
    regexpModifiers: true,
    throwExpressions: true,
    importAttributes: true,
  },
  reactHotLoader: false,
  reactRefresh: false,
  windCherryPick: true,
};

export default defaultOptions;
