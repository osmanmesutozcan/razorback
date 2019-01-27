export function regExpFlags(regexp: RegExp): string {
  return (regexp.global ? 'g' : '')
    + (regexp.ignoreCase ? 'i' : '')
    + (regexp.multiline ? 'm' : '')
    + ((regexp as any).unicode ? 'u' : '');
}

