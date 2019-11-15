import * as joi from '@hapi/joi';
import { validate as validateSchema } from '@alicloud/console-toolkit-shared-utils';
import { PluginConfig } from '../../types/PluginAPI';

const schema = joi.object().keys({
  plugins: joi.array()
});

export const validate = (config: PluginConfig, cb: (msg: string) => void) => {
  validateSchema(config, schema, cb);
};

export const defaultConfig = () => ({
  plugins: [],
  presets: []
});
