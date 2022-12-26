import path from 'path';

import { IConfig, PresetConfig } from '../types/config';
import { IPresetReturn } from '../types/service';

function idToPreset(preset: PresetConfig, cwd: string) {
  let presetId = preset as string;
  let options = null;

  if (Array.isArray(preset)) {
    [presetId, options] = preset;
  }

  // resolve local preset
  if (presetId.startsWith('.')) {
    presetId = path.resolve(cwd, presetId);
  }

  return {
    id: presetId,
    options: options || {},
    presetEntry: require(presetId),
  };
}

const resolvePresets = (config: IConfig, cwd: string) => {
  const { presets } = config;
  let plugins: PresetConfig[] = [];

  presets.map((preset) => idToPreset(preset, cwd)).forEach((preset) => {
    const { presetEntry, options } = preset;
    const presetModule = (presetEntry(options) as IPresetReturn);

    plugins = plugins.concat(presetModule.plugins);
  });

  return plugins;
};

export default resolvePresets;
