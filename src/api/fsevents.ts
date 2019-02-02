import * as rback from 'razorback';
import { CoreContext } from '../core';
import { FileSystemEvents } from '../core/fswatcher/types';
import { FileSystemWatcher } from '../core/fswatcher/watcher';
import { CoreFileSystemWatcherComponent } from '../core/fswatcher/component';
import { Emitter, Event } from '../base/event';
import { IRelativePattern } from '../base/glob';
import { CoreBindings } from './protocol';

export class ExtHostFileSystemEvents {
  private readonly _onFileEvent = new Emitter<FileSystemEvents>();
  readonly onFileEvent: Event<FileSystemEvents> = this._onFileEvent.event;

  constructor(coreContext: CoreContext) {
    const coreFSWatcher = coreContext
      .get<CoreFileSystemWatcherComponent>(CoreBindings.CoreFileSystemWatcherComponent);

    coreFSWatcher.$onFileEvent((event) => {
      this._onFileEvent.fire(event);
    });
  }

  createFileSystemWatcher(
    globPattern: string | IRelativePattern,
    ignoreCreateEvents?: boolean,
    ignoreChangeEvents?: boolean,
    ignoreDeleteEvents?: boolean,
  ) {

    return new FileSystemWatcher(
      this.onFileEvent,
      globPattern,
      ignoreCreateEvents,
      ignoreChangeEvents,
      ignoreDeleteEvents,
    );
  }
}
