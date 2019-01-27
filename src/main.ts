/**
 * This module registers services that interacts directly with
 * neovim via 'NeoVim' node package.
 *
 * Any api related module is registered in api/index.
 */
import 'reflect-metadata';

import { CoreBindings } from './api/protocol';
import { createLogger } from './logger';
import { Core, ICoreOptions } from './core';
import { ExtensionsComponent } from './extension/component';
import { CoreCommandsComponent } from './command/component';

const logger = createLogger('razorback#main');

export async function main(options: ICoreOptions) {
  const core = new Core(options);
  await core.boot();

  await core.component(CoreBindings.CoreExtensionsComponent, ExtensionsComponent);

  await core.bind(CoreBindings.CoreCommandsComponent)
    .to(CoreCommandsComponent);

  await core.start();
  logger.info('core started');
}
