import { unwatch } from '../../utils/watch';
import { RESTART } from '../../const';
import { IContext } from '../../types/service';

export default (context: IContext) => {
  context.registerSyncAPI('restart', () => {
    unwatch();
    if (process.send) {
      process.send({ type: RESTART });
    }
  });
};
