// tslint:disable:no-parameter-reassignment

import { toUint32 } from './uint';

/**
 * Word inside a model.
 */
export interface IWordAtPosition {
  /**
   * The word.
   */
  readonly word: string;
  /**
   * The column where the word starts.
   */
  readonly startColumn: number;
  /**
   * The column where the word ends.
   */
  readonly endColumn: number;
}

export const USUAL_WORD_SEPARATORS = '`~!@#$%^&*()-=+[{]}\\|;:\'",.<>/?';

/**
 * Create a word definition regular expression based on default word separators.
 * Optionally provide allowed separators that should be included in words.
 *
 * The default would look like this:
 * /(-?\d*\.\d\w*)|([^\`\~\!\@\#\$\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g
 */
function createWordRegExp(allowInWords: string = ''): RegExp {
  let source = '(-?\\d*\\.\\d\\w*)|([^';
  for (const sep of USUAL_WORD_SEPARATORS) {
    if (allowInWords.indexOf(sep) >= 0) {
      continue;
    }
    source += `\\${sep}`;
  }
  source += '\\s]+)';
  return new RegExp(source, 'g');
}

// catches numbers (including floating numbers) in the first group, and alphanum in the second
export const DEFAULT_WORD_REGEXP = createWordRegExp();

export function ensureValidWordDefinition(wordDefinition?: RegExp | null): RegExp {
  let result: RegExp = DEFAULT_WORD_REGEXP;

  if (wordDefinition && (wordDefinition instanceof RegExp)) {
    if (!wordDefinition.global) {
      let flags = 'g';
      if (wordDefinition.ignoreCase) {
        flags += 'i';
      }
      if (wordDefinition.multiline) {
        flags += 'm';
      }
      if ((wordDefinition as any).unicode) {
        flags += 'u';
      }
      result = new RegExp(wordDefinition.source, flags);
    } else {
      result = wordDefinition;
    }
  }

  result.lastIndex = 0;

  return result;
}

function getWordAtPosFast(
  column: number,
  wordDefinition: RegExp,
  text: string,
  textOffset: number,
): IWordAtPosition | null {
  // find whitespace enclosed text around column and match from there

  const pos = column - 1 - textOffset;
  const start = text.lastIndexOf(' ', pos - 1) + 1;

  wordDefinition.lastIndex = start;
  let match: RegExpMatchArray | null;
  while (match = wordDefinition.exec(text)) {
    const matchIndex = match.index || 0;
    if (matchIndex <= pos && wordDefinition.lastIndex >= pos) {
      return {
        word: match[0],
        startColumn: textOffset + 1 + matchIndex,
        endColumn: textOffset + 1 + wordDefinition.lastIndex,
      };
    }
  }

  return null;
}

function getWordAtPosSlow(
  column: number,
  wordDefinition: RegExp,
  text: string,
  textOffset: number,
): IWordAtPosition | null {
  // matches all words starting at the beginning
  // of the input until it finds a match that encloses
  // the desired column. slow but correct

  const pos = column - 1 - textOffset;
  wordDefinition.lastIndex = 0;

  let match: RegExpMatchArray | null;
  while (match = wordDefinition.exec(text)) {
    const matchIndex = match.index || 0;
    if (matchIndex > pos) {
      // |nW -> matched only after the pos
      return null;

    }
    if (wordDefinition.lastIndex >= pos) {
      // W|W -> match encloses pos
      return {
        word: match[0],
        startColumn: textOffset + 1 + matchIndex,
        endColumn: textOffset + 1 + wordDefinition.lastIndex,
      };
    }
  }

  return null;
}

export function getWordAtText(
  column: number,
  wordDefinition: RegExp,
  text: string,
  textOffset: number,
): IWordAtPosition | null {

  // if `words` can contain whitespace character we have to use the slow variant
  // otherwise we use the fast variant of finding a word
  wordDefinition.lastIndex = 0;
  const match = wordDefinition.exec(text);
  if (!match) {
    return null;
  }
  // todo@joh the `match` could already be the (first) word
  const ret = match[0].indexOf(' ') >= 0
    // did match a word which contains a space character -> use slow word find
    ? getWordAtPosSlow(column, wordDefinition, text, textOffset)
    // sane word definition -> use fast word find
    : getWordAtPosFast(column, wordDefinition, text, textOffset);

  // both (getWordAtPosFast and getWordAtPosSlow) leave the wordDefinition-RegExp
  // in an undefined state and to not confuse other users of the wordDefinition
  // we reset the lastIndex
  wordDefinition.lastIndex = 0;

  return ret;
}

export class PrefixSumIndexOfResult {
  _prefixSumIndexOfResultBrand: void;

  index: number;
  remainder: number;

  constructor(index: number, remainder: number) {
    this.index = index;
    this.remainder = remainder;
  }
}

export class PrefixSumComputer {

  /**
   * values[i] is the value at index i
   */
  private values: Uint32Array;

  /**
   * prefixSum[i] = SUM(heights[j]), 0 <= j <= i
   */
  private prefixSum: Uint32Array;

  /**
   * prefixSum[i], 0 <= i <= prefixSumValidIndex can be trusted
   */
  private prefixSumValidIndex: Int32Array;

  constructor(values: Uint32Array) {
    this.values = values;
    this.prefixSum = new Uint32Array(values.length);
    this.prefixSumValidIndex = new Int32Array(1);
    this.prefixSumValidIndex[0] = -1;
  }

  public getCount(): number {
    return this.values.length;
  }

  public insertValues(insertIndex: number, insertValues: Uint32Array): boolean {
    insertIndex = toUint32(insertIndex);
    const oldValues = this.values;
    const oldPrefixSum = this.prefixSum;
    const insertValuesLen = insertValues.length;

    if (insertValuesLen === 0) {
      return false;
    }

    this.values = new Uint32Array(oldValues.length + insertValuesLen);
    this.values.set(oldValues.subarray(0, insertIndex), 0);
    this.values.set(oldValues.subarray(insertIndex), insertIndex + insertValuesLen);
    this.values.set(insertValues, insertIndex);

    if (insertIndex - 1 < this.prefixSumValidIndex[0]) {
      this.prefixSumValidIndex[0] = insertIndex - 1;
    }

    this.prefixSum = new Uint32Array(this.values.length);
    if (this.prefixSumValidIndex[0] >= 0) {
      this.prefixSum.set(oldPrefixSum.subarray(0, this.prefixSumValidIndex[0] + 1));
    }
    return true;
  }

  public changeValue(index: number, value: number): boolean {
    index = toUint32(index);
    value = toUint32(value);

    if (this.values[index] === value) {
      return false;
    }
    this.values[index] = value;
    if (index - 1 < this.prefixSumValidIndex[0]) {
      this.prefixSumValidIndex[0] = index - 1;
    }
    return true;
  }

  public removeValues(startIndex: number, cnt: number): boolean {
    startIndex = toUint32(startIndex);
    cnt = toUint32(cnt);

    const oldValues = this.values;
    const oldPrefixSum = this.prefixSum;

    if (startIndex >= oldValues.length) {
      return false;
    }

    const maxCnt = oldValues.length - startIndex;
    if (cnt >= maxCnt) {
      cnt = maxCnt;
    }

    if (cnt === 0) {
      return false;
    }

    this.values = new Uint32Array(oldValues.length - cnt);
    this.values.set(oldValues.subarray(0, startIndex), 0);
    this.values.set(oldValues.subarray(startIndex + cnt), startIndex);

    this.prefixSum = new Uint32Array(this.values.length);
    if (startIndex - 1 < this.prefixSumValidIndex[0]) {
      this.prefixSumValidIndex[0] = startIndex - 1;
    }
    if (this.prefixSumValidIndex[0] >= 0) {
      this.prefixSum.set(oldPrefixSum.subarray(0, this.prefixSumValidIndex[0] + 1));
    }
    return true;
  }

  public getTotalValue(): number {
    if (this.values.length === 0) {
      return 0;
    }
    return this._getAccumulatedValue(this.values.length - 1);
  }

  public getAccumulatedValue(index: number): number {
    if (index < 0) {
      return 0;
    }

    index = toUint32(index);
    return this._getAccumulatedValue(index);
  }

  private _getAccumulatedValue(index: number): number {
    if (index <= this.prefixSumValidIndex[0]) {
      return this.prefixSum[index];
    }

    let startIndex = this.prefixSumValidIndex[0] + 1;
    if (startIndex === 0) {
      this.prefixSum[0] = this.values[0];
      // tslint:disable-next-line:no-increment-decrement
      startIndex++;
    }

    if (index >= this.values.length) {
      index = this.values.length - 1;
    }

    // tslint:disable-next-line:no-increment-decrement
    for (let i = startIndex; i <= index; i++) {
      this.prefixSum[i] = this.prefixSum[i - 1] + this.values[i];
    }
    this.prefixSumValidIndex[0] = Math.max(this.prefixSumValidIndex[0], index);
    return this.prefixSum[index];
  }

  public getIndexOf(accumulatedValue: number): PrefixSumIndexOfResult {
    accumulatedValue = Math.floor(accumulatedValue); // @perf

    // Compute all sums (to get a fully valid prefixSum)
    this.getTotalValue();

    let low = 0;
    let high = this.values.length - 1;
    let mid = 0;
    let midStop = 0;
    let midStart = 0;

    while (low <= high) {
      mid = low + ((high - low) / 2) | 0;

      midStop = this.prefixSum[mid];
      midStart = midStop - this.values[mid];

      if (accumulatedValue < midStart) {
        high = mid - 1;
      } else if (accumulatedValue >= midStop) {
        low = mid + 1;
      } else {
        break;
      }
    }

    return new PrefixSumIndexOfResult(mid, accumulatedValue - midStart);
  }
}

export class PrefixSumComputerWithCache {

  private readonly _actual: PrefixSumComputer;
  private _cacheAccumulatedValueStart: number = 0;
  private _cache: PrefixSumIndexOfResult[] | null = null;

  constructor(values: Uint32Array) {
    this._actual = new PrefixSumComputer(values);
    this._bustCache();
  }

  private _bustCache(): void {
    this._cacheAccumulatedValueStart = 0;
    this._cache = null;
  }

  public insertValues(insertIndex: number, insertValues: Uint32Array): void {
    if (this._actual.insertValues(insertIndex, insertValues)) {
      this._bustCache();
    }
  }

  public changeValue(index: number, value: number): void {
    if (this._actual.changeValue(index, value)) {
      this._bustCache();
    }
  }

  public removeValues(startIndex: number, cnt: number): void {
    if (this._actual.removeValues(startIndex, cnt)) {
      this._bustCache();
    }
  }

  public getTotalValue(): number {
    return this._actual.getTotalValue();
  }

  public getAccumulatedValue(index: number): number {
    return this._actual.getAccumulatedValue(index);
  }

  public getIndexOf(accumulatedValue: number): PrefixSumIndexOfResult {
    accumulatedValue = Math.floor(accumulatedValue); // @perf

    if (this._cache !== null) {
      const cacheIndex = accumulatedValue - this._cacheAccumulatedValueStart;
      if (cacheIndex >= 0 && cacheIndex < this._cache.length) {
        // Cache hit!
        return this._cache[cacheIndex];
      }
    }

    // Cache miss!
    return this._actual.getIndexOf(accumulatedValue);
  }

  /**
   * Gives a hint that a lot of requests are about to come in for these accumulated values.
   */
  public warmUpCache(accumulatedValueStart: number, accumulatedValueEnd: number): void {
    const newCache: PrefixSumIndexOfResult[] = [];
    for (
      let accumulatedValue =
      accumulatedValueStart; accumulatedValue
      // tslint:disable-next-line:no-increment-decrement
      <= accumulatedValueEnd; accumulatedValue++
    ) {
      newCache[accumulatedValue - accumulatedValueStart] = this.getIndexOf(accumulatedValue);
    }
    this._cache = newCache;
    this._cacheAccumulatedValueStart = accumulatedValueStart;
  }
}
