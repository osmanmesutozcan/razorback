import 'reflect-metadata';

import { createLogger } from './logger';
import { Core, ICoreOptions } from './core';
import { ExtensionComponent } from './extension/extension.component';
import { CommandsRegistryComponent } from './command/command.component';

const logger = createLogger('razorback#main');

export async function main(options: ICoreOptions) {
  const core = new Core(options);

  await core.boot();

  await core.set(ExtensionComponent);
  await core.set(CommandsRegistryComponent);

  await core.start();
  logger.info('core started');
}
