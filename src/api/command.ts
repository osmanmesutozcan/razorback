import *  as _ from 'lodash';
import { Thenable } from 'razorback';

import { createLogger } from '../logger';
import { ICommandHandlerDescription } from '../commands/types';
import { revive } from '../base/marshalling';
import { CoreContext } from '../core/core';

import * as apiTypes from './types';
import { ExtHostCommandsShape, CoreBindings } from './protocol';
import { validateConstraint } from '../base/types';
import { CoreCommandsComponent } from '../commands/component';

interface CommandHandler {
  callback: Function;
  thisArg: any;
  description?: ICommandHandlerDescription;
}

export interface ArgumentProcessor {
  processArgument(arg: any): any;
}

/**
 * Implement External host APIs.
 * This is a registery for host only commands (non-global).
 *
 * For extension api documantation check `razorback.d.ts.`
 */
export class ExtHostCommands implements ExtHostCommandsShape {
  private readonly _proxy: CoreCommandsComponent;

  private readonly _logger = createLogger('razorback#api#command');

  private readonly _commands = new Map<string, CommandHandler>();

  private readonly _argumentProcessors: ArgumentProcessor[];

  constructor(core: CoreContext) {
    this._proxy = core.get(CoreBindings.CoreCommandsComponent);
    this._argumentProcessors = [{ processArgument(a: any) { return revive(a, 0); } }];
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
      this._proxy.$registerCommand(id);
    }

    return new apiTypes.Disposable(() => {
      if (this._commands.delete(id)) {
        if (global) {
          this._proxy.$unregisterCommand(id);
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

    const result = this._proxy.$executeCommand<T>(id, args);

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

  async $executeContributedCommand<T>(id: string, ..._args: any[]): Promise<T> {
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
    const commands = await this._proxy.$getCommands();
    return commands.filter((command: string) =>
      (!(filterUnderscoreCommands && command[0] === '_')));
  }

  async $getContributedCommandHandlerDescriptions(
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
