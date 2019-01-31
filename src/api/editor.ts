import * as rback from 'razorback';
import { CoreContext } from '../core/core';
import { dispose } from '../base/lifecycle';
import { EventEmitter } from '../base/event';
import { IDocumentsAndEditorsDelta } from './protocol';

/**
 * This class wraps around a neovim window.
 */
export class ExtHostEditor {
  private readonly $_onDidChangeActiveTextEditor = new EventEmitter<rback.TextEditor>();

  readonly $onDidChangeActiveTextEditor = this.$_onDidChangeActiveTextEditor.event;

  private _disposables: rback.Disposable[] = [];

  private _activeEditorId: string | undefined;

  constructor(
    private readonly _coreContext: CoreContext,
  ) { }

  dispose() {
    //
  }

  $acceptDocumentsAndEditorsDelta(delta: IDocumentsAndEditorsDelta) {
    //
  }
}
