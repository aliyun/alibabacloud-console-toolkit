import { PluginItem } from 'babel__core';

export interface IObject {
  [propName: string]: any;
}

type Proposal<P = {}> = boolean | IObject & P;

export interface IProposal {
  /**
   * plugin-proposal-async-do-expressions
   */
  asyncDoExpression?: Proposal;
  /**
   * plugin-proposal-decorators
   */
  decorators?: Proposal;
  /**
   * plugin-proposal-destructuring-private
   */
  destructuringPrivate?: Proposal;
  /**
   * plugin-proposal-do-expressions
   */
  doExpression?: Proposal;
  /**
   * plugin-proposal-duplicate-named-capturing-groups-regex
   */
  duplicateNamedCapturingGroupsRegex?: Proposal;
  /**
   * plugin-proposal-explicit-resource-management
   */
  explicitResourceManagement?: Proposal;
  /**
   * plugin-proposal-export-default-from
   */
  exportDefaultFrom?: Proposal;
  /**
   * plugin-proposal-function-bind
   */
  functionBind?: Proposal;
  /**
   * plugin-proposal-function-sent
   */
  functionSent?: Proposal;
  /**
   * plugin-proposal-partial-application
   */
  partialApplication?: Proposal;
  /**
   * plugin-proposal-pipeline-operator options
   */
  pipelineOperator?: Proposal<{ topicToken?: string }>;
  /**
   * plugin-proposal-record-and-tuple
   */
  recordAndTuple?: Proposal;
  /**
   * plugin-proposal-regexp-modifiers
   */
  regexpModifiers?: Proposal;
  /**
   * plugin-proposal-throw-expressions
   */
  throwExpressions?: Proposal;
  /**
   * plugin-syntax-import-attributes
   */
  importAttributes?: Proposal;
}

export interface IOptions {
  env: string;
  useInternalRuntime: boolean;
  typescript: boolean;
  module: boolean | string;
  esModules: boolean;
  plugins: PluginItem[];
  proposal: IProposal;
  reactHotLoader: boolean;
  reactRefresh: boolean;
  windCherryPick: boolean;
  presetEnv: Record<string, any>;
  presetReact: Record<string, any>;
  presetTypescript: Record<string, any>;
  moduleResolver?: Record<string, any>;
  useBuiltIns?: 'usage' | 'entry' | false;
}

export type BabelPlugin = PluginItem;
export type BabelPreset = PluginItem;
export type BabelPlugins = BabelPlugin[];
export type BabelPresets = BabelPreset[];
export type BabelCreator = (options: IOptions) => PluginItem | undefined;
