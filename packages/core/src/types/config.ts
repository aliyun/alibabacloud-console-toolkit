/**
 * plugins: [
 *   'xxx-plugin',
 *   ['yyy-plugin', {
 *     z: 'z'
 *   }]
 * ]
 */
export type PluginOptions = Record<string, any>;

export type PluginConfig = string | [string, PluginOptions];

/**
 * presets: [
 *   'xxx-preset',
 *   ['yyy-preset', {
 *     z: 'z'
 *   }]
 * ]
 */
export type PresetOptions = Record<string, any>;

export type PresetConfig = string | [string, PresetOptions];

/**
 * config/config.(j|t)s
 */
export interface IConfig {
  plugins: PluginConfig[];
  presets: PresetConfig[];
}
