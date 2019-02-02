// tslint:disable:no-parameter-reassignment

export function regExpFlags(regexp: RegExp): string {
  return (regexp.global ? 'g' : '')
    + (regexp.ignoreCase ? 'i' : '')
    + (regexp.multiline ? 'm' : '')
    + ((regexp as any).unicode ? 'u' : '');
}

/**
 * Escapes regular expression characters in a given string
 */
export function escapeRegExpCharacters(value: string): string {
  return value.replace(/[\-\\\{\}\*\+\?\|\^\$\.\[\]\(\)\#]/g, '\\$&');
}

export interface RegExpOptions {
  matchCase?: boolean;
  wholeWord?: boolean;
  multiline?: boolean;
  global?: boolean;
}
export function createRegExp(
  searchString: string,
  isRegex: boolean,
  options: RegExpOptions = {},
): RegExp {

  if (!searchString) {
    throw new Error('Cannot create regex from empty string');
  }

  if (!isRegex) {
    searchString = escapeRegExpCharacters(searchString);
  }

  if (options.wholeWord) {
    if (!/\B/.test(searchString.charAt(0))) {
      searchString = `\\b${searchString}`;
    }
    if (!/\B/.test(searchString.charAt(searchString.length - 1))) {
      searchString = `${searchString}\\b`;
    }
  }

  let modifiers = '';
  if (options.global) {
    modifiers += 'g';
  }
  if (!options.matchCase) {
    modifiers += 'i';
  }
  if (options.multiline) {
    modifiers += 'm';
  }

  return new RegExp(searchString, modifiers);
}

export function regExpLeadsToEndlessLoop(regexp: RegExp): boolean {
  // Exit early if it's one of these special cases which are meant to match
  // against an empty string
  if (
    regexp.source === '^'
    || regexp.source === '^$'
    || regexp.source === '$'
    || regexp.source === '^\\s*$'
  ) {
    return false;
  }

  // We check against an empty string. If the regular expression doesn't advance
  // (e.g. ends in an endless loop) it will match an empty string.
  const match = regexp.exec('');
  return !!(match && <any>regexp.lastIndex === 0);
}
