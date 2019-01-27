import { inject } from 'inversify';
import { IComponent, Core, CoreBindings } from '../core';
import { createLogger } from '../logger';
import { CoreCommandsShape, ExtHostBindings } from '../api/protocol';
import { CommandsRegistry, ICommandService } from './registry';
import { IDisposable } from '../base/lifecycle';
import { ExtHostCommands } from '../api/command';
import { revive } from '../base/marshalling';

export class CoreCommandsComponent implements CoreCommandsShape, IComponent, IDisposable {
  private readonly _proxy: ExtHostCommands;

  private readonly _disposables = new Map<string, IDisposable>();

  private readonly _logger = createLogger('razorback#commands#core');

  readonly _generateCommandsDocumentationRegistration: IDisposable;

  constructor(
    @inject(CoreBindings.CORE_INSTANCE) core: Core,
    // @ICommandService private readonly _commandService: ICommandService,
  ) {
    this._proxy = core.getProxy(ExtHostBindings.ExtHostCommands);

    this._generateCommandsDocumentationRegistration = CommandsRegistry
      .registerCommand(
        '_generateCommandsDocumentation',
        () => this._generateCommandsDocumentation(),
      );
  }

  $registerCommand(id: string): void {
    this._disposables.set(
      id,
      CommandsRegistry.registerCommand(id, async (_accessor, ...args) => {
        const result = this._proxy.$executeContributedCommand(id, ...args);
        return revive(result, 0);
      }),
    );
  }

  $unregisterCommand(_id: string): void {
    throw new Error('Method not implemented.');
  }

  async $executeCommand<T>(_id: string, _args: any[]): Promise<T> {
    throw new Error('Method not implemented.');
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
