import { unwatch } from '../../utils/watch.js';
import { RESTART } from '../../const/index.js';
import type { IContext } from '../../types/service';

export default (context: IContext) => {
  context.registerSyncAPI('restart', () => {
    unwatch();
    if (process.send) {
      process.send({ type: RESTART });
    }
  });
};
