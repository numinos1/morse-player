import vocabulary from '../resources/vocabulary';
import { Script } from './script';
import { Options } from './options';
import { Schedule } from './schedule';
import { Emitter } from './emitter';
import { WebAudio } from './audio/web-audio';
import { MockAudio } from './audio/mock-audio';
import { TAudioOptions } from './audio/base-audio';
import { toNumber } from './utils';

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

const DOT_SIZE = 1; // used for dot and tone space
const DASH_SIZE = 3; // used for dash and char space
const SPACE_SIZE = 4; // actually 7 (subtract 3 for trailing char space)

const SIZES = { 
  '.': DOT_SIZE, 
  '-': DASH_SIZE,
  ' ': SPACE_SIZE 
};

const DEFAULT_OPTIONS = {
  volume: 0.7,
  gain: 0.5,
  freq: 600,
  q: 10,

  wpm: 25,
  eff: 25,

  color: '#fff'
};

/**
 * CW Player
 **/
export class Player extends Emitter {
  options: Options;
  schedule: Schedule;
  id: string;
  mode: string;
  audio: WebAudio | MockAudio;
  script: Script;
  tickRef: number | NodeJS.Timeout;
  tickSpan: number;
  isPlaying: boolean;
  isPaused: boolean;
  dotTime: number;
  spaceTime: number;
  gapTime: number;

  constructor(defaultOptions?: Partial<TPlayerOptions>, mode = 'web') {
    super();
    
    this.options = new Options({
      ...DEFAULT_OPTIONS,
      ...defaultOptions
    });

    this.schedule = new Schedule(this);
    this._onTick = this._onTick.bind(this);

    this.id = '';
    this.mode = mode;
    this.audio = null;
    this.script = null;

    this.tickRef = null;
    this.tickSpan = 0.16;

    this.isPlaying = false;
    this.isPaused = false;

    this.dotTime = 0;
    this.spaceTime = 0;
    this.gapTime = 0;

    this._setOptions(
      this.options.get()
    );
  }

  getOptions() {
    return this.options.get();
  }

  setOptions(
    options: Record<string, any>,
    isScript: boolean = false
  ) {
    const newOptions = this._setOptions(isScript
      ? this.options.setScript(options, true)
      : this.options.setUser(options)
    );
    this.emit('options', newOptions);
  }

  _setOptions(options: Record<string, any>) {
    const { combined } = options;
    const wpm = toNumber(combined.wpm) || 20;
    let eff = toNumber(combined.eff) || 20;
    
    //if (eff < wpm) eff = wpm;
    
    const effDotLen = (1.2 / eff) 
      * (2.5 - 1.5 / (Math.pow((wpm / eff), 1.25)));

    this.audio && this.audio.setAudio(combined);

    if (this.mode === 'mock') {
      this.dotTime = 0.01;
      this.spaceTime = 0.01
      this.gapTime = 0.01;
    }
    else {
      this.dotTime = 1.2 / wpm;
      this.spaceTime = SPACE_SIZE * effDotLen;
      this.gapTime = DASH_SIZE * effDotLen;
    }
    return options;
  }

  // Provide a way to init audio without playing
  // (Must trigger during a button event)
  init() {
    if (!this.audio) {
      this.audio = this._initAudio(
        this.options.get() as TAudioOptions // Typescript Hack!!!!
      );
    }
  }

  // NOTE: Must init audio within a click event
  play(
    text: string | Function,
    options?: Record<string, any>
  ) {
    this.stop();

    if (options) {
      this._setOptions(
        this.options.setScript(options)
      );
    }
    this.script = new Script(text);

    if (!this.audio) {
      this.audio = this._initAudio(
        this.options.get() as TAudioOptions // Typescript Hack!!!
      );
    }
    this.isPlaying = true;
    this.emit('play:start', this.options.get());
    this._onTick();
  }

  _initAudio(opts: TAudioOptions) {
    switch (this.mode) {
      case 'web': return new WebAudio(opts);
      case 'server': return new WebAudio(opts);
      case 'mock': return new MockAudio(opts);
      default: throw new Error('invlaid audio driver');
    }
  }

  _playChar(event: Record<string, any>, time: number) {
    return (vocabulary[event.value] || '')
      .split('')
      .map((char: string) => SIZES[char])
      .reduce((time: number, size: number, index: number) =>
        this._playTone(size, time + (index ? this.dotTime : 0)),
        time
      );
  }

  _playTone(size: number, time: number) {
    return (size <= DASH_SIZE)
      ? this.audio.playTone(time, size * this.dotTime)
      : time + this.gapTime;
  }

  _onTick() {
    const currentTime = this.audio.getTime();
    let event;

    // Fill schedule for next period
    while (this.schedule.canPush(currentTime)
      && (event = this.script.getNext(true)))
    {
      (event.name === 'set')
        ? this.schedule.push(event)
        : this.schedule.push(event, (time: number) => 
            this._playChar(event, time) + this.gapTime
          );
    }
    // Re-schedule tick if pending work
    if (this.schedule.advance()
      || this.script.getNext())
    {
      this.tickRef = this.mode === 'web'
        ? window.requestAnimationFrame(this._onTick)
        : setTimeout(this._onTick, this.tickSpan);
    }
    else {
      this.stop();
    }
  }

  _stopTick() {
    if (this.tickRef) {
      this.mode === 'web'
        ? window.cancelAnimationFrame(this.tickRef as number)
        : clearTimeout(this.tickRef);
      this.audio.cancelPlay();
      this.script.rollback(
        this.schedule.reset()
      );
      this.tickRef = null;
    }
  }

  stop() {
    if (this.isPlaying) {
      this._stopTick();
      this.isPlaying = false;
      this.isPaused = false;
      this.script = null;
      this.options.setScript();
      this.emit('play:stop', this.id);
    }
  }

  pause() {
    if (this.isPlaying) {
      if (this.isPaused) {
        this.isPaused = false;
        this.emit('play:resume', this.id);
        this._onTick();
      } 
      else {
        this.isPaused = true;
        this._stopTick();
        this.emit('play:pause', this.id);
      }
    }
  }

  replay() {
    if (this.script?.input) {
      this.play(this.script.input);
    }
  }

  rewind(wordCount = 1) {
    if (this.script && this.audio) {
      this.script.rewind(wordCount);
      this.schedule.reset();
      this.emit('play:rewind', this.id);

      if (!this.tickRef) {
        this._onTick();
      }
    }
  }
}
