import * as rback from 'razorback';
import { createLogger } from '../logger';
import { createSandbox } from '../sandbox';

import {
  IExtension,
  IExtensionContext,
  IExtensionDefinition,
} from './types';
import { Core } from '../core/core';
import { createApiFactory } from '../api';

const logger = createLogger('razorback#extension#extension');

export class Extension {
  private extension: IExtension;

  private createApi: () => typeof rback;

  /*
   * Is extension active.
   * Flags if application is activated at the moment.
   */
  private isActive: boolean = false;
  get active(): boolean {
    return this.isActive;
  }

  /*
   * Is extension enabled.
   * Flags if application is enabled for a
   * workspace.
   */
  private isEnabled: boolean = false;
  get enabled(): boolean {
    return this.isEnabled;
  }

  constructor(
    core: Core,
    extension: IExtensionDefinition,
  ) {
    this.createApi = createApiFactory(core);
    const sandbox = createSandbox(this.createApi, extension);

    // Attempt to import default from extension.
    this.extension = sandbox.require(extension.main).default;
    logger.debug('extension imported successfully');
  }

  /**
   * Activate extension in sandbox context.
   */
  async activate(context: IExtensionContext): Promise<boolean> {
    this.isActive = true;
    return this.extension.activate(context);
  }

  /**
   * Deactivate extension in sandbox context.
   */
  async deactivate(): Promise<boolean> {
    this.isActive = false;
    return this.extension.deactivate();
  }

  /**
   * Enable extension.
   */
  async enable(): Promise<void> {
    // TODO:
  }

  /**
   * Disable extension until enable.
   */
  async disable(): Promise<void> {
    // TODO:
  }
}
