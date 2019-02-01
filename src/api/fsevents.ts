import * as rback from 'razorback';
import { CoreContext } from '../core';
import { EventEmitter, Event } from '../base/event';
import { FileSystemEvents } from '../fswatcher/types';
import { FileSystemWatcher } from '../fswatcher/watcher';
import { CoreFileSystemWatcherComponent } from '../fswatcher/component';
import { CoreBindings } from './protocol';

export class ExtHostFileSystemEvents {
  private readonly _onFileEvent = new EventEmitter<FileSystemEvents>();
  readonly onFileEvent: Event<FileSystemEvents> = this._onFileEvent.event;

  constructor(coreContext: CoreContext) {
    const coreFSWatcher = coreContext
      .get<CoreFileSystemWatcherComponent>(CoreBindings.CoreFileSystemWatcherComponent);

    coreFSWatcher.$onFileEvent((event) => {
      this._onFileEvent.fire(event);
    });
  }

  createFileSystemWatcher(
    globPattern: string | rback.RelativePattern,
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
