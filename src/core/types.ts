export namespace CoreBindings {
  /**
   * Sequence binding.
   */
  export const SEQUENCE = 'razorback.core.sequence';

  /**
   * Core application instance
   */
  export const CORE_INSTANCE = 'razorback.core.instance';

  /**
   * Neovim Client attached to the neovim process IO.
   */
  export const NEOVIM_CLIENT = 'razorback.core.nvim_client';

  /**
   * Extension manager singleton.
   */
  export const EXTENSION_MANAGER = 'razorback.core.extension_manager';

  /**
   * Root directory of extensions.
   */
  export const EXTENSION_DIRECTORY = 'razorback.core.entension_directory';
}

/**
 * Main plugin options.
 */
export interface ICoreOptions {
  reader: NodeJS.ReadableStream;
  writer: NodeJS.WritableStream;
}

/**
 * Notified vim event types
 */
export enum EventMethods {
  VIM_ENTER = 'VimEnter',
  OPTIONS_SET = 'OptionSet',
  INPUT_CHAR = 'InputChar',
  GLOBAL_CHANGE = 'GlobalChange',
  RAZORBACK_AUTOCMD = 'RazorbackAutocmd',
}

/**
 * Client function name mappings
 */
export namespace RazorbackcommonClientKeys {
  export namespace Extension {
    /**
     * Returns root path for extension directory.
     */
    export const ROOT_DIRECTORY = 'razorbackcommon#extension#root_directory';
  }
}
