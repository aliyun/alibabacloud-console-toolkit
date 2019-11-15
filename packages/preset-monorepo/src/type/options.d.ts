interface IOption {
  babelJestTransformPatterns?: string[];
  processJestConfig?: (originalJestConfig: object) => object;
  bootJest?: (jestConfig: any, cliArgs: any) => Promise<void>;
  packageDirs?: string[];
  monoRootDir?: string;
  dirWithPackages?: string;
}
