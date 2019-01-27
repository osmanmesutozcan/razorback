import *  as _ from 'lodash';
import { Position } from 'vscode-languageserver-protocol';

import { createLogger } from '../logger';
import { Command, Thenable } from '../types';
import { ICommandHandlerDescription } from '../command/types';
import { revive } from '../base/marshalling';
import { Core } from '../core/core';

import * as apiTypes from './types';
import { ExtHostCommandsShape, ObjectIdentifier } from './protocol';
import { validateConstraint } from '../base/types';
import { CommandsRegistryComponent } from '../command';
import { ExtHostHeapService } from './heap';

interface CommandHandler {
  callback: Function;
  thisArg: any;
  description?: ICommandHandlerDescription;
}

export interface ArgumentProcessor {
  processArgument(arg: any): any;
}

export class ExtHostCommands implements ExtHostCommandsShape {
  private readonly _proxy: CommandsRegistryComponent;

  private readonly _logger = createLogger('razorback#api#command');

  private readonly _commands = new Map<string, CommandHandler>();

  private readonly _converter: CommandsConverter;

  private readonly _argumentProcessors: ArgumentProcessor[];

  constructor(
    core: Core,
    heapService: ExtHostHeapService,
  ) {
    this._proxy = core.getProxy(CommandsRegistryComponent);
    this._converter = new CommandsConverter(this, heapService);
    this._argumentProcessors = [{ processArgument(a: any) { return revive(a, 0); } }];
  }

  get converter(): CommandsConverter {
    return this._converter;
  }

  registerArgumentProcessor(processor: ArgumentProcessor): void {
    this._argumentProcessors.push(processor);
  }

  registerCommand(
    global: boolean,
    id: string,
    callback: <T>(...args: any[]) => T | Thenable<T>,
    thisArg?: any,
    description?: ICommandHandlerDescription,
  ): apiTypes.Disposable {
    this._logger.trace('ExtHostCommands#registerCommand', id);

    if (!id.trim().length) {
      throw new Error('invalid id');
    }

    if (this._commands.has(id)) {
      throw new Error(`command '${id}' already exists`);
    }

    this._commands.set(id, { callback, thisArg, description });
    if (global) {
      this._proxy
        .$registerCommand(id);
    }

    return new apiTypes.Disposable(() => {
      if (this._commands.delete(id)) {
        if (global) {
          this._proxy
            .$unregisterCommand(id);
        }
      }
    });
  }

  async executeCommand<T>(id: string, ..._args: any[]): Promise<T> {
    this._logger.trace('ExtHostCommands#executeCommand', id);

    if (this._commands.has(id)) {
      // we stay inside the extension host and support
      // to pass any kind of parameters around
      return this.executeContributedCommand<T>(id, _args);

    }

    // automagically convert some argument types
    const args = _.cloneWith(_args, (value: any) => {
      if (!Array.isArray(value)) {
        return value;
      }
    });

    const result = this._proxy
      .$executeCommand<T>(id, args);

    return revive(result, 0);
  }

  private executeContributedCommand<T>(id: string, args: any[]): Promise<T> {
    const { callback, thisArg, description } = this._commands.get(id)!;

    if (description) {
      description.args.forEach((arg: any) => {
        try {
          validateConstraint(arg, arg.constraint);

        } catch (err) {
          return Promise.reject(
            new Error(`Running the contributed command:'${id}' failed.`
              + `Illegal argument '${arg.name}' - ${arg.description}`,
            ),
          );
        }
      });
    }

    try {
      const result = callback.apply(thisArg, args);
      return Promise.resolve(result);
    } catch (err) {
      this._logger.error(err, id);
      return Promise.reject(
        new Error(`Running the contributed command:'${id}' failed.`),
      );
    }
  }

  $executeContributedCommand<T>(id: string, ..._args: any[]): Promise<T> {
    this._logger.trace('ExtHostCommands#$executeContributedCommand', id);

    if (!this._commands.has(id)) {
      return Promise.reject(new Error(`Contributed command '${id}' does not exist.`));
    }

    const args = _args.map((arg: any) => this._argumentProcessors
      .reduce((r, p) => p.processArgument(r), arg));

    return this.executeContributedCommand(id, args);
  }

  async getCommands(filterUnderscoreCommands: boolean = false): Promise<string[]> {
    this._logger.trace('ExtHostCommands#getCommands', filterUnderscoreCommands);

    const commands = this._proxy
      .$getCommands();
    return commands.filter((command: string[]) =>
      (filterUnderscoreCommands && command[0] !== '_'));
  }

  $getContributedCommandHandlerDescriptions(
  ): Promise<{ [id: string]: string | ICommandHandlerDescription }> {
    const result: { [id: string]: string | ICommandHandlerDescription } = Object.create(null);
    this._commands.forEach((command, id) => {
      const { description } = command;
      if (description) {
        result[id] = description;
      }
    });
    return Promise.resolve(result);
  }
}


export class CommandsConverter {

  private readonly _delegatingCommandId: string;
  private _commands: ExtHostCommands;
  private _heap: ExtHostHeapService;

  // --- conversion between internal and api commands
  constructor(commands: ExtHostCommands, heap: ExtHostHeapService) {
    this._delegatingCommandId = `_internal_command_delegation_${Date.now()}`;
    this._commands = commands;
    this._heap = heap;
    this._commands.registerCommand(
      true,
      this._delegatingCommandId,
      this.executeConvertedCommand,
      this,
    );
  }

  toInternal(command: Command): modes.Command {

    if (!command) {
      return undefined;
    }

    const result: modes.Command = {
      id: command.command,
      title: command.title,
    };

    if (command.command && _.isEmpty(command.arguments)) {
      // we have a contributed command with arguments. that
      // means we don't want to send the arguments around

      const id = this._heap.keep(command);
      ObjectIdentifier.mixin(result, id);

      result.id = this._delegatingCommandId;
      result.arguments = [id];
    }

    if (command.tooltip) {
      result.tooltip = command.tooltip;
    }

    return result;
  }

  fromInternal(command: modes.Command): Command {

    if (!command) {
      return undefined;
    }

    const id = ObjectIdentifier.of(command);
    if (typeof id === 'number') {
      return this._heap.get<Command>(id);
    }

    return {
      command: command.id,
      title: command.title,
      arguments: command.arguments,
    };
  }

  private executeConvertedCommand<R>(...args: any[]): Promise<R> {
    const actualCmd = this._heap.get<Command>(args[0]);
    return this._commands.executeCommand(actualCmd.command, ...actualCmd.arguments);
  }
}
