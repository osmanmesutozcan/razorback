import 'reflect-metadata';

import { createLogger } from './logger';
import { Core, ICoreOptions } from './core';
import { ExtensionComponent } from './extension';

const logger = createLogger('razorback#main');

export async function main(options: ICoreOptions) {
  const core = new Core(options);

  await core.boot();

  await core.component(ExtensionComponent);

  await core.start();
  logger.info('core started');
}
