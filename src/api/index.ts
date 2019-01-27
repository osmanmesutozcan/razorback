// tslint:disable:max-line-length

import * as rback from 'razorback';
import * as apiTypes from '../api/types';
import { CoreContext } from '../core/core';
import { ExtHostBindings } from './protocol';
import { ExtHostCommands } from './command';
import Severity from '../base/severity';
import { ExtHostMessageService } from '../message/service';
import { IExtensionDescription } from '../extension/types';

export function createApiFactory(coreContext: CoreContext) {

  return function createApi(
    extension: IExtensionDescription,
    // TODO
    // extensionRegistry: ExtensionDescriptionRegistry,
    // configProvider: ExtHostConfigProvider
  ): typeof rback {
    // Register extention host classes to core.
    // So it they will be available to main thread.
    // Now we can inject there classes to Services.
    const extHostCommands = coreContext.set(ExtHostBindings.ExtHostCommands, new ExtHostCommands(coreContext));
    const extHostMessageService = coreContext.set(ExtHostBindings.ExtHostMessageService, new ExtHostMessageService(coreContext));

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

    const window: typeof rback.window = {
      showInformationMessage(message: string, first: any, ...rest: any[]) {
        return extHostMessageService.showMessage(extension, Severity.Info, message, first, rest);
      },
      showWarningMessage(message: string, first: any, ...rest: any[]) {
        return extHostMessageService.showMessage(extension, Severity.Warning, message, first, rest);
      },
      showErrorMessage(message: string, first: any, ...rest: any[]) {
        return extHostMessageService.showMessage(extension, Severity.Error, message, first, rest);
      },
    };

    return {
      window,
      commands,
      Disposable: apiTypes.Disposable,
    };
  };
}

export interface ICreateApi {
  (extension: IExtensionDescription): typeof rback;
}
