import { Core } from './core';
import { createLogger } from '../logger';

export type BoundValue = any;

/**
 * A class constructor accepting arbitrary arguments.
 */
export type Constructor<T> =
  new (...args: any[]) => T;

export interface ClassMap {
  [binding: string]: Constructor<BoundValue>;
}

/**
 * Component definition.
 */
export interface IComponent {
  /**
   * Boot function to initialize setup components.
   */
  boot?: () => Promise<void>;

  /**
   * A map of classes to be bound to core context.
   */
  classes?: ClassMap;
}

/**
 * Mount a component to core context.
 */
export async function mountComponent(core: Core, component: IComponent): Promise<void> {
  if (component.classes) {
    for (const classKey in component.classes) {
      core.bind(classKey)
        .to(component.classes[classKey]);
    }
  }

  if (component.boot !== undefined) {
    await component.boot();
  }
}
