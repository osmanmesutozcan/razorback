import * as vm from 'vm';
import { injectable } from 'inversify';

import { createLogger } from '../logger';
import {
  IExtension,
  IExtensionContext,
  IExtensionDefinition,
} from './types';

// tslint:disable-next-line:variable-name
const Module = require('module');
const logger = createLogger('razorback#extension#sandbox');

@injectable()
export class ExtensionSandbox {
  private extension: IExtension;

  constructor(extension: IExtensionDefinition) {
    logger.debug(`requiring main from '${extension.main}'`);

    const sandbox = vm.createContext();
    const wrapper = Module.wrap(extension.main);
    this.extension = vm.runInContext(wrapper, sandbox);
  }

  /**
   * Activate extension in sandbox context.
   */
  async activate(context: IExtensionContext): Promise<boolean> {
    return this.extension.activate(context);
  }

  /**
   * Deactivate extension in sandbox context.
   */
  async deactivate(): Promise<boolean> {
    return this.extension.deactivate();
  }
}
