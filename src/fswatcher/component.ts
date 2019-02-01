import * as chokidar from 'chokidar';
import { inject } from 'inversify';
import { EventEmitter, Event } from '../base/event';
import { CoreBindings } from '../core/types';
import { CoreContext } from '../core/core';
import { CoreWorkspaceComponent } from '../workspace/component';
import { CoreBindings as CoreProtocolBindings } from '../api/protocol';
import { FileSystemEvents } from './types';
import { URI } from '../base/uri';

export class CoreFileSystemWatcherComponent {
  private readonly $_onFileEvent = new EventEmitter<FileSystemEvents>();
  readonly $onFileEvent: Event<FileSystemEvents> = this.$_onFileEvent.event;

  private readonly _coreWorkspaceComponent: CoreWorkspaceComponent;

  private readonly _watcher: chokidar.FSWatcher;

  constructor(
    @inject(CoreBindings.CORE_INSTANCE) coreContext: CoreContext,
  ) {
    this._coreWorkspaceComponent = coreContext
      .get<CoreWorkspaceComponent>(CoreProtocolBindings.CoreWorkspaceComponent);

    const directories = this._getRootdirectories();
    this._watcher = chokidar.watch(directories);

    this._watcher.on('all', (event, path) => {
      const fileEvent: FileSystemEvents = {
        created: [],
        changed: [],
        deleted: [],
      };

      // File events
      if (event === 'add') {
        fileEvent.created.push(URI.file(path));
      }
      if (event === 'change') {
        fileEvent.changed.push(URI.file(path));
      }
      if (event === 'unlink') {
        fileEvent.deleted.push(URI.file(path));
      }

      this.$_onFileEvent.fire(fileEvent);
    });

    // Sync workspace folder changes.
    this._coreWorkspaceComponent.$onDidChangeWorkspaceFolders((event) => {
      event.added.forEach(f => this._watcher.add(f.uri.fsPath));
      event.removed.forEach(f => this._watcher.unwatch(f.uri.fsPath));
    });
  }

  private _getRootdirectories(): string[]  {
    const directories = this._coreWorkspaceComponent.workspaceFolders;

    if (directories) {
      return directories.map(f => f.uri.fsPath);
    }

    // TODO handle unsaved buffer.
    // for now whereever we start vim from.
    return ['.'];
  }
}
