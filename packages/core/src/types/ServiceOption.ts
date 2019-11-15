import { PluginConfig } from "./PluginAPI";

export interface ServiceOption {
  /**
   * 当前项目的工作路径
   */
  cwd: string;
  config?: PluginConfig;
  plugins?: any[];
}