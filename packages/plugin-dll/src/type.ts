import { PluginOptions } from "@alicloud/console-toolkit-core";

export interface IOption extends PluginOptions {
  dllOutputDir: string;
  dllName: string;
  disableTimestamp: boolean;
  dllLib: string[];
  scriptAttr: {
    [key: string]: string;
  };
}