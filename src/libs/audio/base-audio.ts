/**
 * Audio Options
 **/
export interface TAudioOptions {
  q: number;
  freq: number;
  gain: number;
  volume: number;
}

/**
 * Abstract Audio Class
 **/
export abstract class BaseAudio {

  constructor(opts: TAudioOptions) {}

  setAudio(opts: TAudioOptions, time?: number) {}

  setPause(isPause: boolean) {}

  getTime() {}

  playTone(time: number, duration: number) {}

  cancelPlay() {}
}