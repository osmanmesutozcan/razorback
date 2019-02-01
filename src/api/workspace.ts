import * as rback from 'razorback';
import { CoreWorkspaceComponent } from '../core/workspace/component';
import { CoreContext } from '../core/core';
import { Event, EventEmitter } from '../base/event';
import { CoreBindings } from './protocol';

export class ExtHostWorkspace {
  private readonly _onDidChangeWorkspaceFolders =
    new EventEmitter<rback.WorkspaceFoldersChangeEvent>();
  readonly onDidChangeWorkspaceFolders: Event<rback.WorkspaceFoldersChangeEvent> =
    this._onDidChangeWorkspaceFolders.event;

  private readonly _workspaceService: CoreWorkspaceComponent;

  constructor(coreContext: CoreContext) {
    this._workspaceService = coreContext
      .get<CoreWorkspaceComponent>(CoreBindings.CoreWorkspaceComponent);

    this._workspaceService.$onDidChangeWorkspaceFolders((change) => {
      this._onDidChangeWorkspaceFolders.fire(change);
    });
  }

  get rootPath(): string | undefined {
    return this._workspaceService.rootPath;
  }

  get workspaceFolders(): rback.WorkspaceFolder[] | undefined {
    return this._workspaceService.workspaceFolders;
  }

  get name(): string | undefined {
    return this._workspaceService.workspaceName;
  }
}
