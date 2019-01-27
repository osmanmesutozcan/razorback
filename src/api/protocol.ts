import { ICommandHandlerDescription } from '../command/types';

// -- extension host

export interface ExtHostHeapServiceShape {
  $onGarbageCollection(ids: number[]): void;
}

export interface ExtHostCommandsShape {
  $executeContributedCommand<T>(id: string, ...args: any[]): Promise<T>;

  $getContributedCommandHandlerDescriptions()
    : Promise<{ [id: string]: string | ICommandHandlerDescription }>;
}

export interface ObjectIdentifier {
  $ident: number;
}

export namespace ObjectIdentifier {
  export const name = '$ident';
  export function mixin<T>(obj: T, id: number): T & ObjectIdentifier {
    Object.defineProperty(obj, name, { value: id, enumerable: true });
    return <T & ObjectIdentifier>obj;
  }
  export function of(obj: any): number {
    return obj[name];
  }
}
