/**
 * Built-in 'module' definition.
 */
export interface IModule {
  new (name: string): any;

  _extensions: {};
  _compile: () => void;
  _cache: {[file: string]: any};
  _nodeModulePaths: (filename: string) => string[];
  _resolveFilename: (file: string, context: any) => string;

  wrap: (content: string) => string;
  require: (file: string) => NodeModule;
}

/**
 * Sandbox definition for vm.
 */
export interface ISandbox {
  process: NodeJS.Process;
  module: NodeModule;
  require: (p: string) => any;
  console: { [key in keyof Console]?: Function };
}
