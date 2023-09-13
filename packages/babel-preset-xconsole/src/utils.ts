import { isUndefined, isString, isObject, isPlainObject } from 'lodash';

export const isProduction = (
  env?: string
): boolean => env === 'production';

export const isTest = (
  env?: string
): boolean => env === 'test';

export const isDevelopment = (
  env?: string
): boolean => (
  !isProduction(env) &&
  !isTest(env)
);

export const isPluginOrPresetTarget = (value: any) => (
  isString(value) ||
  isObject(value)
);

export const isPluginOrPresetDeclaration = (value: any) => {
  if (isPluginOrPresetTarget(value)) {
    return true;
  }

  if (Array.isArray(value)) {
    const [target, options] = value;
    return (
      isPluginOrPresetTarget(target) &&
      (
        isUndefined(options) ||
        isPlainObject(options)
      )
    );
  }

  return false;
};
