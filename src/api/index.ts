// tslint:disable:max-line-length

import * as rback from 'razorback';
import Severity from '../base/severity';
import { CoreContext } from '../core/core';
import { URI } from '../base/uri';

import * as apiTypes from './types';
import { ExtHostBindings } from './protocol';
import { ExtHostCommands } from './command';
import { ExtHostMessageService } from './message';
import { ExtHostWorkspace } from './workspace';
import { IExtensionDescription } from '../extension/types';

export function createApiFactory(coreContext: CoreContext) {
  // Register extention host classes to core.
  // So it they will be available to main thread.
  // Now we can inject there classes to Services.
  const extHostCommands = coreContext.set(ExtHostBindings.ExtHostCommands, new ExtHostCommands(coreContext));
  const extHostMessageService = coreContext.set(ExtHostBindings.ExtHostMessageService, new ExtHostMessageService(coreContext));
  const extHostWorkspace = coreContext.set(ExtHostBindings.ExtHostWorkspace, new ExtHostWorkspace(coreContext));

  return function createApi(
    extension: IExtensionDescription,
    // TODO
    // extensionRegistry: ExtensionDescriptionRegistry,
    // configProvider: ExtHostConfigProvider
  ): typeof rback {

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

    const workspace: typeof rback.workspace = {
      get rootPath() {
        return extHostWorkspace.rootPath;
      },
      get workspaceFolders() {
        return extHostWorkspace.workspaceFolders;
      },
      get name() {
        return extHostWorkspace.name;
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
      workspace,
      Disposable: apiTypes.Disposable,

      Uri: URI,
    };
  };
}

export interface ICreateApi {
  (extension: IExtensionDescription): typeof rback;
}
