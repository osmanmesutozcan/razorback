import { createLogger } from '../logger';
import { toDisposable } from '../base/lifecycle';

const logger = createLogger('razorback#api#noop');

export function noop(name: string, options: {disposable?: boolean, description?: string} = {}) {
  logger.warn(
    // tslint:disable-next-line:prefer-template
    `${name} is not yet implemented.` +
    (options.description  ? `\n\t description: ${options.description}` : ''),
  );

  if (options.disposable) {
    return toDisposable(() => logger.warn(`running noop disposable: ${name}`));
  }
}
