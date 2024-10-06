/**
 * Player Options
 **/
export interface TPlayerOptions {
  volume: number;
  gain: number;
  freq: number;
  q: number;
  wpm: number;
  eff: number;
  color: string;
}

export interface TScriptOptions extends TPlayerOptions {
  force: boolean;
}

export interface TOptions {
  defaults: Partial<TPlayerOptions>;
  user: Partial<TPlayerOptions>;
  script: Partial<TScriptOptions>;
  combined: Partial<TPlayerOptions>;
}

export class Options {
  defaults: Partial<TPlayerOptions>;
  user: Partial<TPlayerOptions>;
  script: Partial<TScriptOptions>;
  options: TOptions;

  /**
   * Constructor
   **/
  constructor(opts: Partial<TPlayerOptions>) {
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
  setUser(opts: Partial<TPlayerOptions>) {
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
  setScript(
    opts: Partial<TScriptOptions> = {},
    isCombine: boolean = false
  ) {
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
  reduce(): TOptions {
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
  _prune<Type>(obj: any): Type {
    return Object.entries(obj)
      .reduce((out, [key, val]) => {
        if (val !== undefined && val !== null) {
          out[key] = val;
        }
        return out;
      }, {} as Type);
  }
}
