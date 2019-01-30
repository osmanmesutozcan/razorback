// tslint:disable:max-line-length

import * as rback from 'razorback';
import { URI } from '../base/uri';
import * as error from '../error';
import Severity from '../base/severity';
import { CoreContext } from '../core/core';
import { EventEmitter } from '../base/event';
import { IExtensionDescription } from '../extension/types';

import * as apiTypes from './types';
import { ExtHostBindings } from './protocol';
import { ExtHostCommands } from './command';
import { ExtHostMessageService } from './message';
import { ExtHostWorkspace } from './workspace';
import { ExtHostDocuments } from './documents';

export function createApiFactory(coreContext: CoreContext) {
  // Register extention host classes to core.
  // So it they will be available to main thread.
  // Now we can inject there classes to Services.
  const extHostCommands = coreContext.constant(ExtHostBindings.ExtHostCommands, new ExtHostCommands(coreContext));
  const extHostMessageService = coreContext.constant(ExtHostBindings.ExtHostMessageService, new ExtHostMessageService(coreContext));
  const extHostWorkspace = coreContext.constant(ExtHostBindings.ExtHostWorkspace, new ExtHostWorkspace(coreContext));
  const extHostDocuments = coreContext.constant(ExtHostBindings.ExtHostDocuments, new ExtHostDocuments(coreContext));

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
      set rootPath(_path: string | undefined) {
        error.readonly('rootPath');
      },
      get workspaceFolders() {
        return extHostWorkspace.workspaceFolders;
      },
      set workspaceFolders(_folders: rback.WorkspaceFolder[] | undefined) {
        error.readonly('workspaceFolders');
      },
      get name() {
        return extHostWorkspace.name;
      },
      set name(_name: string | undefined) {
        error.readonly('workspaceFolders');
      },
      onDidOpenTextDocument: (listener, thisArgs?, disposables?) => {
        return extHostDocuments.onDidOpenTextDocument(listener, thisArgs, disposables);
      },
      onDidCloseTextDocument: (listener, thisArgs?, disposables?) => {
        return extHostDocuments.onDidCloseTextDocument(listener, thisArgs, disposables);
      },
      onDidSaveTextDocument: (listener, thisArgs?, disposables?) => {
        return extHostDocuments.onDidSaveTextDocument(listener, thisArgs, disposables);
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

      EventEmitter,
      Disposable: apiTypes.Disposable,
      EndOfLine: apiTypes.EndOfLine,
      Position: apiTypes.Position,
      Range: apiTypes.Range,
      Selection: apiTypes.Selection,
      Uri: URI,
    };
  };
}

export interface ICreateApi {
  (extension: IExtensionDescription): typeof rback;
}
