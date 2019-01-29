export function illegalArgument(name?: string): Error {
  if (name) {
    return new Error(`Illegal argument: ${name}`);
  }

  return new Error('Illegal argument');
}

export function readonly(name?: string): Error {
  return name
    ? new Error(`readonly property '${name} cannot be changed'`)
    : new Error('readonly property cannot be changed');
}
