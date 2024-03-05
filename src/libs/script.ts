import { render, TRenderResult } from './render';

/**
 * Script Value 
 * 
 * 1. String = Text to play
 * 2. Record = Comand to execute
 **/
export type TScriptValue = (string | Record<string, any>);

/**
 * Play Callback
 **/
export type TScriptPlay = (count: number, buffer?: TRenderResult) => string;

export interface TBufferEntry {
  index: number;
  charIndex: number;
  startPercent?: number;
  endPercent?: number;
  startTime?: number;
  endTime?: number;
  name: string;
  value: TScriptValue;
}

/**
 * CW Script Class
 **/
export class Script {
  input: string | TScriptPlay;
  cbMethod: TScriptPlay;
  cbCount: number;
  buffer: TRenderResult[];
  charIndices: number[];
  index: number;
  playTotal: number;
  playCount: number;

  /**
   * Constructor
   **/
  constructor(input: string | TScriptPlay) {
    this.input = input;

    this.cbMethod = null; 
    this.cbCount = 0;

    if (typeof input === 'function') {
      this.cbMethod = input;
      input = this.cbMethod(this.cbCount++);
    }
    this.buffer = render(input);
    this.charIndices = this._toCharIndices(this.buffer);
    this.index = 0;

    this.playTotal = this._getPlayTotal();
    this.playCount = this._getPlayCount();
  }

  /**
   * Map character Indices 
   * 
   * - Buffer offests don't account for actions
   * - First character offset starts at 1
   * - Actions have an offest of 0
   */
  _toCharIndices(buffer: TRenderResult[]) {
    let charIndex = 1;

    return buffer.map(entry =>
      (typeof entry === 'string' ? charIndex++ : 0),
      []
    );
  }

  /**
   * Count total play entries
   **/
  _getPlayTotal(): number {
    if (this.cbMethod) {
      return 0;
    }
    return this.buffer.reduce((count, value) =>
      typeof value === 'string' ? count + 1 : count,
      0
    );
  }

  /**
   * Count used play entries
   **/
  _getPlayCount(): number {
    if (!this.playTotal || !this.index) {
      return 0;
    }
    let count = 0;

    for (let i = 0; i < this.index; ++i) {
      const entry = this.buffer[i];

      if (typeof entry === 'string') {
        count++;
      }
    }
    return count;
  }

  /**
   * Get next buffer entry
   **/
  getNext(advance: boolean = false): TBufferEntry {
    if (this.index === this.buffer.length) {
      this._fetchMore();
    }
    if (this.index < this.buffer.length) {
      const value = this.buffer[this.index];
      const isPlay = typeof value === 'string';
      const endCount = this.playCount + (isPlay ? 1 : 0);

      const entry = { 
        index: this.index, 
        charIndex: this.charIndices[this.index],
        startPercent: this.playTotal
          ? (this.playCount / this.playTotal) * 100
          : 0,
        endPercent: this.playTotal
          ? (endCount / this.playTotal) * 100
          : 0,
        startTime: 0,
        endTime: 0,
        name: isPlay ? 'play' : 'set', 
        value 
      };

      if (advance) {
        this.playCount = endCount;
        this.index++;
      }
      return entry;
    }
    return undefined;
  }

  /**
   * Rollback the buffer to an entry
   **/
  rollback(entry: TBufferEntry) {
    if (entry && entry.index < this.index) {
      this.index = entry.index;
    }
    this.playCount = this._getPlayCount();
  }

  /**
   * Rewind by number of words
   **/ 
  rewind(words: number = 1) {
    let index = this._seekLastSpace(this.index);

    while (words-- && index) {
      index = this._seekLastWord(index);
      index = this._seekLastSpace(index);
    }
    this.index = index; //this._seekNextWord(index);
    this.playCount = this._getPlayCount();
  }

  /**
   * Seek Last Space
   **/
  _seekLastSpace(index: number): number {
    while (index && this.buffer[index] !== ' ') {
      --index;
    }
    return index;
  }

  /**
   * Seek Next Word
   **/
  _seekNextWord(index: number): number {
    while (index < this.buffer.length
      && this.buffer[index] === ' ')
    {
      ++index;
    }
    return index;
  }

  /**
   * Seek Last Word
   **/
  _seekLastWord(index: number): number {
    while (index && this.buffer[index] === ' ') {
      --index;
    }
    return index;
  }

  /**
   * Fetch more buffer text
   **/
  _fetchMore() {
    if (this.cbMethod) {
      const buffer = render(
        this.cbMethod(this.cbCount++, this.buffer)
      );
      if (buffer.length) {
        this.buffer = this.buffer.concat(buffer);
      }
      else {
        this.cbMethod = null;
      }
    }
  }
}
