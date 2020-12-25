import type React from "react";

export interface IDeps {
  [depName: string]: any;
}

export interface IConsoleOSOptions {
  servePath: string;
  consoleOSId: string;
  deps?: IDeps;
}

// 父应用提供的resolve方法，子应用可以从父应用拿到需要的信息
export interface IContextResolvers {
  resolveAppServePath?: (consoleOSId: string) => string;
  resolveAppDeps?: (consoleOSId: string) => IDeps;
  resolveDemoOpts?: (consoleOSId: string) => IDemoOpts;
}

export interface ILoadOverviewOpts
  extends IConsoleOSOptions,
    IContextResolvers {
  useSelfDeps?: boolean;
}

export interface IOverviewProps extends IContextResolvers {
  entryKey?: string;
  onEntryKeyChange?: (newEnrtyKey: string) => void;
  onLoaded?: () => void;
  markdownOpts?: {
    toc?: boolean;
    embedded?: boolean;
  };
}

export interface ILoadEntryLoaderOpts
  extends IConsoleOSOptions,
    IContextResolvers {
  useSelfDeps?: boolean;
}

export interface IEntryLoaderProps extends IContextResolvers {
  entryKey: string;
  onLoaded?: () => void;
  markdownOpts?: {
    toc?: boolean;
    embedded?: boolean;
  };
  demoOpts?: IDemoOpts;
}

export interface IDemoOpts {
  modifyDisplayCode?: (params: {
    code: string;
    meta: any;
    imports: string[];
  }) => string;
  modifyCodeSandbox?: (params: {
    code: string;
    meta: any;
    imports: string[];
    files: ICodeSandboxFiles;
  }) => ICodeSandboxFiles;
  extraOperations?: (params: {
    code: string;
    meta: any;
    imports: string[];
  }) => IDemoOperation[];
  containerClassName?: string;
  containerStyle?: any;
}
export interface ICodeSandboxFiles {
  [file: string]: string;
}
export interface IDemoOperation {
  name: string;
  icon: () => React.ReactNode;
  View?: React.ComponentType<{
    meta: any;
    code: string;
    setCode: any;
    originalCode: string;
    imports: string[];
    opts: IDemoOpts;
  }>;
}
