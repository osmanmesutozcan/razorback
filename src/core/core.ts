import { attach, NeovimClient } from 'neovim';
import { makeLoggerMiddleware } from 'inversify-logger-middleware';
import { Container, injectable, getServiceIdentifierAsString, unmanaged } from 'inversify';

import { createLogger } from '../logger';
import { ICoreSequence, CoreSequence } from './sequence';
import { IComponent, Constructor, mountComponent } from './component';
import { ICoreOptions, CoreBindings, RazorbackcommonClientKeys } from './types';

const logger = createLogger('razorback#core');

/**
 * Core is a container for razorback artifacts.
 */
@injectable()
export class Core extends Container {
  constructor(
    @unmanaged() coreOptions: ICoreOptions,
  ) {
    super();

    this.applyMiddleware(
      makeLoggerMiddleware(undefined, out => logger.trace(out)),
    );

    this
      .bind<NeovimClient>(CoreBindings.NEOVIM_CLIENT)
      .toConstantValue(attach(coreOptions));

    this.bind(CoreBindings.CORE_INSTANCE)
      .toConstantValue(this);

    this.sequence(CoreSequence);
  }

  private async onNotification(method: string, args: any): Promise<void> {
    const sequence = this.get<ICoreSequence>(CoreBindings.SEQUENCE);
    return await sequence.onNotification(method, args);
  }

  private async onRequest(method: string, args: any, response: any): Promise<void> {
    const sequence = this.get<ICoreSequence>(CoreBindings.SEQUENCE);
    return await sequence.onRequest(method, args, response);
  }

  private sequence(sequence: Constructor<ICoreSequence>) {
    this.bind(CoreBindings.SEQUENCE)
      .to(sequence);
  }

  /**
   * Bind a component and register its extensions such as
   * providers to application context and call boot function
   * of component if exist.
   */
  async component(component: Constructor<IComponent>) {
    const binding = getServiceIdentifierAsString(component);
    this.bind<IComponent>(binding).to(component);

    const instance = this.get<IComponent>(binding);
    await mountComponent(this, instance);
  }

  /**
   * Core boot sequence.
   */
  async boot(): Promise<void> {
    const client = this.get<NeovimClient>(CoreBindings.NEOVIM_CLIENT);

    const root = await client.call(
      RazorbackcommonClientKeys.Extension.ROOT_DIRECTORY,
    );
    this.bind(CoreBindings.EXTENSION_DIRECTORY)
      .toConstantValue(root);
  }

  /**
   * Start receiving from Neovim.
   */
  async start(): Promise<void> {
    const client = this.get<NeovimClient>(CoreBindings.NEOVIM_CLIENT);
    client.on('notification', this.onNotification.bind(this));
    client.on('request', this.onRequest.bind(this));
  }

  /**
   * Stop core and all of registered extensions.
   */
  async stop(): Promise<void> {
    logger.error('Not Implemented');
  }
}

