import { PluginItem } from 'babel__core';

export interface IObject {
  [propName: string]: any;
}

type Proposal = boolean | IObject;

export interface IProposal {
  functionBind?: Proposal;
  exportDefaultFrom?: Proposal;
  logicalAssignmentOperators?: Proposal;
  optionalChaining?: Proposal;
  pipelineOperator?: Proposal;
  nullishCoalescingOperator?: Proposal;
  decorators?: Proposal;
  functionSent?: Proposal;
  exportNamespaceFrom?: Proposal;
  numericSeparator?: Proposal;
  throwExpressions?: Proposal;
  dynamicImport?: Proposal;
  importMeta?: Proposal;
  classProperties?: Proposal;
  jsonStrings?: Proposal;
}

export interface IOptionalOptions {
  env?: string;
  proposal?: IProposal;
  useInternalRuntime?: boolean;
  typescript?: boolean;
  module?: boolean | string;
  esModules?: boolean;
}

export interface IOptions {
  env: string;
  proposal: IProposal;
  useInternalRuntime: boolean;
  typescript: boolean;
  module: boolean | string;
  esModules: boolean;
}

export type BabelPlugin = PluginItem;
export type BabelPreset = PluginItem;
export type BabelPlugins = BabelPlugin[];
export type BabelPresets = BabelPreset[];
export type BabelCreator = (options: IOptions) => PluginItem | void;
