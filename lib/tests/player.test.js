var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { describe, expect, test } from '@jest/globals';
import { Player } from '../libs/player';
function playAudio(text) {
    return new Promise((resolve) => {
        const player = new Player({}, 'mock');
        const log = [];
        player.on('*', (name, value) => {
            log.push({ name, value });
            name === 'play:stop' && resolve(log);
        });
        player.play(text);
    });
}
describe('CW Player', () => {
    test('Class instantates', () => {
        expect(new Player()).toBeInstanceOf(Player);
    });
    test('Has default options', () => {
        expect(new Player().getOptions()).toEqual({
            combined: {
                color: '#fff',
                eff: 25,
                freq: 600,
                gain: 0.5,
                q: 10,
                volume: 0.7,
                wpm: 25
            },
            defaults: {
                color: '#fff',
                eff: 25,
                freq: 600,
                gain: 0.5,
                q: 10,
                volume: 0.7,
                wpm: 25
            },
            script: {},
            user: {}
        });
    });
    test('Set default options', () => {
        expect(new Player({
            color: '#000',
            eff: 15,
            freq: 550,
            gain: 0.4,
            q: 5,
            volume: 0.3,
            wpm: 30
        }).getOptions()).toEqual({
            combined: {
                color: '#000',
                eff: 15,
                freq: 550,
                gain: 0.4,
                q: 5,
                volume: 0.3,
                wpm: 30
            },
            defaults: {
                color: '#000',
                eff: 15,
                freq: 550,
                gain: 0.4,
                q: 5,
                volume: 0.3,
                wpm: 30
            },
            script: {},
            user: {}
        });
    });
    test('setOptions({ wpm: 40, eff: 35, freq: 650 })', () => {
        const player = new Player();
        player.setOptions({
            wpm: 40,
            eff: 35,
            freq: 650
        });
        expect(player.getOptions()).toEqual({
            combined: {
                color: '#fff',
                eff: 35,
                freq: 650,
                gain: 0.5,
                q: 10,
                volume: 0.7,
                wpm: 40
            },
            defaults: {
                color: '#fff',
                eff: 25,
                freq: 600,
                gain: 0.5,
                q: 10,
                volume: 0.7,
                wpm: 25
            },
            script: {},
            user: {
                wpm: 40,
                eff: 35,
                freq: 650
            }
        });
    });
    test('play("abcd")', () => __awaiter(void 0, void 0, void 0, function* () {
        const log = yield playAudio('abcd');
        expect(log).toEqual([
            {
                name: 'play:start',
                value: {
                    combined: {
                        color: "#fff",
                        eff: 25,
                        freq: 600,
                        gain: 0.5,
                        q: 10,
                        volume: 0.7,
                        wpm: 25,
                    },
                    defaults: {
                        color: "#fff",
                        eff: 25,
                        freq: 600,
                        gain: 0.5,
                        q: 10,
                        volume: 0.7,
                        wpm: 25,
                    },
                    script: {},
                    user: {},
                }
            },
            { name: 'char:start', value: { index: 0, startPercent: 0, endPercent: 25, name: 'play', value: 'a', startTime: expect.any(Number), endTime: expect.any(Number) } },
            { name: 'char:end', value: { index: 0, startPercent: 0, endPercent: 25, name: 'play', value: 'a', startTime: expect.any(Number), endTime: expect.any(Number) } },
            { name: 'char:start', value: { index: 1, startPercent: 25, endPercent: 50, name: 'play', value: 'b', startTime: expect.any(Number), endTime: expect.any(Number) } },
            { name: 'char:end', value: { index: 1, startPercent: 25, endPercent: 50, name: 'play', value: 'b', startTime: expect.any(Number), endTime: expect.any(Number) } },
            { name: 'char:start', value: { index: 2, startPercent: 50, endPercent: 75, name: 'play', value: 'c', startTime: expect.any(Number), endTime: expect.any(Number) } },
            { name: 'char:end', value: { index: 2, startPercent: 50, endPercent: 75, name: 'play', value: 'c', startTime: expect.any(Number), endTime: expect.any(Number) } },
            { name: 'char:start', value: { index: 3, startPercent: 75, endPercent: 100, name: 'play', value: 'd', startTime: expect.any(Number), endTime: expect.any(Number) } },
            { name: 'char:end', value: { index: 3, startPercent: 75, endPercent: 100, name: 'play', value: 'd', startTime: expect.any(Number), endTime: expect.any(Number) } },
            { name: 'play:stop', value: '' }
        ]);
    }));
    test('play("a[set wpm:25]b")', () => __awaiter(void 0, void 0, void 0, function* () {
        const log = yield playAudio('a[set wpm:25]b');
        expect(log).toEqual([
            {
                name: 'play:start',
                value: {
                    combined: {
                        color: "#fff",
                        eff: 25,
                        freq: 600,
                        gain: 0.5,
                        q: 10,
                        volume: 0.7,
                        wpm: 25,
                    },
                    defaults: {
                        color: "#fff",
                        eff: 25,
                        freq: 600,
                        gain: 0.5,
                        q: 10,
                        volume: 0.7,
                        wpm: 25,
                    },
                    script: {},
                    user: {},
                }
            },
            { name: 'char:start', value: { index: 0, startPercent: 0, endPercent: 50, name: 'play', value: 'a', startTime: expect.any(Number), endTime: expect.any(Number) } },
            { name: 'char:end', value: { index: 0, startPercent: 0, endPercent: 50, name: 'play', value: 'a', startTime: expect.any(Number), endTime: expect.any(Number) } },
            { name: 'options', value: {
                    defaults: expect.any(Object),
                    user: expect.any(Object),
                    script: expect.any(Object),
                    combined: expect.any(Object)
                } },
            { name: 'char:start', value: { index: 2, startPercent: 50, endPercent: 100, name: 'play', value: 'b', startTime: expect.any(Number), endTime: expect.any(Number) } },
            { name: 'char:end', value: { index: 2, startPercent: 50, endPercent: 100, name: 'play', value: 'b', startTime: expect.any(Number), endTime: expect.any(Number) } },
            { name: 'play:stop', value: '' }
        ]);
    }));
});
