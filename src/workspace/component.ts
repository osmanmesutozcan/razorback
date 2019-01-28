import * as rback from 'razorback';

export class CoreWorkspaceComponent {
  // FIXME: This is deprecated on vscode. Need to check
  // how to properly deprecate stuff.
  private _rootPath: string | undefined = undefined;
  get rootPath(): string | undefined {
    return this._rootPath;
  }

  // FIXME: We want to be workspace compatible eventually. But
  // Until than, this should return the rootPath.
  private _workspaceFolders: rback.WorkspaceFolder[] | undefined = undefined;
  get workspaceFolders(): rback.WorkspaceFolder[] | undefined {
    return this._workspaceFolders;
  }

  private _workspaceName: string | undefined = undefined;
  get workspaceName(): string | undefined {
    return this._workspaceName;
  }
}
