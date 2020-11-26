export interface IOption {
  moduleName: string;

  useTypescript?: boolean;

  sourcemap?: boolean;

  externals?: any;

  typescript?: {
    useBabel: boolean;
  };

  babelJestTransformPatterns?: string[];

  disableStyleRemove?: boolean;

  entry?: string;

  output?: string | {
    baseDir: string;
    dirs: Partial<OutputType>;
  };

  processJestConfig?: (originalJestConfig: object) => object;

  bootJest?: (jestConfig: any, cliArgs: any) => Promise<void>;

  webpackConfigPaths?: string[];

  babelModuleResolve?: object;

  bableFilter?: Function;

  rollup?: (rollConfig: any) => any;

  formats?: [{
    format: string;
    file: string;
    sourcemap: boolean;
  }];
}

export interface OutputType {
  es: string;
  cjs: string;
  umd: string;
}

export type OutputTypeKey = 'es' | 'cjs' | 'umd';