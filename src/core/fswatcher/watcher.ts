import * as rback from 'razorback';
import { URI } from '../../base/uri';
import { parse, IRelativePattern } from '../../base/glob';
// import { Disposable } from '../../base/lifecycle';
import { Emitter, Event } from '../../base/event';
import { FileSystemEvents } from './types';

// TODO: have message service to show these erorrs to user, so they can
// fix stuff if they need to.
export class FileSystemWatcher implements rback.FileSystemWatcher {

  private _onDidCreate = new Emitter<rback.Uri>();
  private _onDidChange = new Emitter<rback.Uri>();
  private _onDidDelete = new Emitter<rback.Uri>();
  // private _disposable: Disposable;
  private _config = 0;

  get ignoreCreateEvents(): boolean {
    return Boolean(this._config & 0b001);
  }

  get ignoreChangeEvents(): boolean {
    return Boolean(this._config & 0b010);
  }

  get ignoreDeleteEvents(): boolean {
    return Boolean(this._config & 0b100);
  }

  constructor(
    dispatcher: Event<FileSystemEvents>,
    globPattern: string | IRelativePattern,
    ignoreCreateEvents?: boolean,
    ignoreChangeEvents?: boolean,
    ignoreDeleteEvents?: boolean,
  ) {

    if (ignoreCreateEvents) {
      this._config += 0b001;
    }
    if (ignoreChangeEvents) {
      this._config += 0b010;
    }
    if (ignoreDeleteEvents) {
      this._config += 0b100;
    }

    const parsedPattern = parse(globPattern);

    dispatcher((events) => {
      if (!ignoreCreateEvents) {
        events.created.forEach((created) => {
          const uri = URI.revive(created);
          if (parsedPattern(uri.fsPath)) {
            this._onDidCreate.fire(uri);
          }
        });
      }
      if (!ignoreChangeEvents) {
        events.changed.forEach((changed) => {
          const uri = URI.revive(changed);
          if (parsedPattern(uri.fsPath)) {
            this._onDidChange.fire(uri);
          }
        });
      }
      if (!ignoreDeleteEvents) {
        events.deleted.forEach((deleted) => {
          const uri = URI.revive(deleted);
          if (parsedPattern(uri.fsPath)) {
            this._onDidDelete.fire(uri);
          }
        });
      }
    });

    // TODO
    // this._disposable = Disposable.from(
    //   this._onDidCreate,
    //   this._onDidChange,
    //   this._onDidDelete,
    // );
  }

  dispose() {
    // this._disposable.dispose();
  }

  get onDidCreate(): Event<rback.Uri> {
    return this._onDidCreate.event;
  }

  get onDidChange(): Event<rback.Uri> {
    return this._onDidChange.event;
  }

  get onDidDelete(): Event<rback.Uri> {
    return this._onDidDelete.event;
  }
}
