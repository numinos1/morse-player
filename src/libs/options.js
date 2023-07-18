/**
 * Player Options
 **/
export class Options {

  /**
   * Constructor
   **/
  constructor(opts) {
    this.defaults = opts ? this._prune(opts) : {};
    this.user = {};
    this.script = {};
    this.options = this.reduce();
  }

  /**
   * Set User Options 
   * - Incremental updates
   * - Prune undefined & null values
   **/
  setUser(opts) {
    this.user = this._prune({
      ...this.user,
      ...opts
    });
    this.options = this.reduce();

    return this.options;
  }

  /**
   * Set Script Options 
   * - Clobber or incremental updates
   * - Prune undefined & null values
   **/
  setScript(opts = {}, isCombine = false) {
    this.script = isCombine
      ? this._prune({ ...this.script, ...opts })
      : this._prune(opts);

    this.options = this.reduce();

    return this.options;
  }

  /**
   * Get All Options
   **/
  get() {
    return this.options;
  }

  /**
   * Combine all Options
   **/
  reduce() {
    return {
      defaults: this.defaults,
      user: this.user,
      script: this.script,
      combined: this.script.force
        ? {
          ...this.defaults,
          ...this.user,
          ...this.script
          }
        : {
          ...this.defaults,
          ...this.script,
          ...this.user
        }
    };
  }

  /**
   * Prune Undefined Options
   **/
  _prune(obj) {
    return Object.entries(obj)
      .reduce((out, [key, val]) => {
        if (val !== undefined && val !== null) {
          out[key] = val;
        }
        return out;
      }, {});
  }
}