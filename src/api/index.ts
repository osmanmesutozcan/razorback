// tslint:disable:max-line-length

import * as rback from 'razorback';
import * as error from '../error';
import * as languagesTypes from '../core/languages/types';
import { IExtensionDescription } from '../core/extension/types';
import { noopProvider } from '../core/provider/noop';
import { CoreContext } from '../core/core';
import { URI } from '../base/uri';
import Severity from '../base/severity';
import { Disposable } from '../base/lifecycle';
import { EventEmitter } from '../base/event';
import { CancellationTokenSource } from '../base/cancellation';

import * as apiTypes from './types';
import { ExtHostBindings } from './protocol';
import { ExtHostCommands } from './command';
import { ExtHostMessageService } from './message';
import { ExtHostWorkspace } from './workspace';
import { ExtHostDocuments } from './documents';
import { ExtHostLanguages } from './languages';
import { ExtHostConfiguration } from './configuration';
import { ExtHostExtensions } from './extensions';
import { ExtHostFileSystemEvents } from './fsevents';

export function createApiFactory(coreContext: CoreContext) {
  // Register extention host classes to core.
  // So it they will be available to main thread.
  // Now we can inject there classes to Services.
  const extHostCommands = coreContext.constant(ExtHostBindings.ExtHostCommands, new ExtHostCommands(coreContext));
  const extHostMessageService = coreContext.constant(ExtHostBindings.ExtHostMessageService, new ExtHostMessageService(coreContext));
  const extHostWorkspace = coreContext.constant(ExtHostBindings.ExtHostWorkspace, new ExtHostWorkspace(coreContext));
  const extHostDocuments = coreContext.constant(ExtHostBindings.ExtHostDocuments, new ExtHostDocuments(coreContext));
  const extHostLanguages = coreContext.constant(ExtHostBindings.ExtHostLanguages, new ExtHostLanguages(coreContext));
  const extHostConfiguration = coreContext.constant(ExtHostBindings.ExtHostConfiguration, new ExtHostConfiguration());
  const extHostExtensions = coreContext.constant(ExtHostBindings.ExtHostExtensions, new ExtHostExtensions());
  const extHostFileSystemEvents = coreContext.constant(ExtHostBindings.ExtHostFileSystemEvents, new ExtHostFileSystemEvents(coreContext));

  // TODO: Make sure each extension gets its own implementation.

  return function createApi(
    extension: IExtensionDescription,
    // TODO:
    // extensionRegistry: ExtensionDescriptionRegistry,
    // configProvider: ExtHostConfigProvider
  ): typeof rback {

    // languages namespace;
    const languages: typeof rback.languages = {
      getLanguages(): rback.Thenable<string[]> {
        return extHostLanguages.getLanguages();
      },
      setTextDocumentLanguage(document, languageId) {
        return extHostLanguages.changeLanguage(document, languageId);
      },
      setLanguageConfiguration: (language: string, configuration: rback.LanguageConfiguration): rback.Disposable => {
        return extHostLanguages.setLanguageConfiguration(language, configuration);
      },
      registerDocumentLinkProvider(selector, provider) {
        return noopProvider('languages.registerDocumentLinkProvider', selector, provider);
      },
    };

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

    // extension namespace
    const extensions: typeof rback.extensions = {
      getExtension(extensionId: string) {
        return extHostExtensions.getExtension(extensionId);
      },
      get all() {
        return extHostExtensions.all;
      },
    };

    // workspace namespace;
    const workspace: typeof rback.workspace = {
      get name() {
        return extHostWorkspace.name;
      },
      set name(_name: string | undefined) {
        error.readonly('workspaceFolders');
      },
      get textDocuments() {
        return extHostDocuments.getAllDocuments();
      },
      set textDocuments(_documents: rback.TextDocument[]) {
        error.readonly('textDocuments');
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
      onDidChangeWorkspaceFolders: (listeners, thisArgs?, disposables?) => {
        return extHostWorkspace.onDidChangeWorkspaceFolders(listeners, thisArgs, disposables);
      },
      createFileSystemWatcher(globPattern, ignoreCreateEvents, ignoreChangeEvents, ignoreDeleteEvents) {
        return extHostFileSystemEvents.createFileSystemWatcher(globPattern, ignoreCreateEvents, ignoreChangeEvents, ignoreDeleteEvents);
      },
      // NOOP --
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
      getConfiguration(section?: string, resource?: rback.Uri | null): rback.WorkspaceConfiguration {
        const _resource = (arguments.length === 1 && resource !== null) ? undefined : resource;
        return extHostConfiguration.getConfiguration(section, _resource!, extension.identifier);
      },
      onDidChangeConfiguration: (listener, thisArgs?, disposables?) => {
        return extHostConfiguration.onDidChangeConfiguration(listener, thisArgs, disposables);
      },
      registerTaskProvider: (type, provider) => {
        return noopProvider('workspace.registerTaskProvider', type, provider);
      },
    };

    // window namespace;
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
      languages,
      workspace,
      extensions,

      CancellationTokenSource,
      Disposable,
      EventEmitter,
      ConfigurationTarget: apiTypes.ConfigurationTarget,
      CodeLens: apiTypes.CodeLens,
      EndOfLine: apiTypes.EndOfLine,
      IndentAction: languagesTypes.IndentAction,
      Position: apiTypes.Position,
      RelativePattern: apiTypes.RelativePattern,
      Range: apiTypes.Range,
      Selection: apiTypes.Selection,
      Uri: URI,
    };
  };
}

export interface ICreateApi {
  (extension: IExtensionDescription): typeof rback;
}
