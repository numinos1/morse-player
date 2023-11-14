import { BaseAudio } from './base-audio';
export class MockAudio extends BaseAudio {
    constructor(opts) {
        super(opts);
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
