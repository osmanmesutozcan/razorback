import { NeovimClient } from 'neovim';
import { injectable, inject } from 'inversify';
import { CoreBindings, CoreContext } from '../';
import { ClientCommandMappings } from '../types';

@injectable()
export class CoreMessageComponent {

  private readonly nvim: NeovimClient;

  constructor(
    @inject(CoreBindings.CORE_INSTANCE) coreContext: CoreContext,
  ) {
    this.nvim = coreContext.get(CoreBindings.NEOVIM_CLIENT);
  }

  /*
   * Multiline generic message.
   * @param message {String} message to send
   */
  async multilinesMessage(message: string): Promise<number | undefined> {
    return this.nvim.call(ClientCommandMappings.Window.MULTILINE_MESSAGE, message);
  }

  /**
   * Warning generic message.
   * @param message {String} message to send
   */
  async warningMessage(message: string): Promise<number | undefined> {
    return this.nvim.call(ClientCommandMappings.Window.WARNING_MESSAGE, message);
  }

  /**
   * Error generic message.
   * @param message {String} message to send
   */
  async errorMessage(message: string): Promise<number | undefined> {
    return this.nvim.call(ClientCommandMappings.Window.ERROR_MESSAGE, message);
  }
}
