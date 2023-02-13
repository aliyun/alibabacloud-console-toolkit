import * as babel from '@babel/core';

export interface IBuildOptions {
  cwd: string;
  babelPlugins?: babel.PluginItem[];
  sourcemap?: boolean;
  demo?: string;
}
