import * as rback from 'razorback';
import { Disposable } from '../api/types';
import { createLogger } from '../logger';

const logger = createLogger('razorback#provider#noopProvider');

export function noopProvider(name: string, ..._args: any[]): rback.Disposable {
  logger.warn(`Registering ${name} with noopProvider. `
    + 'We hope to implement this provider support in nearest future!');

  return new Disposable(() => {});
}
