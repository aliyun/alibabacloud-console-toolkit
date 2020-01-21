interface IOption {
  rollup?: any;
  moduleName: string;
  globals: {
    [key: string]: string;
  };
  useTypescript?: boolean;
  typescript: {
    useBabel: boolean;
  };
  external: string[];
  sourcemap?: boolean;
  formats: {
    format: string;
    file: string;
    name?: string;
  }[];
  externals: any;
  babelJestTransformPatterns: string[];
  disableStyleRemove: boolean;
  entry: string;
  processJestConfig: (originalJestConfig: object) => object;
  bootJest: (jestConfig: any, cliArgs: any) => Promise<void>;
  webpackConfigPaths?: string[];
  babelModuleResolve?: object;
}
