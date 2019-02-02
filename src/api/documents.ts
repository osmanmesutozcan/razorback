import * as rback from 'razorback';
import { CoreContext } from '../core/core';
import { CoreDocumentsComponent } from '../core/documents/component';
import { Event, Emitter } from '../base/event';
import { CoreBindings } from './protocol';

// TODO: (maybe?) rename this to buffer ?
export class ExtHostDocuments {

  private readonly _onDidOpenTextDocument = new Emitter<rback.TextDocument>();
  private readonly _onDidCloseTextDocument = new Emitter<rback.TextDocument>();
  private readonly _onDidSaveTextDocument = new Emitter<rback.TextDocument>();

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

  getAllDocuments(): rback.TextDocument[] {
    return this._documentsService.getAllDocuments();
  }
}
