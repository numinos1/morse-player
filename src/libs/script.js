import { render } from './render';

/**
 * CW Script Class
 **/
export class Script {

  /**
   * Constructor
   **/
  constructor(input) {
    this.input = input;

    this.cbMethod = null; 
    this.cbCount = 0;

    if (typeof input === 'function') {
      this.cbMethod = input;
      input = this.cbMethod(this.cbCount++);
    }
    this.buffer = render(input);
    this.index = 0;

    this.playTotal = this._getPlayTotal();
    this.playCount = this._getPlayCount();
  }

  /**
   * Count total play entries
   **/
  _getPlayTotal() {
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
  _getPlayCount() {
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
  getNext(advance = false) {
    if (this.index === this.buffer.length) {
      this._fetchMore();
    }
    if (this.index < this.buffer.length) {
      const value = this.buffer[this.index];
      const isPlay = typeof value === 'string';
      const endCount = this.playCount + (isPlay ? 1 : 0);

      const entry = { 
        index: this.index, 
        startPercent: this.playTotal
          ? (this.playCount / this.playTotal) * 100
          : 0,
        endPercent: this.playTotal
          ? (endCount / this.playTotal) * 100
          : 0,
        name: isPlay ? 'play' : 'set', 
        value 
      };

      if (advance) {
        this.playCount = endCount;
        this.index++;
      }
      return entry;
    }
  }

  /**
   * Rollback the buffer to an entry
   **/
  rollback(entry) {
    if (entry && entry.index < this.index) {
      this.index = entry.index;
    }
    this.playCount = this._getPlayCount();
  }

  /**
   * Rewind by number of words
   **/ 
  rewind(words = 1) {
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
  _seekLastSpace(index) {
    while (index && this.buffer[index] !== ' ') {
      --index;
    }
    return index;
  }

  /**
   * Seek Next Word
   **/
  _seekNextWord(index) {
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
  _seekLastWord(index) {
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
