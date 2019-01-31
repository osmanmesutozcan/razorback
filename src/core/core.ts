import { attach, NeovimClient, Buffer as NeovimBuffer } from 'neovim';
import { makeLoggerMiddleware } from 'inversify-logger-middleware';
import {
  Container,
  injectable,
  unmanaged,
  decorate,
} from 'inversify';

import { createLogger } from '../logger';
import { ICoreSequence } from './sequence';
import { IComponent, Constructor, mountComponent } from './component';
import { ICoreOptions, CoreBindings, ClientCommandMappings } from './types';

const logger = createLogger('razorback#core');

/**
 * Core is a container for razorback services and configurations.
 */
@injectable()
export class CoreContext extends Container {
  constructor(
    @unmanaged() coreOptions: ICoreOptions,
  ) {
    super();

    const nvim = attach(coreOptions);

    this.applyMiddleware(
      makeLoggerMiddleware(undefined, out => logger.trace(out)),
    );

    this
      .bind<NeovimClient>(CoreBindings.NEOVIM_CLIENT)
      .toConstantValue(nvim);

    this.bind(CoreBindings.CORE_INSTANCE)
      .toConstantValue(this);
  }

  private async _onNotification(method: string, args: any): Promise<void> {
    const sequence = this.get<ICoreSequence>(CoreBindings.SEQUENCE);
    return await sequence.onNotification(method, args);
  }

  private async _onRequest(method: string, args: any, response: any): Promise<void> {
    const sequence = this.get<ICoreSequence>(CoreBindings.SEQUENCE);
    return await sequence.onRequest(method, args, response);
  }

  sequence(sequence: Constructor<ICoreSequence>) {
    this.bind(CoreBindings.SEQUENCE)
      .to(sequence)
      .inSingletonScope();
  }

  /**
   * Bind a service like component to core context.
   *
   * Services are bound in transient scope. They will
   * re-initialize every time requested from the core
   * context.
   */
  service<T>(binding: symbol, service: Constructor<T>) {
    this.bind(binding).to(service);
  }

  /**
   * Bind a component and register its extensions such as
   * providers to application context and call boot function
   * of component if exist.
   *
   * Components are bound in singleton scope by default.
   * Which means they will be shared across application.
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
   * Bind a constant value to coreContext.
   * Constant values can be initialized
   * classes as well.
   */
  constant<T>(binding: symbol, value: T): T {
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
    client.on('notification', this._onNotification.bind(this));
    client.on('request', this._onRequest.bind(this));
  }

  /**
   * Stop core and all of registered extensions.
   */
  async stop(): Promise<void> {
    logger.error('Not Implemented');
  }
}

