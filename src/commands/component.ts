import { inject, injectable } from 'inversify';
import { IComponent, CoreContext, CoreBindings } from '../core';
import { createLogger } from '../logger';
import { CoreCommandsShape, ExtHostBindings } from '../api/protocol';
import { CommandsRegistry, ICommandService } from './registry';
import { IDisposable } from '../base/lifecycle';
import { ExtHostCommands } from '../api/command';
import { revive } from '../base/marshalling';

@injectable()
export class CoreCommandsComponent implements CoreCommandsShape, IComponent, IDisposable {

  private readonly _disposables = new Map<string, IDisposable>();

  private readonly _logger = createLogger('razorback#commands#core');

  readonly _generateCommandsDocumentationRegistration: IDisposable;

  constructor(
    @inject(CoreBindings.CORE_INSTANCE) private readonly core: CoreContext,
  ) {

    this._generateCommandsDocumentationRegistration = CommandsRegistry
      .registerCommand(
        '_generateCommandsDocumentation',
        () => this._generateCommandsDocumentation(),
      );
  }

  $registerCommand(id: string): void {
    const proxy = this.core.get<ExtHostCommands>(ExtHostBindings.ExtHostCommands);

    this._disposables.set(
      id,
      CommandsRegistry.registerCommand(id, async (_accessor, ...args) => {
        const result = proxy.$executeContributedCommand(id, ...args);
        return revive(result, 0);
      }),
    );
  }

  $unregisterCommand(_id: string): void {
    throw new Error('Method not implemented.');
  }

  async $executeCommand<T>(id: string, _args: any[]): Promise<any> {
    const command = CommandsRegistry.getCommand(id);
    if (!command) {
      throw new Error(`Command ${id} not found.`);
    }

    return command.handler(this.core);
  }

  async $getCommands(): Promise<string[]> {
    const commands = CommandsRegistry.getCommands();
    return Object.keys(commands).map((key: string) => {
      return commands[key].id;
    });
  }

  dispose(): void {
    throw new Error('Method not implemented.');
  }

  private async _generateCommandsDocumentation(): Promise<void> {
    this._logger.warn('CoreCommands#_generateCommandsDocumentation', 'Not implemented');
  }
}
