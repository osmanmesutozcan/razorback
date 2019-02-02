import { CharCode } from './charcode';

// TODO:
const isWindows = false;

/**
 * Adapted from Node's path.isAbsolute functions
 */
export function isAbsolute(path: string): boolean {
  return isWindows ?
    isAbsolute_win32(path) :
    isAbsolute_posix(path);
}

export function isAbsolute_win32(path: string): boolean {
  if (!path) {
    return false;
  }

  const char0 = path.charCodeAt(0);
  if (char0 === CharCode.Slash || char0 === CharCode.Backslash) {
    return true;
  }

  if (
    (char0 >= CharCode.A && char0 <= CharCode.Z)
    || (char0 >= CharCode.a && char0 <= CharCode.z)
  ) {
    if (path.length > 2 && path.charCodeAt(1) === CharCode.Colon) {
      const char2 = path.charCodeAt(2);

      if (char2 === CharCode.Slash || char2 === CharCode.Backslash) {
        return true;
      }
    }
  }

  return false;
}

export function isAbsolute_posix(path: string): boolean {
  return !!(path && path.charCodeAt(0) === CharCode.Slash);
}
