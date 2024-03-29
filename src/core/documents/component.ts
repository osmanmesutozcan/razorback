import * as rback from 'razorback';
import { inject } from 'inversify';
import { NeovimClient } from 'neovim';
import { CoreBindings } from '../types';
import { createLogger } from '../../logger';
import { Event, Emitter } from '../../base/event';
import { TextDocument } from './document';

const logger = createLogger('razorback#documents');

export type BufferNumber = number;

export class CoreDocumentsComponent {

  readonly $_onDidOpenTextDocument = new Emitter<rback.TextDocument>();
  readonly $_onDidCloseTextDocument = new Emitter<rback.TextDocument>();
  readonly $_onDidSaveTextDocument = new Emitter<rback.TextDocument>();

  readonly _onWillSaveTextDocument = new Emitter<BufferNumber>();
  readonly _onDidOpenTextDocument = new Emitter<BufferNumber>();
  readonly _onDidSaveTextDocument = new Emitter<BufferNumber>();
  readonly _onDidCloseTextDocument = new Emitter<BufferNumber>();

  readonly $onDidOpenTextDocument: Event<rback.TextDocument> = this.$_onDidOpenTextDocument.event;
  readonly $onDidCloseTextDocument: Event<rback.TextDocument> = this.$_onDidCloseTextDocument.event;
  readonly $onDidSaveTextDocument: Event<rback.TextDocument> = this.$_onDidSaveTextDocument.event;

  readonly onWillSaveTextDocument: Event<BufferNumber> = this._onWillSaveTextDocument.event;
  readonly onDidOpenTextDocument: Event<BufferNumber> = this._onDidOpenTextDocument.event;
  readonly onDidSaveTextDocument: Event<BufferNumber> = this._onDidSaveTextDocument.event;
  readonly onDidCloseTextDocument: Event<BufferNumber> = this._onDidCloseTextDocument.event;

  // Map of opened buffers wrapped with text document class.
  private readonly _documents = new Map<number, TextDocument | undefined>();
  getAllDocuments(): TextDocument[] {
    const documents: (TextDocument | undefined)[] = [];

    this._documents.forEach(v => documents.push(v));
    return documents.filter(v => v !== undefined) as TextDocument[];
  }

  constructor(
    @inject(CoreBindings.NEOVIM_CLIENT) private readonly nvim: NeovimClient,
  ) {

    this.onDidOpenTextDocument(this.handleDidOpenTextDocument, this);
    this.onDidSaveTextDocument(this.handleDidSaveTextDocument, this);
    this.onWillSaveTextDocument(this.handleWillSaveTextDocument, this);
    this.onDidCloseTextDocument(this.handleDidCloseTextDocument, this);
  }

  private async ensureDocument(id: BufferNumber): Promise<TextDocument> {
    if (!this._documents.has(id)) {
      // First thing is to set a document placeholder
      // to preven race conditions. We dont want listeners
      // to be registered multiple times.
      process.nextTick(() => this._documents.set(id, undefined));

      const buffer = await this.nvim.buffer;
      const document = new TextDocument(this.nvim, buffer);

      logger.debug('ensure', buffer.id, await buffer.name);
      this._documents.set(id, document);
    }

    return this._documents.get(id)!;
  }

  /**
   * Fired when entered a new buffer.
   */
  private async handleDidOpenTextDocument(id: BufferNumber) {
    const document = await this.ensureDocument(id);
    this.$_onDidOpenTextDocument.fire(document);
  }

  /**
   * Fired before a file is saved.
   */
  private async handleWillSaveTextDocument(id: BufferNumber) {
    await this.ensureDocument(id);
  }

  /**
   * Fired after a file is saved.
   */
  private async handleDidSaveTextDocument(id: BufferNumber) {
    await this.ensureDocument(id);
  }

  /**
   * Fired when closed a buffer.
   */
  private async handleDidCloseTextDocument(id: BufferNumber) {
    const document = await this.ensureDocument(id);
    document.dispose();
  }
}
