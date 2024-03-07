export class Schedule {
    constructor(player) {
        this.queue = [];
        this.event = null;
        this.headTime = 0;
        this.tailTime = 0;
        this.queueSize = 1;
        this.player = player;
    }
    reset() {
        const next = this.queue[0];
        this.queue = [];
        this.event = null;
        this.headTime = 0;
        this.tailTime = 0;
        return next;
    }
    canPush(currentTime) {
        this.headTime = currentTime;
        if (!this.tailTime) {
            this.tailTime = currentTime;
        }
        return (this.tailTime < (this.headTime + this.queueSize));
    }
    push(entry) {
        this.queue.push(entry);
        this.tailTime = entry.endTime;
    }
    advance() {
        while (this._endCurrentEvent()
            || this._startNextEvent()) { }
        return !!(this.queue.length || this.event);
    }
    _endCurrentEvent() {
        if (this.event
            && this.event.endTime <= this.headTime) {
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
            && this.queue[0].startTime <= this.headTime) {
            this.event = this.queue.shift();
            if (this.event.name === 'play') {
                this.player.emit('char:start', this.event);
            }
            else {
                this.player.setOptions(typeof this.event.value === 'object'
                    ? this.event.value
                    : {}, true);
            }
            return true;
        }
        return false;
    }
}
