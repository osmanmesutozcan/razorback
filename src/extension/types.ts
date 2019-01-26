export namespace ExtensionInternalBindings {
  export const DATABASE = 'razorback.extension.database';
}

export interface DatabaseSchema {
  extensions: IExtensionModel[];
}

/**
 * Single extension entry in database.
 */
export interface IExtensionModel {
  id: string;
  name: string;
  root: string;
  state: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface IExtensionDefinition extends IExtensionModel {
  /**
   * Extension entrypoint.
   */
  main: string;
  /**
   * Is extension currently active.
   */
  isActivated: boolean;
}

export interface IExtensionContext {
  // stuff
}

export interface IExtension {
  activate: (context: IExtensionContext) => Promise<boolean>;
  deactivate: () => Promise<boolean>;
}
