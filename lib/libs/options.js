export class Options {
    constructor(opts) {
        this.defaults = opts ? this._prune(opts) : {};
        this.user = {};
        this.script = {};
        this.options = this.reduce();
    }
    setUser(opts) {
        this.user = this._prune(Object.assign(Object.assign({}, this.user), opts));
        this.options = this.reduce();
        return this.options;
    }
    setScript(opts = {}, isCombine = false) {
        this.script = isCombine
            ? this._prune(Object.assign(Object.assign({}, this.script), opts))
            : this._prune(opts);
        this.options = this.reduce();
        return this.options;
    }
    get() {
        return this.options;
    }
    reduce() {
        return {
            defaults: this.defaults,
            user: this.user,
            script: this.script,
            combined: this.script.force
                ? Object.assign(Object.assign(Object.assign({}, this.defaults), this.user), this.script) : Object.assign(Object.assign(Object.assign({}, this.defaults), this.script), this.user)
        };
    }
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
