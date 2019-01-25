/**
 * Attach communication IO to Neovim.
 * Called directly from VimScript.
 *
 * For more info, check `razorback#rpc#start_server`.
 */
import { attach, NeovimClient } from 'neovim';
import { Attach } from 'neovim/lib/attach/attach';

import { createLogger } from './logger';
import { EventMethods } from './types';

class Client {
  private logger = createLogger('attach');

  private nvim: NeovimClient | null = null;

  constructor() {
    this.attach = this.attach.bind(this);
  }

  private async onNotification(
    method: string,
    args: any,
  ): Promise<void> {
    switch (method) {
      case EventMethods.VIM_ENTER:
      case EventMethods.OPTIONS_SET:
      case EventMethods.INPUT_CHAR:
      case EventMethods.GLOBAL_CHANGE:
      case EventMethods.RAZORBACK_AUTOCMD:
      default:
        this.logger.info('On notification', method, args);
        return;
    }
  }

  private async onRequest(
    method: string,
    args: any,
    response: any,
  ): Promise<void> {
    this.logger.info('On request', method);
    return;
  }

  attach(options: Attach): void {
    this.nvim = attach(options);

    this.nvim.on('notification', this.onNotification.bind(this));
    this.nvim.on('request', this.onRequest.bind(this));
  }
}

module.exports = (new Client()).attach;
