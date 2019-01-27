/**
 * This module registers services that interacts directly with
 * neovim via 'NeoVim' node package.
 *
 * Any api related module is registered in api/index.
 */
import 'reflect-metadata';

import { CoreBindings } from './api/protocol';
import { createLogger } from './logger';
import { CoreContext, ICoreOptions } from './core';
import { ExtensionsComponent } from './extension/component';
import { CoreCommandsComponent } from './command/component';
import { CoreSequence } from './core/sequence';

const logger = createLogger('razorback#main');

export async function main(options: ICoreOptions) {
  const coreContext = new CoreContext(options);
  await coreContext.boot();

  // - service like
  await coreContext.bind(CoreBindings.CoreCommandsComponent)
    .to(CoreCommandsComponent);

  // - singletons
  await coreContext.component(CoreBindings.CoreExtensionsComponent, ExtensionsComponent);

  coreContext.sequence(CoreSequence);
  await coreContext.start();
  logger.info('core started');
}
