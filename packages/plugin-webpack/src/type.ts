import * as webpack from 'webpack';

export interface PluginAPIOpt {
  directory: string; // project directory
  filename: string; // config filename of webpack
  config: webpack.Configuration; // webpack config passed by user
  watch: boolean; // is watch
  webpack: Function;
  onSuccess: Function;
  onFail: Function;
  onServerRunning: Function;
  devServerOpt: { string: any };
}
