export interface IDisposable {
  dispose(): void;
}

export function toDisposable(fn: () => void): IDisposable {
  return { dispose() { fn(); } };
}

export function dispose<T extends IDisposable>(disposable: T): T;
export function dispose<T extends IDisposable>(...disposables: Array<T | undefined>): T[];
export function dispose<T extends IDisposable>(disposables: T[]): T[];
export function dispose<T extends IDisposable>(first: T | T[], ...rest: T[]): T | T[] | undefined {
  if (Array.isArray(first)) {
    first.forEach(d => d && d.dispose());
    return [];
  }

  if (rest.length === 0) {
    if (first) {
      first.dispose();
      return first;
    }
    return undefined;
  }

  dispose(first);
  dispose(rest);

  return [];
}
