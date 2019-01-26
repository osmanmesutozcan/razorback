import * as vm from 'vm';
import * as _ from 'lodash';
import * as path from 'path';
import { createLogger } from '../logger';

import { ISandbox, IModule } from './types';
import {
  IExtension,
  IExtensionContext,
  IExtensionDefinition,
} from '../extension';

// tslint:disable-next-line:variable-name
const Module: IModule = require('module');
const logger = createLogger('razorback#sandbox');

export class ExtensionSandbox {
  private extension: IExtension;

  constructor(extension: IExtensionDefinition) {
    const sandbox = createSandbox(extension);
    delete Module._cache[require.resolve(extension.main)];

    // Attempt to import default from extension.
    this.extension = sandbox.require(extension.main).default;
    logger.debug('extension imported successfully');
  }

  /**
   * Activate extension in sandbox context.
   */
  async activate(context: IExtensionContext): Promise<boolean> {
    return this.extension.activate(context);
  }

  /**
   * Deactivate extension in sandbox context.
   */
  async deactivate(): Promise<boolean> {
    return this.extension.deactivate();
  }
}

/**
 * Construct require function.
 */
function makeRequire(this: any): any {
  const req: any = (p: string) => this.require(p);
  req.cache = Module._cache;
  req.main = process.mainModule;
  req.resolve = (request: string) =>
    Module._resolveFilename(request, this);

  return req;
}

/**
 * List of globals to remove from sandbox.
 */
const REMOVED_GLOBALS = [
  'exit',
  'kill',
  '_kill',
  'abort',
  'chdir',
  'umask',
  'setuid',
  'setgid',
  'setgroups',
  'reallyExit',
  'EventEmitter',
  '_maxListeners',
  '_fatalException',
];

/**
 * Replacement for removed globals.
 */
function removedGlobalStub(name: string): Function {
  return () => {
    throw new Error(`process.${name} is not allowed in extension sandbox`);
  };
}

/*
 * Function to replace sandbox require
 */
function createSandbox(extension: IExtensionDefinition): ISandbox {
  const { main, name } = extension;
  const logger = createLogger(`razorback#sandbox#ext#${name}`);

  const module = new Module(main);
  module.paths = Module._nodeModulePaths(main);

  const sandbox = vm.createContext({
    module,
    console: {
      log: (...args: any[]) => logger.debug.apply(logger, [args]),
      info: (...args: any[]) => logger.info.apply(logger, [args]),
      warn: (...args: any[]) => logger.warn.apply(logger, [args]),
      error: (...args: any[]) => logger.error.apply(logger, [args]),
    },
  }) as ISandbox;

  _.defaults(sandbox, global);

  sandbox.process = _.omit<any>(process, REMOVED_GLOBALS);
  REMOVED_GLOBALS.forEach((name: string) => {
    (sandbox.process as { [name: string]: any})[name] = removedGlobalStub(name);
  });

  // read-only umask
  sandbox.process.umask = (mask:number) => {
    if (typeof mask === 'undefined') {
      return process.umask();
    }

    throw new Error('Mask is read-only');
  };

  sandbox.require = function sandboxRequire(p: string): any {
    const { _compile } = Module.prototype;
    Module.prototype._compile = compile(sandbox);

    const exports = sandbox.module.require(p);
    Module.prototype._compile = _compile;

    return exports;
  };

  return sandbox;
}

/**
 * Compile extension in sandbox.
 */
function compile(sandbox: ISandbox) {
  return function (this: any, content: string, filename: string): any {
    const require = makeRequire.call(this);
    const dirname = path.dirname(filename);

    // remove shebang.
    const sanitized = content.replace(/^\#\!.*/, '');
    const wrapper = Module.wrap(sanitized);
    const compiled = vm.runInContext(wrapper, sandbox, { filename });
    const args = [this.exports, require, this, filename, dirname];
    return compiled.apply(this.exports, args);
  };
}
