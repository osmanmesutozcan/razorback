import * as rback from 'razorback';
import { CoreContext } from '../core/core';
import { dispose } from '../base/lifecycle';
import { EventEmitter } from '../base/event';
import { IDocumentsAndEditorsDelta } from './protocol';

/*
 * This module keeps track of active buffer.
 */
export class ExtHostEditor {
  // TODO:
  // private readonly _onDidChangeActiveTextEditor = new EventEmitter<rback.TextEditor>();
  // readonly onDidChangeActiveTextEditor = this._onDidChangeActiveTextEditor.event;

  private _disposables: rback.Disposable[] = [];

  private _activeEditorId: string | undefined;

  constructor(
    private readonly _coreContext: CoreContext,
  ) { }

  dispose() {
    this._disposables = dispose(this._disposables);
  }

  $acceptDocumentsAndEditorsDelta(delta: IDocumentsAndEditorsDelta) {
    //
  }
}
