// tslint:disable:max-line-length

import { ICommandHandlerDescription } from '../command/types';
import { IDisposable } from '../base/lifecycle';

// -- extension host

export const ExtHostBindings = {
  ExtHostCommands: Symbol.for('razorback.ext.hostcommands'),
  ExtHostMessageService: Symbol.for('razorback.ext.messageservice'),
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

// -- core

export const CoreBindings = {
  CoreExtensionsComponent: Symbol.for('razorback.core.extensions'),
  CoreCommandsComponent: Symbol.for('razorback.core.commands'),
};

export interface CoreCommandsShape extends IDisposable {
  $registerCommand(id: string): void;
  $unregisterCommand(id: string): void;
  $executeCommand<T>(id: string, args: any[]): Promise<T>;
  $getCommands(): Promise<string[]>;
}

