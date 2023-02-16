import * as babel from '@babel/core';

export interface IBuildOptions {
  cwd: string;
  /**
   * babelPlugins
   */
  babelPlugins?: babel.PluginItem[];
  /**
   * 是否生成 sourcemap
   */
  sourcemap?: boolean;
  /**
   * demo 目录路径
   */
  demo?: string;
  /**
   * src 目录路径
   */
  src?: string;
}
