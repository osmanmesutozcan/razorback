import { WorkspaceFolder } from 'razorback';
import { CoreWorkspaceComponent } from '../workspace/component';
import { CoreContext } from '../core/core';
import { CoreBindings } from './protocol';

export class ExtHostWorkspace {

  private readonly _workspaceService: CoreWorkspaceComponent;

  constructor(coreContext: CoreContext) {
    this._workspaceService = coreContext
      .get<CoreWorkspaceComponent>(CoreBindings.CoreWorkspaceComponent);
  }

  get rootPath(): string | undefined {
    return this._workspaceService.rootPath;
  }

  get workspaceFolders(): WorkspaceFolder[] | undefined {
    return this._workspaceService.workspaceFolders;
  }

  get name(): string | undefined {
    return this._workspaceService.workspaceName;
  }
}
