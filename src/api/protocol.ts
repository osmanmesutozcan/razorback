// tslint:disable:max-line-length

import { ICommandHandlerDescription } from '../core/commands/types';
import { UriComponents } from '../base/uri';
import { IDisposable } from '../base/lifecycle';

export enum TextEditorCursorStyle {
  Line = 1,
  Block = 2,
  Underline = 3,
  LineThin = 4,
  BlockOutline = 5,
  UnderlineThin = 6,
}

export enum TextEditorLineNumbersStyle {
  Off = 0,
  On = 1,
  Relative = 2,
}

export interface IModelAddedData {
  uri: UriComponents;
  versionId: number;
  lines: string[];
  EOL: string;
  modeId: string;
  isDirty: boolean;
}

export interface IDocumentsAndEditorsDelta {
  removedDocuments?: UriComponents[];
  addedDocuments?: IModelAddedData[];
  removedEditors?: string[];
  addedEditors?: ITextEditorAddData[];
  newActiveEditor?: string;
}

export interface ITextEditorAddData {
  id: string;
  documentUri: UriComponents;
  options: IResolvedTextEditorConfiguration;
  // selections: ISelection[];
  // visibleRanges: IRange[];
  // editorPosition: EditorViewColumn;
}

export interface IResolvedTextEditorConfiguration {
  tabSize: number;
  insertSpaces: boolean;
  cursorStyle: TextEditorCursorStyle;
  lineNumbers: TextEditorLineNumbersStyle;
}

// -- extension host

export const ExtHostBindings = {
  ExtHostCommands: Symbol.for('razorback.ext.hostcommands'),
  ExtHostWorkspace: Symbol.for('razorback.ext.workspace'),
  ExtHostDocuments: Symbol.for('razorback.ext.documents'),
  ExtHostLanguages: Symbol.for('razorback.ext.languages'),
  ExtHostMessageService: Symbol.for('razorback.ext.messageservice'),
  ExtHostConfiguration: Symbol.for('razorback.ext.configuration'),
  ExtHostExtensions: Symbol.for('razorback.ext.extensions'),
  ExtHostFileSystemEvents: Symbol.for('razorback.ext.fsevents'),
};

export interface ExtHostCommandsShape {
  $executeContributedCommand<T>(id: string, ...args: any[]): Promise<T>;
  $getContributedCommandHandlerDescriptions(): Promise<{ [id: string]: string | ICommandHandlerDescription }>;
}

export interface ObjectIdentifier {
  $ident: number;
}

export namespace ObjectIdentifier {
  export const name = '$ident';
  export function mixin<T>(obj: T, id: number): T & ObjectIdentifier {
    Object.defineProperty(obj, name, { value: id, enumerable: true });
    return <T & ObjectIdentifier>obj;
  }
  export function of(obj: any): number {
    return obj[name];
  }
}

// -- core context

export const CoreBindings = {
  CoreMessageComponent: Symbol.for('razorback.core.message'),
  CoreCommandsComponent: Symbol.for('razorback.core.commands'),
  CoreWorkspaceComponent: Symbol.for('razorback.core.workspace'),
  CoreDocumentsComponent: Symbol.for('razorback.core.documents'),
  CoreLanguagesComponent: Symbol.for('razorback.core.languages'),
  CoreExtensionsComponent: Symbol.for('razorback.core.extensions'),
  CoreFileSystemWatcherComponent: Symbol.for('razorback.core.fsevents'),
  CoreConfigurationComponent: Symbol.for('razorback.core.configuration'),
  CoreExtensionDescriptionRegistry: Symbol.for('razorback.core.extensionregistry'),
};

export interface CoreCommandsShape extends IDisposable {
  $registerCommand(id: string): void;
  $unregisterCommand(id: string): void;
  $executeCommand<T>(id: string, args: any[]): Promise<T>;
  $getCommands(): Promise<string[]>;
}
