import * as rback from 'razorback';
import { inject } from 'inversify';
import { NeovimClient } from 'neovim';
import { Event, EventEmitter } from '../base/event';
import { CoreBindings } from '../core/types';
import { createLogger } from '../logger';
import { TextDocument } from './document';

const logger = createLogger('razorback#documents');

export type BufferNumber = number;

export class CoreDocumentsComponent {

  readonly $_onDidOpenTextDocument = new EventEmitter<rback.TextDocument>();
  readonly $_onDidCloseTextDocument = new EventEmitter<rback.TextDocument>();
  readonly $_onDidSaveTextDocument = new EventEmitter<rback.TextDocument>();

  readonly _onWillSaveTextDocument = new EventEmitter<BufferNumber>();
  readonly _onDidOpenTextDocument = new EventEmitter<BufferNumber>();
  readonly _onDidSaveTextDocument = new EventEmitter<BufferNumber>();
  readonly _onDidCloseTextDocument = new EventEmitter<BufferNumber>();

  readonly $onDidOpenTextDocument: Event<rback.TextDocument> = this.$_onDidOpenTextDocument.event;
  readonly $onDidCloseTextDocument: Event<rback.TextDocument> = this.$_onDidCloseTextDocument.event;
  readonly $onDidSaveTextDocument: Event<rback.TextDocument> = this.$_onDidSaveTextDocument.event;

  readonly onWillSaveTextDocument: Event<BufferNumber> = this._onWillSaveTextDocument.event;
  readonly onDidOpenTextDocument: Event<BufferNumber> = this._onDidOpenTextDocument.event;
  readonly onDidSaveTextDocument: Event<BufferNumber> = this._onDidSaveTextDocument.event;
  readonly onDidCloseTextDocument: Event<BufferNumber> = this._onDidCloseTextDocument.event;

  // Neovim will initially start with buffer no 1
  // and increment it each new buffer.
  private readonly _documents = new Map<number, TextDocument | undefined>();

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
      // to prevent race conditions. We dont want listeners
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
    await this.ensureDocument(id);
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
   * Fired when changed a buffer.
   */
  private async handleDidChangeTextDocument(id: BufferNumber) {
    await this.ensureDocument(id);
  }

  /**
   * Fired when closed a buffer.
   */
  private async handleDidCloseTextDocument(id: BufferNumber) {
    await this.ensureDocument(id);
  }
}
