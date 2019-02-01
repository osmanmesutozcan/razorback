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
import { ExtensionsComponent } from './core/extension/component';
import { CoreCommandsComponent } from './core/commands/component';
import { CoreDocumentsComponent } from './core/documents/component';
import { CoreFileSystemWatcherComponent } from './core/fswatcher/component';
import { CoreMessageComponent } from './core/message/component';
import { CoreWorkspaceComponent } from './core/workspace/component';
import { CoreLanguagesComponent } from './core/languages/component';

const logger = createLogger('razorback#main');

export async function main(options: ICoreOptions) {
  const coreContext = new CoreContext(options);
  await coreContext.boot();

  // -- service like components
  coreContext.service(CoreBindings.CoreCommandsComponent, CoreCommandsComponent);
  coreContext.service(CoreBindings.CoreMessageComponent, CoreMessageComponent);

  // -- singletons
  await coreContext
    .component(CoreBindings.CoreWorkspaceComponent, CoreWorkspaceComponent);
  await coreContext
    .component(CoreBindings.CoreDocumentsComponent, CoreDocumentsComponent);
  await coreContext
    .component(CoreBindings.CoreLanguagesComponent, CoreLanguagesComponent);
  await coreContext
    .component(CoreBindings.CoreFileSystemWatcherComponent, CoreFileSystemWatcherComponent);

  // NOTE: This is going to initialize services. We need to bring a system
  // that registers onActivation event listener to extensions.
  await coreContext
    .component(CoreBindings.CoreExtensionsComponent, ExtensionsComponent);

  coreContext.sequence(CoreSequence);
  await coreContext.start();
  logger.info('core started');
}
