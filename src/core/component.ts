import { Core } from './core';

export type BoundValue = any;

/**
 * A class constructor accepting arbitrary arguments.
 */
export type Constructor<T> =
  new (...args: any[]) => T;

export interface ClassMap {
  [binding: string]: Constructor<BoundValue>;
}

export interface ServiceMap {
  [binding: string]: BoundValue;
}

/**
 * Component definition.
 */
export interface IComponent {
  /**
   * Boot function for async initializing any required
   * parts of the component. Called during bind operation
   * of the component (when `core.component(Component)`).
   *
   */
  boot?: () => Promise<void>;

  /**
   * A map of classes to be bound to core context.
   * Classes are bound in Transient scope.
   */
  classes?: ClassMap;

  /*
   * A map of service to be bound to core context.
   * Services are bound in Singleton scope.
   */
  services?: ServiceMap;

  /**
   * Other properties
   */
  [prop: string]: any;
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
