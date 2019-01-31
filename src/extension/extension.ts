import { createLogger } from '../logger';
import { createSandbox } from '../sandbox';

import {
  IExtension,
  IExtensionDescription,
} from './types';
import { ICreateApi } from '../api';

const logger = createLogger('razorback#extension#extension');

export class Extension {
  private extension: IExtension;

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
    createApi: ICreateApi,
    extension: IExtensionDescription,
  ) {
    const sandbox = createSandbox(createApi, extension);

    // Attempt to import default from extension.
    // FIXME: Check if default fallback to non-default!
    this.extension =
      sandbox.require(extension.extensionLocation.path);
      // || sandbox.require(extension.extensionLocation.path);
    logger.debug('extension imported successfully');

    // TODO: Generate context.
    this.activate({
      subscriptions: [],
    });
  }

  /**
   * Activate extension in sandbox context.
   */
  async activate(context: any): Promise<boolean> {
    this.isActive = true;
    return this.extension.activate.apply(global, [context]);
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
