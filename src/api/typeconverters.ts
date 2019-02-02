import * as rback from 'razorback';
import * as types from './types';

export namespace GlobPattern {

  export function from(pattern: rback.GlobPattern): string | types.RelativePattern {
    if (pattern instanceof types.RelativePattern) {
      return pattern;
    }

    if (typeof pattern === 'string') {
      return pattern;
    }

    if (isRelativePattern(pattern)) {
      return new types.RelativePattern(pattern.base, pattern.pattern);
    }

    return pattern; // preserve `undefined` and `null`
  }

  function isRelativePattern(obj: any): obj is rback.RelativePattern {
    const rp = obj as rback.RelativePattern;
    return rp && typeof rp.base === 'string' && typeof rp.pattern === 'string';
  }
}
