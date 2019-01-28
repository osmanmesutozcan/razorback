/**
 * This module registers services that interacts directly with
 * neovim via 'NeoVim' node package.
 *
 * Any api related module is registered in api/index.
 */
import 'reflect-metadata';

import { createLogger } from './logger';
import { CoreBindings } from './api/protocol';
import { CoreSequence } from './core/sequence';
import { CoreContext, ICoreOptions } from './core';
import { ExtensionsComponent } from './extension/component';
import { CoreCommandsComponent } from './command/component';
import { CoreMessageComponent } from './message/component';
import { CoreWorkspaceComponent } from './workspace/component';

const logger = createLogger('razorback#main');

export async function main(options: ICoreOptions) {
  const coreContext = new CoreContext(options);
  await coreContext.boot();

  // -- service like
  coreContext.bind(CoreBindings.CoreCommandsComponent)
    .to(CoreCommandsComponent);
  coreContext.bind(CoreBindings.CoreMessageComponent)
    .to(CoreMessageComponent);

  // -- singletons
  await coreContext
    .component(CoreBindings.CoreWorkspaceComponent, CoreWorkspaceComponent);

  // NOTE: This is going to initialize services. We need to bring a system
  // that registers onActivation event listener to extensions.
  await coreContext
    .component(CoreBindings.CoreExtensionsComponent, ExtensionsComponent);

  coreContext.sequence(CoreSequence);
  await coreContext.start();
  logger.info('core started');
}
