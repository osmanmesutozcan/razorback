import * as path from 'path';
import { inject, injectable } from 'inversify';
import { createLogger } from '../logger';
import { ExtensionSandbox } from '../sandbox';
import { IComponent, CoreBindings, Core } from '../core';

import { ExtensionDatabase } from './database';
import {
  IExtensionModel,
  IExtension,
  ExtensionInternalBindings,
} from './types';

const logger = createLogger('razorback#extension#component');

@injectable()
export class ExtensionComponent implements IComponent {
  constructor(
    @inject(CoreBindings.CORE_INSTANCE) private core: Core,
  ) { }

  classes = {
    [ExtensionInternalBindings.DATABASE]: ExtensionDatabase,
  };

  /**
   * List of loaded extensions.
   */
  private extensionsList: {[id: string]: IExtension} = {};

  /**
   * Init sequence of extensions.
   * Called from core during component registration.
   */
  async boot(): Promise<void> {
    logger.debug('booting component');
    await this.initExtensions();
  }

  private async initExtensions(): Promise<void> {
    const database = this.core
      .get<ExtensionDatabase>(ExtensionInternalBindings.DATABASE);

    const extensions = database.list();
    await Promise.all(
      extensions.map(ext => this.loadExtension(ext)),
    );
  }

  private async loadExtension(extension: IExtensionModel): Promise<void> {
    const database = this.core
      .get<ExtensionDatabase>(ExtensionInternalBindings.DATABASE);
    const packageJSON = await database.getPackageJSON(extension);

    const id = packageJSON.name;
    const main = path.resolve(
      extension.root,
      packageJSON.main || 'index.js',
    );

    this.extensionsList[id] = new ExtensionSandbox({
      ...extension,
      id,
      main,
      isActivated: false,
    });
  }
}
