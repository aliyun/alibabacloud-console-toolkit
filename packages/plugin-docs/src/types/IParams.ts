import * as Chain from 'webpack-chain';
import { IExternalItem } from './IExternalItem';

export default interface IParams {
  consoleOSId: string;
  demoType?: string;
  storeUrl?: string;
  chainWebpack?: (configChain: Chain, env: any) => void;
  // 由于breezr的plugin不支持异步返回，因此，getDemos等函数也必须是同步的
  getDemos?: () => {
    key: string;
    path: string;
    staticMeta?: Record<string, any>;
  }[];
  demoContainerPath?: string;
  demoWrapperPath?: string;
  demoOptsPath?: string;
  initializerPath?: string;
  codesandboxModifierPath?: string;
  getMarkdownEntries?: () => {
    key: string;
    path: string;
    staticMeta?: object;
  }[];
  getNormalEntries?: () => {
    key: string;
    path: string;
    staticMeta?: object;
  }[];
  getTypeInfoEntries?: () => {
    key: string;
    path: string;
    staticMeta?: object;
  }[];
  externals?: IExternalItem[];
  resolveAppServePath?: string;
  output?: string;
  devServer?: {
    https?: boolean;
    host?: string;
  };
}
