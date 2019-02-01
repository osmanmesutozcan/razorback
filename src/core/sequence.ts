import { injectable, inject } from 'inversify';

import { createLogger } from '../logger';
import { EventMethods } from './types';
import { CoreBindings } from '../api/protocol';

// TODO: these should be converted to shapes
import { CoreCommandsComponent } from './commands/component';
import { CoreDocumentsComponent } from './documents/component';

const logger = createLogger('razorback#sequence');

export interface ICoreSequence {
  onNotification: (method: string, args: any) => Promise<void>;

  onRequest: (method: string, args: any, response: any) => Promise<void>;
}

@injectable()
export class CoreSequence implements ICoreSequence {
  constructor(
    @inject(CoreBindings.CoreCommandsComponent)
    private readonly coreCommandsComponent: CoreCommandsComponent,
    @inject(CoreBindings.CoreDocumentsComponent)
    private readonly coreDocumentsComponent: CoreDocumentsComponent,
  ) { }

  async onNotification(method: string, args: any): Promise<void> {
    logger.debug('CoreSequence#onNotification', method, args);

    // User commands
    if (method === EventMethods.RAZORBACK_CMD) {
      const [action, id, ...rest] = args;
      logger.trace(`action ${action} id ${id} rest ${rest}`);

      if (action === 'run') {
        await this.coreCommandsComponent.$executeCommand(id, rest);
      }

      // Auto commands
    } else if (method === EventMethods.RAZORBACK_AUTOCMD) {
      const [action, id, ...rest] = args;
      logger.trace(`action ${action} id ${id} rest ${rest}`);

      if (action === 'BufEnter' || action === 'BufAdd') {
        this.coreDocumentsComponent._onDidOpenTextDocument.fire(id);

      } else if (action === 'BufWritePre') {
        this.coreDocumentsComponent._onWillSaveTextDocument.fire(id);
      } else if (action === 'BufWritePost') {
        this.coreDocumentsComponent._onDidSaveTextDocument.fire(id);

      } else if (action === 'BufLeave') {
        this.coreDocumentsComponent._onDidCloseTextDocument.fire(id);
      }
    }
  }

  async onRequest(method: string, args: any, response: any): Promise<void> {
    logger.info('CoreSequence#onRequest', method, args);
  }
}
