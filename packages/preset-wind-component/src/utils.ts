import { DEFAULT_JS_EXT, DEFAULT_TS_EXT } from './const';

export function resolveExts(useTypescript: boolean | undefined) {
  if (useTypescript) {
    return [...DEFAULT_JS_EXT, ...DEFAULT_TS_EXT];
  } else {
    return DEFAULT_JS_EXT;
  }
}
