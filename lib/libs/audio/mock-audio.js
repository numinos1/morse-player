export class MockAudio {
    constructor(opts) {
        this.opts = opts;
        this.time = 0;
    }
    setAudio(opts, time) {
        this.opts = opts;
    }
    setPause(isPause) {
    }
    getTime() {
        return (this.time += 0.1);
    }
    playTone(time, duration) {
        return time + duration;
    }
    cancelPlay() {
    }
}
