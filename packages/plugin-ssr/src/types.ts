import { PluginOptions } from "@alicloud/console-toolkit-core";
import * as webpack from 'webpack';

export interface IOption extends PluginOptions {
  entry: string;
  webpack: (config: webpack.Configuration, ...args: any[]) => webpack.Configuration;
}