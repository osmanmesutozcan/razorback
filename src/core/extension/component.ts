import * as path from 'path';
import { inject } from 'inversify';
import { createLogger } from '../../logger';
import { IComponent, CoreBindings, CoreContext } from '../';

import { Extension } from './extension';
import { ExtensionDatabase } from './database';
import {
  IExtensionModel,
  IExtension,
  ExtensionInternalBindings,
  IExtensionDescription,
} from './types';
import { URI } from '../../base/uri';
import { ICreateApi, createApiFactory } from '../../api';

const logger = createLogger('razorback#extension#component');

export class ExtensionsComponent implements IComponent {
  constructor(
    @inject(CoreBindings.CORE_INSTANCE) private core: CoreContext,
  ) { }

  classes = {
    [ExtensionInternalBindings.DATABASE]: ExtensionDatabase,
  };

  /**
   * List of loaded extensions.
   */
  private extensions = new Map<string, IExtension>();

  /*
   * Create api function that returns api surface.
   */
  private readonly createApi: ICreateApi = createApiFactory(this.core);

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

    this.extensions.set(id, new Extension(
      this.createApi,
      await this._loadExtensionDescription(extension, packageJSON),
    ));
  }

  /**
   * Get razorback or vscode engine version from package.json
   */
  private _getEngineVersion(packageJSON: any): string {
    const error = new Error('Missing engine info');

    const { engines } = packageJSON;
    if (typeof engines === 'undefined') {
      throw error;
    }

    const { vscode, razorback } = engines;
    if (typeof vscode === 'undefined' && typeof razorback === 'undefined') {
      throw error;
    }

    return vscode || razorback;
  }

  private async _loadExtensionDescription(
    extension: IExtensionModel,
    packageJSON: any,
  ): Promise<IExtensionDescription> {
    const main = path.resolve(
      extension.root,
      packageJSON.main || 'index.js',
    );

    return {
      name: <string>packageJSON.name,
      version: <string>packageJSON.version,
      publisher: 'Community',
      engines: { vscode: this._getEngineVersion(packageJSON) },
      identifier: packageJSON.name,
      isBuiltin: false,
      isUnderDevelopment: false,
      extensionLocation: URI.file(main),
    };
  }
}
