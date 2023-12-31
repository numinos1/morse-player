import { BaseAudio } from './base-audio';
import { backoff, toNumber } from '../utils';
export class WebAudio extends BaseAudio {
    constructor(opts) {
        super(opts);
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.gainNode = this.audioCtx.createGain();
        this.gainNodePlay = this.audioCtx.createGain();
        this.gainNodeLimiter = this.audioCtx.createGain();
        this.oscillator = this.audioCtx.createOscillator();
        this.biquadFilter = this.audioCtx.createBiquadFilter();
        this.noiseFilterL = this.audioCtx.createBiquadFilter();
        this.noiseFilterH = this.audioCtx.createBiquadFilter();
        this.whiteNoise = this.audioCtx.createBufferSource();
        this.noiseFilterL.type = "lowpass";
        this.noiseFilterL.frequency.setValueAtTime(400, this.audioCtx.currentTime);
        this.noiseFilterL.Q.setValueAtTime(20, this.audioCtx.currentTime);
        this.noiseFilterH.type = "highpass";
        this.noiseFilterH.frequency.setValueAtTime(700, this.audioCtx.currentTime);
        this.noiseFilterH.Q.setValueAtTime(20, this.audioCtx.currentTime);
        const bufferSize = 2 * this.audioCtx.sampleRate;
        const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const noise = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            noise[i] = Math.random() * 0.5 - 1;
        }
        this.whiteNoise.buffer = noiseBuffer;
        this.whiteNoise.loop = true;
        this.whiteNoise.connect(this.noiseFilterL);
        this.noiseFilterL.connect(this.noiseFilterH);
        this.noiseFilterH.connect(this.audioCtx.destination);
        this.biquadFilter.type = "lowpass";
        this.biquadFilter.frequency.setValueAtTime(500, this.audioCtx.currentTime);
        this.biquadFilter.Q.setValueAtTime(10, this.audioCtx.currentTime);
        this.oscillator.type = 'sine';
        this.oscillator.frequency.setValueAtTime(600, this.audioCtx.currentTime);
        this.oscillator.connect(this.gainNode);
        this.gainNode.connect(this.gainNodeLimiter);
        this.gainNodeLimiter.connect(this.biquadFilter);
        this.gainNodeLimiter.connect(this.biquadFilter);
        this.biquadFilter.connect(this.gainNodePlay);
        this.gainNodePlay.connect(this.audioCtx.destination);
        this.gain = 0.5;
        this.gainNode.gain.value = 0;
        this.gainNodePlay.gain.value = 1;
        this.gainNodeLimiter.gain.value = 0.55;
        this.oscillator.start();
    }
    setAudio(opts, time = this.audioCtx.currentTime) {
        if (opts.gain !== undefined) {
            const gain = toNumber(opts.gain);
            if (!isNaN(gain)) {
                this.gain = gain;
            }
        }
        if (opts.freq !== undefined) {
            const freq = toNumber(opts.freq);
            if (!isNaN(freq)) {
                this.oscillator.frequency.setValueAtTime(freq, time);
                this.biquadFilter.frequency.setValueAtTime(freq, time);
            }
        }
        if (opts.q !== undefined) {
            const q = toNumber(opts.q);
            if (!isNaN(q)) {
                const value = 1.8 * Math.exp(-0.115 * q);
                this.biquadFilter.Q.setValueAtTime(q, time);
                this.gainNodeLimiter.gain.setValueAtTime(value, time);
            }
        }
        if (opts.volume !== undefined) {
            const volume = toNumber(opts.volume);
            if (!isNaN(volume)) {
                this.gainNodePlay.gain.setValueAtTime(volume, time);
            }
        }
    }
    setPause(isPause) {
        isPause
            ? this.audioCtx.suspend()
            : this.audioCtx.resume();
    }
    getTime() {
        return this.audioCtx.currentTime;
    }
    playTone(time, duration) {
        this.gainNode.gain.setValueAtTime(this.gain, time);
        this.gainNode.gain.setValueAtTime(0, time += duration);
        return time;
    }
    cancelPlay() {
        const nowTime = this.getTime();
        const volume = this.gainNode.gain.value;
        this.gainNode.gain.cancelScheduledValues(0);
        if (volume) {
            this.gainNode.gain.setValueCurveAtTime(backoff(volume, 0), nowTime, 0.1);
        }
    }
}
