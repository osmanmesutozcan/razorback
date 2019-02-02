import { URI } from './uri';

export function keys<K, V>(map: Map<K, V>): K[] {
  const result: K[] = [];
  map.forEach((_value, key) => result.push(key));
  return result;
}

export function values<V = any>(set: Set<V>): V[];
export function values<K = any, V = any>(map: Map<K, V>): V[];
export function values<V>(
  forEachable: {
    forEach(callback: (value: V, ...more: any[]) => any): any,
  },
): V[] {
  const result: V[] = [];
  forEachable.forEach(value => result.push(value));
  return result;
}

export class ResourceMap<T> {

  protected readonly map: Map<string, T>;
  protected readonly ignoreCase?: boolean;

  constructor() {
    this.map = new Map<string, T>();
    this.ignoreCase = false; // in the future this should be an uri-comparator
  }

  set(resource: URI, value: T): void {
    this.map.set(this.toKey(resource), value);
  }

  get(resource: URI): T {
    return this.map.get(this.toKey(resource))!;
  }

  has(resource: URI): boolean {
    return this.map.has(this.toKey(resource));
  }

  get size(): number {
    return this.map.size;
  }

  clear(): void {
    this.map.clear();
  }

  delete(resource: URI): boolean {
    return this.map.delete(this.toKey(resource));
  }

  forEach(clb: (value: T) => void): void {
    this.map.forEach(clb);
  }

  values(): T[] {
    return values(this.map);
  }

  private toKey(resource: URI): string {
    let key = resource.toString();
    if (this.ignoreCase) {
      key = key.toLowerCase();
    }

    return key;
  }

  keys(): URI[] {
    return keys(this.map).map(k => URI.parse(k));
  }

  clone(): ResourceMap<T> {
    const resourceMap = new ResourceMap<T>();

    this.map.forEach((value, key) => resourceMap.map.set(key, value));

    return resourceMap;
  }
}
