import * as rback from 'razorback';
import { createLogger } from '../../logger';
import { toDisposable } from '../../base/lifecycle';

const logger = createLogger('razorback#provider#noopProvider');

export function noopProvider(name: string, ..._args: any[]): rback.Disposable {
  logger.warn(`Registering ${name} with noopProvider. `
    + 'We hope to implement this provider support in nearest future!');

  return toDisposable(() => { });
}
