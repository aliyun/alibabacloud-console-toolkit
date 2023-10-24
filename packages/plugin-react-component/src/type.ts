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
   * @deprecated
   * esm output path
   */
  output?: string;
  /**
   * umd options
   */
  umd?: {
    /**
     * default ./dist
     */
    output?: string;
    name: string;
    /**
     * 入口文件，默认值 src/index
     */
    entry?: string;
  };
  /**
   * cjs options
   */
  cjs?: {
    /**
     * default ./lib
     */
    output?: string;
  };
  /**
   * esm options
   */
  esm?: {
    /**
     * default ./esm
     */
    output?: string;
  };
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
