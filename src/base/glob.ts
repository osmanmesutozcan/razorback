import * as glob from 'glob';
import * as LRU from 'lru-cache';
import * as rback from 'razorback';
import { createLogger } from '../logger';

const logger = createLogger('asdads');

export function parseSync(_pattern: string | rback.RelativePattern) {
  const pattern =
    typeof _pattern === 'string'
      ? _pattern
      : _pattern.pattern;

  // TODO: respect gitignore
  const paths = glob.sync(pattern);

  const cache = new LRU<string, boolean>(20);
  // TODO: This function should check if path can be globbed by the pattern.
  // Precompiling the glob pattern is a wrong approach because
  // file watcher actually catches new added files but because
  // glob paths does not include them, it fails to dispatch
  // events about new added files.
  return function (_path: string): boolean {
    const cached = cache.get(_path);
    if (cached) {
      return cached;
    }

    const path = _path.replace(/./, '');
    const result = paths.includes(path);
    cache.set(_path, result);
    return result;
  };
}
