import type { BreezrPresetConfig as PresetOfficialConfig } from "@alicloud/console-toolkit-preset-official";

export function getModifyPresetConfig(
  presetOfficialConfigPath: string | undefined,
  info: { type: "main" | "deps" | "host"; isDev: boolean }
): (c: PresetOfficialConfig) => PresetOfficialConfig {
  if (typeof presetOfficialConfigPath !== "string") return (v) => v;
  const configFn = require(presetOfficialConfigPath);
  return (v) => {
    return configFn?.(v, info) || v;
  };
}
