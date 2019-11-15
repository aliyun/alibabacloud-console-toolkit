import { existsSync } from 'fs';
import { resolve, isAbsolute } from 'path';
import { ThemeDef } from '../../../types';

interface IOptions {
  cwd: string;
}

export default function(theme: string | ThemeDef, opts: Partial<IOptions> = {}) {
  const { cwd = process.cwd() } = opts;
  if (!theme) {
    return {};
  }

  if (typeof theme === 'string') {
    const themePath = isAbsolute(theme) ? theme : resolve(cwd, theme);
    if (existsSync(themePath)) {
      try {
        const themeConfig = require(themePath); // eslint-disable-line
        if (typeof themeConfig === 'function') {
          return themeConfig();
        } else {
          return themeConfig;
        }
      } catch (e) {
        return {};
      }
    } else {
      throw new Error(`theme file don't exists`);
    }
  }
  return theme;
}
