import { BaseAudio, TAudioOptions } from './base-audio';

/**
 * Mock Audio Driver
 **/
export class MockAudio extends BaseAudio {
  opts: TAudioOptions;
  time: number;

  constructor(opts: TAudioOptions) {
    super(opts);

    this.opts = opts;
    this.time = 0;
  }

  setAudio(opts: TAudioOptions, time?: number) {
    this.opts = opts;
  }

  setPause(isPause: boolean) {
  }

  getTime() {
    return (this.time += 0.1);
  }

  playTone(time: number, duration: number) {
    return time + duration;
  }

  cancelPlay() {
  }
}
