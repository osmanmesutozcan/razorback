import * as rback from "razorback";
import { createLogger } from "../../logger";
import { ICreateApi } from "../../api";
import { createSandbox } from "../sandbox";
import { ExtensionDescriptionRegistry } from "./registry";
import { IExtension, IExtensionDescription } from "./types";

const logger = createLogger("razorback#extension#extension");

export class Extension<T> implements rback.Extension<T> {
  /*
   * Extension module in sandbox.
   */
  private _extension: IExtension<T>;

  /*
   * Contains all extension info.
   */
  private _description: IExtensionDescription;
  get extensionPath(): string {
    return this._description.extensionLocation.path;
  }
  get id(): string {
    return this._description.id;
  }

  private _packageJSON: any;
  get packageJSON(): any {
    return this._packageJSON;
  }

  get exports(): T {
    if (!this._isActive) {
      // TODO: This action is invalid
    }

    // TODO: return extension public api
    return {} as T;
  }

  /*
   * Extension context
   * TODO: Actually construct this.
   */
  private _context = {
    subscriptions: []
  };

  /*
   * Is extension active.
   * Flags if application is activated at the moment.
   */
  private _isActive: boolean = false;
  get isActive(): boolean {
    return this._isActive;
  }

  /*
   * Is extension enabled.
   * Flags if application is enabled for a
   * workspace.
   */
  private isEnabled: boolean = false;
  get enabled(): boolean {
    return this.isEnabled;
  }

  constructor(
    createApi: ICreateApi,
    extension: IExtensionDescription,
    extensionRegistry: ExtensionDescriptionRegistry,
    packageJSON: any
  ) {
    const sandbox = createSandbox(createApi, extension, extensionRegistry);

    this._description = extension;
    this._packageJSON = packageJSON;
    this._extension = sandbox.require(extension.extensionLocation.path);
    logger.debug("extension imported successfully");
  }

  /**
   * Activate extension in sandbox context.
   */
  async activate(): Promise<T> {
    this._isActive = true;
    return this._extension.activate.apply(global, [this._context]);
  }

  /**
   * Deactivate extension in sandbox context.
   */
  async deactivate(): Promise<boolean> {
    this._isActive = false;
    return this._extension.deactivate();
  }
}
