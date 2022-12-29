import type Server from 'webpack-dev-server';

export interface IConfig {
  mode: 'none' | 'development' | 'production';

  externals?: Record<string, string | string[]>;

  entry?: string;

  alias?: Record<string, string>;

  swc?: boolean;

  devServer?: Server.Configuration;

  analyzer?: boolean;

  useTypeScript?: boolean;
}
