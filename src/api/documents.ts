import * as rback from 'razorback';
import { CoreBindings } from './protocol';
import { CoreContext } from '../core/core';
import { Event, EventEmitter } from '../base/event';
import { CoreDocumentsComponent } from '../documents/component';

// TODO: (maybe?) rename this to buffer ?
export class ExtHostDocuments {

  private readonly _onDidOpenTextDocument = new EventEmitter<rback.TextDocument>();
  private readonly _onDidCloseTextDocument = new EventEmitter<rback.TextDocument>();
  private readonly _onDidSaveTextDocument = new EventEmitter<rback.TextDocument>();

  readonly onDidOpenTextDocument: Event<rback.TextDocument> = this._onDidOpenTextDocument.event;
  readonly onDidCloseTextDocument: Event<rback.TextDocument> = this._onDidCloseTextDocument.event;
  readonly onDidSaveTextDocument: Event<rback.TextDocument> = this._onDidSaveTextDocument.event;

  private readonly _documentsService: CoreDocumentsComponent;

  constructor(coreContext: CoreContext) {
    this._documentsService = coreContext
      .get<CoreDocumentsComponent>(CoreBindings.CoreDocumentsComponent);

    this._documentsService.$onDidOpenTextDocument((document: rback.TextDocument) => {
      this._onDidOpenTextDocument.fire(document);
    });

    this._documentsService.$onDidCloseTextDocument((document: rback.TextDocument) => {
      this._onDidCloseTextDocument.fire(document);
    });

    this._documentsService.$onDidSaveTextDocument((document: rback.TextDocument) => {
      this._onDidSaveTextDocument.fire(document);
    });
  }
}
