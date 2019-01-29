// tslint:disable:no-parameter-reassignment

import * as _ from 'lodash';
import * as rback from 'razorback';
import { NeovimClient, Buffer as NeovimBuffer } from 'neovim';
import { createLogger } from '../logger';
import { Range, Position } from '../api/types';
import { regExpLeadsToEndlessLoop } from '../base/strings';
import { getWordAtText, ensureValidWordDefinition, PrefixSumComputer } from '../base/model';
import { URI } from '../base/uri';

const logger = createLogger('razorback#documents#document');

const _modeId2WordDefinition = new Map<string, RegExp>();
export function setWordDefinitionFor(modeId: string, wordDefinition: RegExp): void {
  _modeId2WordDefinition.set(modeId, wordDefinition);
}
export function getWordDefinitionFor(modeId: string): RegExp {
  return _modeId2WordDefinition.get(modeId)!;
}

export enum EndOfLine {
  /**
   * The line feed `\n` character.
   */
  LF = 1,
  /**
   * The carriage return line feed `\r\n` sequence.
   */
  CRLF = 2,
}

export class TextDocument implements rback.TextDocument {

  // TODO:
  private _uri: URI = URI.file('/tmp/test.txt');
  get uri(): URI {
    return this._uri;
  }
  get fileName(): string {
    return this._uri.fsPath;
  }

  private _lineStarts: PrefixSumComputer | null = null;

  // TODO
  readonly eol = EndOfLine.LF;
  private get _eol(): string {
    return (this.eol === EndOfLine.LF) ? '\n' : '\r\n';
  }

  private _name = '';
  get name(): string {
    return this._name;
  }

  private _languageId = '';
  get languageId(): string {
    return this._languageId;
  }

  private _lines: rback.TextLine[] = [];
  get lineCount(): number {
    return this._lines.length || 1;
  }

  // Count every 'line'event.
  private _version = 1;
  get version(): number {
    return this._version;
  }

  // Document is dirty until document component
  // calls save() this document.
  private _isDirty = false;
  get isDirty(): boolean {
    return this._isDirty;
  }

  // Document buffer is closed and resource
  // is not synced anymore.
  private _isClosed = false;
  get isClosed(): boolean {
    return this._isClosed;
  }

  // TODO: Make a bunch of shit to get this working.
  get isUntitled(): boolean {
    return false;
  }

  constructor(
    _nvim: NeovimClient,
    _buffer: NeovimBuffer,
  ) {

    _buffer.listen(
      'detach',
      this.handleDetachEvent.bind(this),
    );

    _buffer.listen(
      'lines',
      _.throttle(this.handleLinesEvent.bind(this), 20, { leading: true }),
    );

    _buffer.listen(
      'changedtick',
      _.throttle(this.handleChangedtickEvent.bind(this), 20, { leading: true }),
    );
  }

  // TODO: Actually save the document.
  async save(): Promise<boolean> {
    this._isDirty = false;
    return true;
  }

  offsetAt(_position: rback.Position): number {
    const position = this._validatePosition(_position);

    this._ensureLineStarts();
    return this._lineStarts!.getAccumulatedValue(position.line - 1)
      + position.character;
  }

  positionAt(offset: number): rback.Position {
    offset = Math.floor(offset);
    offset = Math.max(0, offset);

    this._ensureLineStarts();
    const out = this._lineStarts!.getIndexOf(offset);

    const lineLength =
      this._lines[out.index]
      && this._lines[out.index].text.length;

    // Ensure we return a valid position
    return new Position(out.index, Math.min(out.remainder, lineLength));
  }

  // TODO: use this range
  getText(_range?: Range): string {
    return this._lines.map(l => l.text).join(this._eol);
  }

  getWordRangeAtPosition(position: rback.Position, regex?: RegExp): rback.Range | undefined {
    return this._getWordRangeAtPosition(position, regex);
  }

  validateRange(range: Range): rback.Range {
    return this._validateRange(range);
  }

  validatePosition(position: Position): rback.Position {
    return this._validatePosition(position);
  }

  lineAt(line: number): rback.TextLine;
  lineAt(position: rback.Position): rback.TextLine;
  lineAt(lineOrPosition: number | rback.Position): rback.TextLine {
    let line: number;

    if (typeof lineOrPosition === 'number') {
      line = lineOrPosition;
    } else {
      line = lineOrPosition.line;
    }

    if (line < 0 || line >= this._lines.length) {
      throw new Error('Illegal value for `line`');
    }

    return this._lines[line];
  }

  // -- nvim buffer event listeners

  private handleDetachEvent(_buffer: NeovimBuffer) {
    this._isClosed = true;
  }

  private handleChangedtickEvent(
    buffer: NeovimBuffer,
    tick: number,
  ) {
    logger.debug('changed tick', buffer.id, tick);
  }

  private async handleLinesEvent(
    buffer: NeovimBuffer,
    _tick: number,
    _firstline: number,
    _lastline: number,
    _linedata: string[],
) {
    this._version += 1;
    // FIXME: This is actually a wrong approach because if file is
    // undoed after change is could be back to clean state again.
    this._isDirty = true;

    const lines = await buffer.lines;
    this._lines = lines.map((l: string, idx: number): rback.TextLine => {
      const range = new Range(idx, 0, idx, l.length);
      const firstNonWhitespaceCharacterIndex = (/^(\s*)/.exec(l) || ['', []])[1].length;

      return {
        range,
        firstNonWhitespaceCharacterIndex,
        text: l,
        lineNumber: idx,
        isEmptyOrWhitespace: firstNonWhitespaceCharacterIndex === l.length,
        rangeIncludingLineBreak: idx < this._lines.length - 1
          ? new Range(idx, 0, idx + 1, 0)
          : range,
      };
    });

    logger.info(this._lines);
  }

  // -- range math

  protected _ensureLineStarts(): void {
    if (!this._lineStarts) {
      const eolLength = this._eol.length;
      const linesLength = this._lines.length;
      const lineStartValues = new Uint32Array(linesLength);

      // tslint:disable-next-line:no-increment-decrement
      for (let i = 0; i < linesLength; i++) {
        lineStartValues[i] = this._lines[i].text.length + eolLength;
      }
      this._lineStarts = new PrefixSumComputer(lineStartValues);
    }
  }

  private _validateRange(range: rback.Range): rback.Range {
    if (!(range instanceof Range)) {
      throw new Error('Invalid argument');
    }

    const start = this._validatePosition(range.start);
    const end = this._validatePosition(range.end);

    if (start === range.start && end === range.end) {
      return range;
    }
    return new Range(start.line, start.character, end.line, end.character);
  }

  private _validatePosition(position: rback.Position): rback.Position {
    if (!(position instanceof Position)) {
      throw new Error('Invalid argument');
    }

    let { line, character } = position;
    let hasChanged = false;

    if (line < 0) {
      line = 0;
      character = 0;
      hasChanged = true;

    } else if (line >= this._lines.length) {
      line = this._lines.length - 1;
      character = this._lines[line].text.length;
      hasChanged = true;

    } else {
      const maxCharacter = this._lines[line].text.length;
      if (character < 0) {
        character = 0;
        hasChanged = true;

      } else if (character > maxCharacter) {
        character = maxCharacter;
        hasChanged = true;
      }
    }

    if (!hasChanged) {
      return position;
    }

    return new Position(line, character);
  }

  private _getWordRangeAtPosition(
    _position: rback.Position,
    regexp?: RegExp,
  ): rback.Range | undefined {
    const position = this._validatePosition(_position);

    if (!regexp) {
      // use default when custom-regexp isn't provided
      // tslint:disable-next-line:no-parameter-reassignment
      regexp = getWordDefinitionFor(this._languageId);

    } else if (regExpLeadsToEndlessLoop(regexp)) {
      // use default when custom-regexp is bad
      console.warn(
        `[getWordRangeAtPosition]: ignoring custom regexp '${regexp.source}'`
        + 'because it matches the empty string.',
      );

      // tslint:disable-next-line:no-parameter-reassignment
      regexp = getWordDefinitionFor(this._languageId);
    }

    const wordAtText = getWordAtText(
      position.character + 1,
      ensureValidWordDefinition(regexp),
      this._lines[position.line].text,
      0,
    );

    if (wordAtText) {
      return new Range(
        position.line,
        wordAtText.startColumn - 1,
        position.line,
        wordAtText.endColumn - 1,
      );
    }

    return undefined;
  }
}
