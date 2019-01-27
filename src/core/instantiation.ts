import { inject } from 'inversify';

/**
 * The only valid way to create a service decorator.
 */
export function createDecorator<T>(
  serviceId: string,
): { (...args: []): void; type: T; toString: () => string } {
  const id = <any>function (target: Function, key: string, index: number): any {
    if (arguments.length !== 3) {
      throw new Error('@IServiceName-decorator can only be used to decorate a parameter');
    }

    return inject(id)(target, key, index);
  };

  id.toString = () => serviceId;

  return id;
}
