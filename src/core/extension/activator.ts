import { IDisposable } from "../../base/lifecycle";

export interface IActivatedExtension<T> {
  activate: (context: IExtensionContext) => Promise<T>;
  deactivate: () => Promise<boolean>;
}

export interface IExtensionMemento {
  get<T>(key: string, defaultValue: T): T;
  update(key: string, value: any): Thenable<boolean>;
}

export interface IExtensionContext {
  subscriptions: IDisposable[];
  workspaceState: IExtensionMemento;
  globalState: IExtensionMemento;
  extensionPath: string;
  storagePath: string;
  globalStoragePath: string;
  asAbsolutePath(relativePath: string): string;
  readonly logPath: string;
}
