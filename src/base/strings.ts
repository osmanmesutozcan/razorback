export function regExpFlags(regexp: RegExp): string {
  return (regexp.global ? 'g' : '')
    + (regexp.ignoreCase ? 'i' : '')
    + (regexp.multiline ? 'm' : '')
    + ((regexp as any).unicode ? 'u' : '');
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
