import { injectable, inject } from 'inversify';

import { createLogger } from '../logger';
import { EventMethods } from './types';
import { CoreBindings } from '../api/protocol';
import { CoreCommandsComponent } from '../command/component';

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
  ) { }

  async onNotification(method: string, args: any): Promise<void> {
    logger.info('CoreSequence#onNotification', method, args);

    // TODO: pull this into a handler function.
    if (method === EventMethods.RAZORBACK_CMD) {
      const [action, id, ...rest] = args;
      logger.info(`action ${action} id ${id} rest ${rest}`);
      if (action === 'run') {
        await this.coreCommandsComponent.$executeCommand(id, rest);
      }
    }
  }

  async onRequest(method: string, args: any, response: any): Promise<void> {
    logger.info('CoreSequence#onRequest', method, args);
  }
}
