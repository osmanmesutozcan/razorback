import { createLogger } from '../logger';
import { createSandbox } from '../sandbox';

import {
  IExtension,
  IExtensionContext,
  IExtensionDefinition,
} from './types';

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

  constructor(extension: IExtensionDefinition) {
    const sandbox = createSandbox(extension);

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
