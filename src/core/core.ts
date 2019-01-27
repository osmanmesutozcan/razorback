import { attach, NeovimClient } from 'neovim';
import { makeLoggerMiddleware } from 'inversify-logger-middleware';
import {
  Container,
  injectable,
  unmanaged,
  decorate,
} from 'inversify';

import { createLogger } from '../logger';
import { ICoreSequence, CoreSequence } from './sequence';
import { IComponent, Constructor, mountComponent } from './component';
import { ICoreOptions, CoreBindings, ClientCommandMappings } from './types';

const logger = createLogger('razorback#core');

/**
 * Core is a container for razorback artifacts.
 */
@injectable()
export class CoreContext extends Container {
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
  }

  private async onNotification(method: string, args: any): Promise<void> {
    const sequence = this.get<ICoreSequence>(CoreBindings.SEQUENCE);
    return await sequence.onNotification(method, args);
  }

  private async onRequest(method: string, args: any, response: any): Promise<void> {
    const sequence = this.get<ICoreSequence>(CoreBindings.SEQUENCE);
    return await sequence.onRequest(method, args, response);
  }

  sequence(sequence: Constructor<ICoreSequence>) {
    this.bind(CoreBindings.SEQUENCE)
      .to(sequence);
  }

  /**
   * Bind a component and register its extensions such as
   * providers to application context and call boot function
   * of component if exist.
   */
  async component(binding: symbol, component: Constructor<IComponent>) {
    decorate(injectable(), component);
    this.bind<IComponent>(binding)
      .to(component)
      .inSingletonScope();

    const instance = this.get<IComponent>(binding);
    await mountComponent(this, instance);
  }

  /**
   * Bind a component and register its extensions such as
   * providers to application context and call boot function
   * of component if exist.
   */
  set<T>(binding: symbol, value: T): T {
    this.bind<typeof value>(binding)
      .toConstantValue(value);

    return value;
  }

  /**
   * Get a bound value from context.
   */
  getProxy<T>(binding: symbol): T {
    return this.get<T>(binding);
  }

  /**
   * Core boot sequence.
   */
  async boot(): Promise<void> {
    const client = this.get<NeovimClient>(CoreBindings.NEOVIM_CLIENT);

    const root = await client.call(
      ClientCommandMappings.Extension.ROOT_DIRECTORY,
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

