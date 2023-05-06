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
  /**
   * build output path
   */
  output?: string;
  /**
   * dev-server host
   */
  host?: string;
  /**
   * dev-server port
   */
  port?: number;
  /**
   * rollup output.globals
   */
  globals?: { [id: string]: string }| ((id: string) => string);
  /**
   * option for @rollup/plugin-virtual
   */
  virtual?: { [id: string]: string };
}
