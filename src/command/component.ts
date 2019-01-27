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
  // private readonly _proxy: ExtHostCommands; // FIXME

  private readonly _disposables = new Map<string, IDisposable>();

  private readonly _logger = createLogger('razorback#commands#core');

  readonly _generateCommandsDocumentationRegistration: IDisposable;

  constructor(
    @inject(CoreBindings.CORE_INSTANCE) private readonly core: CoreContext,
    // @ICommandService private readonly _commandService: ICommandService,
  ) {
    // this._proxy = core.getProxy(ExtHostBindings.ExtHostCommands); //FIXME

    this._generateCommandsDocumentationRegistration = CommandsRegistry
      .registerCommand(
        '_generateCommandsDocumentation',
        () => this._generateCommandsDocumentation(),
      );
  }

  $registerCommand(id: string): void {
    const proxy = this.core.getProxy<ExtHostCommands>(ExtHostBindings.ExtHostCommands);
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

    return Promise.resolve(command.handler(this.core));
  }

  async $getCommands(): Promise<string[]> {
    throw new Error('Method not implemented.');
  }

  dispose(): void {
    throw new Error('Method not implemented.');
  }

  private async _generateCommandsDocumentation(): Promise<void> {
    this._logger.warn('CoreCommands#_generateCommandsDocumentation', 'Not implemented');
  }
}
