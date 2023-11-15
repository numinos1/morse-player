import vocabulary from '../resources/vocabulary';
import { Script } from './script';
import { Options } from './options';
import { Schedule } from './schedule';
import { Emitter } from './emitter';
import { WebAudio } from './audio/web-audio';
import { MockAudio } from './audio/mock-audio';
import { toNumber } from './utils';
const DOT_SIZE = 1;
const DASH_SIZE = 3;
const SPACE_SIZE = 4;
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
export class Player extends Emitter {
    constructor(defaultOptions, mode = 'web') {
        super();
        this.options = new Options(Object.assign(Object.assign({}, DEFAULT_OPTIONS), defaultOptions));
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
        this._setOptions(this.options.get());
    }
    getOptions() {
        return this.options.get();
    }
    setOptions(options, isScript = false) {
        const newOptions = this._setOptions(isScript
            ? this.options.setScript(options, true)
            : this.options.setUser(options));
        this.emit('options', newOptions);
    }
    _setOptions(options) {
        const { combined } = options;
        const wpm = toNumber(combined.wpm) || 20;
        let eff = toNumber(combined.eff) || 20;
        const effDotLen = (1.2 / eff)
            * (2.5 - 1.5 / (Math.pow((wpm / eff), 1.25)));
        this.audio && this.audio.setAudio(combined);
        if (this.mode === 'mock') {
            this.dotTime = 0.01;
            this.spaceTime = 0.01;
            this.gapTime = 0.01;
        }
        else {
            this.dotTime = 1.2 / wpm;
            this.spaceTime = SPACE_SIZE * effDotLen;
            this.gapTime = DASH_SIZE * effDotLen;
        }
        return options;
    }
    init() {
        if (!this.audio) {
            this.audio = this._initAudio(this.options.get());
        }
    }
    play(input, options) {
        this.stop();
        if (options) {
            this._setOptions(this.options.setScript(options));
        }
        this.script = new Script(input);
        if (!this.audio) {
            this.audio = this._initAudio(this.options.get());
        }
        this.isPlaying = true;
        this.emit('play:start', this.options.get());
        this._onTick();
    }
    _initAudio(opts) {
        switch (this.mode) {
            case 'web': return new WebAudio(opts);
            case 'server': return new WebAudio(opts);
            case 'mock': return new MockAudio(opts);
            default: throw new Error('invlaid audio driver');
        }
    }
    _playChar(event, time) {
        return (vocabulary[event.value] || '')
            .split('')
            .map((char) => SIZES[char])
            .reduce((time, size, index) => this._playTone(size, time + (index ? this.dotTime : 0)), time);
    }
    _playTone(size, time) {
        return (size <= DASH_SIZE)
            ? this.audio.playTone(time, size * this.dotTime)
            : time + this.gapTime;
    }
    _onTick() {
        const currentTime = this.audio.getTime();
        let event;
        while (this.schedule.canPush(currentTime)
            && (event = this.script.getNext(true))) {
            (event.name === 'set')
                ? this.schedule.push(event)
                : this.schedule.push(event, (time) => this._playChar(event, time) + this.gapTime);
        }
        if (this.schedule.advance()
            || this.script.getNext()) {
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
                ? window.cancelAnimationFrame(this.tickRef)
                : clearTimeout(this.tickRef);
            this.audio.cancelPlay();
            this.script.rollback(this.schedule.reset());
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
        var _a;
        if ((_a = this.script) === null || _a === void 0 ? void 0 : _a.input) {
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
