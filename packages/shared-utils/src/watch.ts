import * as chokidar from 'chokidar';
import { WatchMap } from './type';

const watchers: WatchMap = {};

export function watch(key: string, files: string) {
  if (!watchers[key]) {
    watchers[key] = [];
  }
  const watcher = chokidar.watch(files, {
    ignoreInitial: true,
  });
  watchers[key].push(watcher);
  return watcher;
}

export function unwatch(key?: string) {
  if (!key) {
    return Object.keys(watchers).forEach(unwatch);
  }
  if (watchers[key]) {
    watchers[key].forEach(watcher => {
      watcher.close();
    });
    delete watchers[key];
  }
}
