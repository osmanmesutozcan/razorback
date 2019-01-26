import { injectable } from 'inversify';
import { createLogger } from '../logger';

const logger = createLogger('razorback#sequence');

export interface ICoreSequence {
  onNotification: (method: string, args: any) => Promise<void>;

  onRequest: (method: string, args: any, response: any) => Promise<void>;
}

@injectable()
export class CoreSequence implements ICoreSequence {
  async onNotification(method: string, args: any): Promise<void> {
    logger.info('On notification', method, args);
  }

  async onRequest(method: string, args: any, response: any): Promise<void> {
    logger.info('On request', method, args);
  }
}
