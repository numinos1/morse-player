export class Schedule {
    constructor(player) {
        this.queue = [];
        this.event = null;
        this.time = 0;
        this.ending = 0;
        this.duration = 0.1;
        this.player = player;
    }
    reset() {
        const next = this.queue[0];
        this.queue = [];
        this.event = null;
        this.time = 0;
        this.ending = 0;
        return next;
    }
    canPush(time) {
        this.time = time;
        if (!this.ending) {
            this.ending = time + 0.1;
        }
        return (this.ending < (this.time + this.duration));
    }
    push(entry, cb) {
        const startTime = this.ending;
        this.ending = cb
            ? cb(this.ending)
            : this.ending;
        this.queue.push(Object.assign(Object.assign({}, entry), { startTime: startTime, endTime: this.ending }));
        return this.ending;
    }
    advance() {
        while (this._endCurrentEvent()
            || this._startNextEvent()) { }
        return !!(this.queue.length || this.event);
    }
    _endCurrentEvent() {
        if (this.event
            && this.event.endTime <= this.time) {
            if (this.event.name === 'play') {
                this.player.emit('char:end', this.event);
            }
            this.event = null;
            return true;
        }
        return false;
    }
    _startNextEvent() {
        if (this.queue.length
            && this.queue[0].startTime <= this.time) {
            this.event = this.queue.shift();
            (this.event.name === 'play')
                ? this.player.emit('char:start', this.event)
                : this.player.setOptions(this.event.value, true);
            return true;
        }
        return false;
    }
}
