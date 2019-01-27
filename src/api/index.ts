// tslint:disable:max-line-length

import * as rback from 'razorback';
import * as apiTypes from '../api/types';
import { Core } from '../core/core';
import { ExtHostBindings } from './protocol';
import { ExtHostCommands } from './command';

export function createApiFactory(core: Core) {

  return function createApi(
    // TODO
    // extension: IExtensionDescription,
    // extensionRegistry: ExtensionDescriptionRegistry,
    // configProvider: ExtHostConfigProvider
  ): typeof rback {
    // Register extention host classes to core.
    // So it they will be available to main thread.
    // Now we can inject there classes to Services.
    const extHostCommands = core.set(ExtHostBindings.ExtHostCommands, new ExtHostCommands(core));

    // commands namespace;
    const commands: typeof rback.commands = {
      registerCommand(id: string, command: (...args: any[]) => any, thisArg?: any): rback.Disposable {
        return extHostCommands.registerCommand(true, id, command, thisArg);
      },
      executeCommand<T>(id: string, ...rest: any[]): rback.Thenable<T | undefined> {
        return extHostCommands.executeCommand(id, rest);
      },
      getCommands(filterInternal = false) {
        return extHostCommands.getCommands(filterInternal);
      },
    };

    return {
      commands,
      Disposable: apiTypes.Disposable,
    };
  };
}
