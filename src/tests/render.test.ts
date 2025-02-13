import { describe, expect, test } from '@jest/globals';
import { render } from '../libs/render';

describe('Render CW', () => {

  test('Class instantates', () => {
    const value = render('');

    expect(value).toEqual([]);
  });

  test('renders: abcd', () => {
    const value = render('abcd');

    expect(value).toEqual([
      'a', 'b', 'c', 'd'
    ]);
  });

  test('renders: a b c d', () => {
    const value = render('a b c d');

    expect(value).toEqual([
      'a', ' ', 'b', ' ', 'c', ' ', 'd'
    ]);
  });

  test('renders: abcd<bt>ef', () => {
    const value = render('abcd<bt>ef');

    expect(value).toEqual([
      'a', 'b', 'c', 'd', '<bt>', 'e', 'f'
    ]);
  });

  test('renders: cq cq [pick from:[states] as:state] [state]', () => {
    const value = render('cq cq [pick from:[states] as:state] [state]');

    expect(value.join('')).toMatch(/^cq cq (\w{2}) \1$/);
  });

  test('renders: [pick from:[letters] repeat:10]', () => {
    const value = render('[pick from:[letters] repeat:10]');

    expect(value.join('')).toMatch(/^\w \w \w \w \w \w \w \w \w \w$/);
  });

  test('renders: [pick from:[numbers] repeat:3]', () => {
    const value = render('[pick from:[numbers] repeat:3]');

    expect(value.join('')).toMatch(/^\d \d \d$/);
  });

  test('renders: [pick from:eish5 repeat:7]', () => {
    const value = render('[pick from:eish5 repeat:7]');

    expect(value.join('')).toMatch(/^\w \w \w \w \w \w \w$/);
  });

  test('renders: [scramble from:eish5]', () => {
    const value = render('[scramble from:eish5]');

    expect(value.join('')).toMatch(/^\w \w \w \w \w$/);
  });

  test('renders: [scramble from:"gm ga ge"]', () => {
    const value = render('[scramble from:"gm ga ge"]');
    const set = value.join('').split(' ')
      .reduce((out, val) => out.add(val), new Set());

    expect(set.size).toEqual(3);
    expect(value.join('')).toMatch(/^g\w g\w g\w$/);
  });

  test('renders: [pick from:[scramble from:[letters] count:2] repeat:7]', () => {
    const value = render('[pick from:[scramble from:[letters] count:2] repeat:7]');
    const set = value.join('').split(' ')
      .reduce((out, val) => out.add(val), new Set());

    expect(set.size).toEqual(2);
    expect(value.join('')).toMatch(/^\w \w \w \w \w \w \w$/);
  });

  test('renders: abc[set wpm:25 volume:10]def', () => {
    const value = render('abc[set wpm:25 volume:10] def');
    expect(value).toEqual([
      'a', 'b', 'c',
      {
        wpm: '25',
        volume: '10',
      },
      ' ', 'd', 'e', 'f'
    ]);
  });

  test('renders: [callsign min:? max:?]', () => {
    const v1 = render('[callsign min:3 max:6]').join('');
    expect(v1.length).toBeGreaterThanOrEqual(3);
    expect(v1.length).toBeLessThanOrEqual(6);
    expect(v1).toMatch(/^[A-Z]{1,2}\d[A-Z]{1,3}$/);
    
    const v2 = render('[callsign min:3 max:3]').join('');
    expect(v2.length).toEqual(3);
    expect(v2).toMatch(/^[A-Z]{1}\d[A-Z]{1}$/);

    const v3 = render('[callsign min:6 max:6]').join('');
    expect(v3.length).toEqual(6);
    expect(v3).toMatch(/^[A-Z]{2}\d[A-Z]{3}$/);
  });

  test('renders: [callsign vocab:1x3]', () => {
    const v1 = render('[callsign vocab:1x3]').join('');
    expect(v1).toMatch(/^[A-Z]\d[A-Z]{3}$/);
  });

  test('renders: [callsign vocab:2x2]', () => {
    const v1 = render('[callsign vocab:2x2]').join('');
    expect(v1).toMatch(/^[A-Z]{2}\d[A-Z]{2}$/);
  });

  test('renders: [callsign vocab:2x2,2x3]', () => {
    const v1 = render('[callsign vocab:2x2,2x3]').join('');
    expect(v1).toMatch(/^[A-Z]{2}\d[A-Z]{2,3}$/);
  });

  test('renders: [callsign vocab:1x3,2x2,2x3,complex]', () => {
    const v1 = render('[callsign vocab:1x3,2x2,2x3,complex]').join('');
    expect(v1).toMatch(/^[A-Z]{1,2}\d[A-Z]{2,3}$/);
  });

});