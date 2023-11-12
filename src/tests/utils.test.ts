import { describe, expect, test } from '@jest/globals';
import {
  randCallsign,
  backoff,
  rand,
  countMap,
  scrambleList,
  randomEntry,
  splitVocab,
  toList,
  toNumber
} from '../libs/utils';

describe('utils.ts', () => {

  // ---------------------------------------------------------
  //        backoff()
  // ---------------------------------------------------------

  describe('backoff()', () => {
    test('Is a function', () => {
      expect(backoff).toBeInstanceOf(Function);
    });

    test('backoff(5, 10)', () => {
      const list = backoff(5, 10);
      expect(list).toHaveLength(10);
    });
  });

  // ---------------------------------------------------------
  //        rand()
  // ---------------------------------------------------------

  describe('rand()', () => {
    test('Is a function', () => {
      expect(rand).toBeInstanceOf(Function);
    });

    test('generates number less than 2', () => {
      expect(rand(2)).toBeLessThan(2);
      expect(rand(2)).toBeLessThan(2);
      expect(rand(2)).toBeLessThan(2);
      expect(rand(2)).toBeLessThan(2);
      expect(rand(2)).toBeLessThan(2);
      expect(rand(2)).toBeLessThan(2);
      expect(rand(2)).toBeLessThan(2);
      expect(rand(2)).toBeLessThan(2);
      expect(rand(2)).toBeLessThan(2);
    });

    test('generates number less than 10', () => {
      expect(rand(10)).toBeLessThan(10);
      expect(rand(10)).toBeLessThan(10);
      expect(rand(10)).toBeLessThan(10);
      expect(rand(10)).toBeLessThan(10);
      expect(rand(10)).toBeLessThan(10);
      expect(rand(10)).toBeLessThan(10);
      expect(rand(10)).toBeLessThan(10);
      expect(rand(10)).toBeLessThan(10);
      expect(rand(10)).toBeLessThan(10);
    });
  });

  // ---------------------------------------------------------
  //        countMap()
  // ---------------------------------------------------------

  describe('countMap()', () => {
    test('Is a function', () => {
      expect(countMap).toBeInstanceOf(Function);
    });

    test('Count to five', () => {
      const list = countMap(5, (i: number) => i);
      expect(list).toEqual([0, 1, 2, 3, 4]);
    });
  });

  // ---------------------------------------------------------
  //        scrambleList()
  // ---------------------------------------------------------

  describe('scrambleList()', () => {
    test('Is a function', () => {
      expect(scrambleList).toBeInstanceOf(Function);
    });

    test('Scamble a list of five numbers', () => {
      const list = scrambleList([1, 2, 3, 4, 5]);
      expect(list.length).toEqual(5);
      expect(list).toContain(1);
      expect(list).toContain(2);
      expect(list).toContain(3);
      expect(list).toContain(4);
      expect(list).toContain(5);
    });
  });

  // ---------------------------------------------------------
  //        randomEntry()
  // ---------------------------------------------------------

  describe('randomEntry()', () => {
    test('Is a function', () => {
      expect(randomEntry).toBeInstanceOf(Function);
    });

    test('Pick random entry between 1-5', () => {
      const list = [1, 2, 3, 4, 5];
      expect(list.includes(randomEntry(list))).toBe(true);
      expect(list.includes(randomEntry(list))).toBe(true);
      expect(list.includes(randomEntry(list))).toBe(true);
      expect(list.includes(randomEntry(list))).toBe(true);
      expect(list.includes(randomEntry(list))).toBe(true);
    });
  });

  // ---------------------------------------------------------
  //        splitVocab()
  // ---------------------------------------------------------

  describe('splitVocab()', () => {
    test('Is a function', () => {
      expect(splitVocab).toBeInstanceOf(Function);
    });

    test('Split vocabulary with <prosigns>', () => {
      const list = splitVocab('abcd<pro>efg<sign>hij');
      expect(list).toEqual(['a','b','c','d','<pro>','e','f','g','<sign>','h','i','j']);
    });
  });

  // ---------------------------------------------------------
  //        toList()
  // ---------------------------------------------------------

  describe('toList()', () => {
    test('Is a function', () => {
      expect(toList).toBeInstanceOf(Function);
    });
    
    test('Return array as-is', () => {
      const list = ['a', 'b', 'c', 'd', 'e'];
      expect(toList(list)).toBe(list);
    });

    test('if space, split on space', () => {
      expect(toList('what is your name')).toEqual(['what', 'is', 'your', 'name']);
    });

    test('split on cw vocaburlar', () => {
      const vocab = 'abcd<pro>efg<sign>hij';
      expect(toList(vocab)).toEqual(['a','b','c','d','<pro>','e','f','g','<sign>','h','i','j']);
    });

  });

  // ---------------------------------------------------------
  //        toNumber()
  // ---------------------------------------------------------

  describe('toNumber()', () => {
    test('Is a function', () => {
      expect(toNumber).toBeInstanceOf(Function);
    });

    test('Cast boolean as number', () => {
      expect(toNumber(true)).toEqual(0);
      expect(toNumber(false)).toEqual(0);
    });

    test('Cast number as number', () => {
      expect(toNumber(1)).toEqual(1);
      expect(toNumber(13)).toEqual(13);
      expect(toNumber(0.5)).toEqual(0.5);
    });

    test('Cast string as number', () => {
      expect(toNumber('andrew')).toEqual(0);
      expect(toNumber('and3rew')).toEqual(0);
      expect(toNumber('3andrew')).toEqual(3);
      expect(toNumber('3')).toEqual(3);
      expect(toNumber('0')).toEqual(0);
    });

    test('Cast Array as number', () => {
      expect(toNumber([])).toEqual(0);
      expect(toNumber([1, 2])).toEqual(1);
      expect(toNumber(['a'])).toEqual(0);
      expect(toNumber(['3'])).toEqual(3);
    });

    test('Cast Object as number', () => {
      expect(toNumber({})).toEqual(0);
      expect(toNumber({ value: 3 })).toEqual(3);
      expect(toNumber({ value: '3' })).toEqual(3);
    });
  });

  // ---------------------------------------------------------
  //        randCallsign()
  // ---------------------------------------------------------

  describe('randCallsign()', () => {

    test('Is a function', () => {
      expect(randCallsign).toBeInstanceOf(Function);
    });

    test('Generates a callsign with no params', () => {
      expect(randCallsign()).toMatch(/^[A-Z0-9]{3,6}$/)
    });

    test('Generates a callsign size = 3', () => {
      expect(randCallsign(3)).toMatch(/^[A-Z0-9]{3}$/)
    });

    test('Generates a callsign size = 4', () => {
      expect(randCallsign(4)).toMatch(/^[A-Z0-9]{4}$/)
    });

    test('Generates a callsign size = 5', () => {
      expect(randCallsign(5)).toMatch(/^[A-Z0-9]{5}$/)
    });

    test('Generates a callsign size = 6', () => {
      expect(randCallsign(6)).toMatch(/^[A-Z0-9]{6}$/)
    });
  });
});