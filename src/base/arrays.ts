export function equals<T>(
  one: ReadonlyArray<T> | undefined,
  other: ReadonlyArray<T> | undefined,
  itemEquals: (a: T, b: T) => boolean = (a, b) => a === b,
): boolean {
  if (one === other) {
    return true;
  }

  if (!one || !other) {
    return false;
  }

  if (one.length !== other.length) {
    return false;
  }

  // tslint:disable-next-line:no-increment-decrement
  for (let i = 0, len = one.length; i < len; i++) {
    if (!itemEquals(one[i], other[i])) {
      return false;
    }
  }

  return true;
}
