import * as _ from "lodash";
import { Container } from "inversify";
import { Event, Emitter } from "vscode-languageserver-protocol";

import { LinkedList } from "../../base/linkedList";
import { IDisposable, toDisposable } from "../../base/lifecycle";
import { TypeConstraint, validateConstraints } from "../../base/types";
import { createDecorator } from "../instantiation";
import { IComponent } from "../component";
import { ICommandHandlerDescription } from "./types";

export interface ICommandHandler {
  (accessor: Container, ...args: any[]): void;
}

export interface ICommand {
  id: string;
  handler: ICommandHandler;
  description?: ICommandHandlerDescription | null;
}

export interface ICommandsMap {
  [id: string]: ICommand;
}

export interface ICommandsRegistry {
  onDidRegisterCommand: Event<string>;
  registerCommand(command: ICommand): IDisposable;
  registerCommand(id: string, command: ICommandHandler): IDisposable;
  registerCommandAlias(oldId: string, newId: string): IDisposable;
  getCommand(id: string): ICommand | undefined;
  getCommands(): ICommandsMap;
}

export interface ICommandEvent {
  commandId: string;
}

export interface ICommandService {
  _serviceBrand: any;

  onWillExecuteCommand: Event<ICommandEvent>;

  executeCommand<T = any>(
    commandId: string,
    ...args: any[]
  ): Promise<T | undefined>;
}

export const ICommandService = createDecorator<ICommandService>(
  "commandService"
);

class CommandsRegistryImpl implements IComponent, ICommandsRegistry {
  private readonly _commands = new Map<string, LinkedList<ICommand>>();

  private readonly _onDidRegisterCommand = new Emitter<string>();
  readonly onDidRegisterCommand: Event<string> = this._onDidRegisterCommand
    .event;

  registerCommand(
    idOrCommand: string | ICommand,
    handler?: ICommandHandler
  ): IDisposable {
    if (!idOrCommand) {
      throw new Error("invalid command");
    }

    if (_.isString(idOrCommand)) {
      if (!handler) {
        throw new Error("invalid command");
      }
      return this.registerCommand({ handler, id: idOrCommand });
    }

    if (idOrCommand.description) {
      const constraints: (TypeConstraint | undefined)[] = [];
      idOrCommand.description.args.forEach((arg: any) => {
        constraints.push(arg.constraint);
      });

      const actualHandler = idOrCommand.handler;
      idOrCommand.handler = function(accessor, ...args: any[]) {
        validateConstraints(args, constraints);
        return actualHandler(accessor, ...args);
      };
    }

    // find a place to store the command
    const { id } = idOrCommand;

    let commands = this._commands.get(id);
    if (!commands) {
      commands = new LinkedList<ICommand>();
      this._commands.set(id, commands);
    }

    const removeFn = commands.unshift(idOrCommand);
    const ret = toDisposable(() => {
      removeFn();
      const command = this._commands.get(id);
      if (command && command.isEmpty()) {
        this._commands.delete(id);
      }
    });

    this._onDidRegisterCommand.fire(id);

    return ret;
  }

  registerCommandAlias(oldId: string, newId: string): IDisposable {
    return this.registerCommand(oldId, (accessor: Container, ...args) =>
      accessor
        .get<ICommandService>(ICommandService)
        .executeCommand(newId, ...args)
    );
  }

  getCommand(id: string): ICommand | undefined {
    const list = this._commands.get(id);
    if (!list || list.isEmpty()) {
      return undefined;
    }

    return list.iterator().next().value;
  }

  getCommands(): ICommandsMap {
    const result: ICommandsMap = Object.create(null);
    this._commands.forEach((_value: any, key: any) => {
      result[key] = this.getCommand(key)!;
    });

    return result;
  }
}

export const CommandsRegistry = new CommandsRegistryImpl();
