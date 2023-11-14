import { describe, expect, test } from '@jest/globals';
import { Script } from '../libs/script';
describe('Script CW', () => {
    test('Class instantates', () => {
        expect(new Script('')).toBeInstanceOf(Script);
    });
    test('getNext()', () => {
        const script = new Script('abcd');
        expect(script.getNext()).toEqual({
            index: 0,
            startPercent: 0,
            endPercent: 25,
            endTime: 0,
            startTime: 0,
            name: "play",
            value: "a"
        });
        expect(script.getNext()).toEqual({
            index: 0,
            startPercent: 0,
            endPercent: 25,
            endTime: 0,
            startTime: 0,
            name: "play",
            value: "a"
        });
    });
    test('getNext(true) abcd', () => {
        const script = new Script('abcd');
        expect(script.getNext(true)).toEqual({
            index: 0,
            startPercent: 0,
            endPercent: 25,
            endTime: 0,
            startTime: 0,
            name: "play",
            value: "a"
        });
        expect(script.getNext(true)).toEqual({
            index: 1,
            startPercent: 25,
            endPercent: 50,
            endTime: 0,
            startTime: 0,
            name: "play",
            value: "b"
        });
        expect(script.getNext(true)).toEqual({
            index: 2,
            startPercent: 50,
            endPercent: 75,
            endTime: 0,
            startTime: 0,
            name: "play",
            value: "c"
        });
        expect(script.getNext(true)).toEqual({
            index: 3,
            startPercent: 75,
            endPercent: 100,
            endTime: 0,
            startTime: 0,
            name: "play",
            value: "d"
        });
        expect(script.getNext(true)).toEqual(undefined);
    });
    test('getNext(true) ab[set wpm:25 volume:7]cd', () => {
        const script = new Script('ab[set wpm:25 volume:7]cd');
        expect(script.getNext(true)).toEqual({
            index: 0,
            startPercent: 0,
            endPercent: 25,
            endTime: 0,
            startTime: 0,
            name: "play",
            value: "a"
        });
        expect(script.getNext(true)).toEqual({
            index: 1,
            startPercent: 25,
            endPercent: 50,
            endTime: 0,
            startTime: 0,
            name: "play",
            value: "b"
        });
        expect(script.getNext(true)).toEqual({
            index: 2,
            startPercent: 50,
            endPercent: 50,
            endTime: 0,
            startTime: 0,
            name: "set",
            value: {
                wpm: '25',
                volume: '7'
            }
        });
        expect(script.getNext(true)).toEqual({
            index: 3,
            startPercent: 50,
            endPercent: 75,
            endTime: 0,
            startTime: 0,
            name: "play",
            value: "c"
        });
        expect(script.getNext(true)).toEqual({
            index: 4,
            startPercent: 75,
            endPercent: 100,
            endTime: 0,
            startTime: 0,
            name: "play",
            value: "d"
        });
        expect(script.getNext(true)).toEqual(undefined);
    });
    test('rollback()', () => {
        const script = new Script('abcd');
        expect(script.getNext()).toEqual({
            index: 0,
            startPercent: 0,
            endPercent: 25,
            endTime: 0,
            startTime: 0,
            name: "play",
            value: "a"
        });
        expect(script.getNext(true)).toEqual({
            index: 0,
            startPercent: 0,
            endPercent: 25,
            endTime: 0,
            startTime: 0,
            name: "play",
            value: "a"
        });
        expect(script.getNext(true)).toEqual({
            index: 1,
            startPercent: 25,
            endPercent: 50,
            endTime: 0,
            startTime: 0,
            name: "play",
            value: "b"
        });
        expect(script.getNext(true)).toEqual({
            index: 2,
            startPercent: 50,
            endPercent: 75,
            endTime: 0,
            startTime: 0,
            name: "play",
            value: "c"
        });
        expect(script.getNext(true)).toEqual({
            index: 3,
            startPercent: 75,
            endPercent: 100,
            endTime: 0,
            startTime: 0,
            name: "play",
            value: "d"
        });
        script.rollback({
            index: 1,
            name: "play",
            value: "b"
        });
        expect(script.getNext(true)).toEqual({
            index: 1,
            startPercent: 25,
            endPercent: 50,
            endTime: 0,
            startTime: 0,
            name: "play",
            value: "b"
        });
        expect(script.getNext(true)).toEqual({
            index: 2,
            startPercent: 50,
            endPercent: 75,
            endTime: 0,
            startTime: 0,
            name: "play",
            value: "c"
        });
        expect(script.getNext(true)).toEqual({
            index: 3,
            startPercent: 75,
            endPercent: 100,
            endTime: 0,
            startTime: 0,
            name: "play",
            value: "d"
        });
    });
    test('rewind()', () => {
        const script = new Script('let me not to the marriage of true minds');
        for (let i = 0; i < 11; ++i) {
            script.getNext(true);
        }
        expect(script.getNext(true)).toEqual({
            index: 11,
            startPercent: 27.500000000000004,
            endPercent: 30,
            endTime: 0,
            startTime: 0,
            name: "play",
            value: "t"
        });
        script.rewind();
        expect(script.getNext(true)).toEqual({
            index: 6,
            startPercent: 15,
            endPercent: 17.5,
            startTime: 0,
            endTime: 0,
            name: 'play',
            value: ' '
        });
    });
});
