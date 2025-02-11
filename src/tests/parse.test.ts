import { describe, expect, test } from '@jest/globals';
import { parse } from '../libs/parse';

describe('Parse CW', () => {

  test('Class instantates', () => {
    expect(parse('')).toEqual([]);
  });

  test('parses: a static string', () => {
    expect(parse('a static string')).toEqual([{
      as: '',
      name: 'play',
      value: 'a static string'
    }]);
  });

  test('parses: [set]', () => {
    expect(parse('[set]')).toEqual([{
      as: '',
      name: 'set',
      value: {}
    }]);
  });

  test('parses: [ set ]', () => {
    expect(parse('[ set ]')).toEqual([{
      as: '',
      name: 'set',
      value: {}
    }]);
  });

  test('parses: [set wpm:25]', () => {
    expect(parse('[set wpm:25]')).toEqual([{
      as: '',
      name: 'set', 
      value: {
        wpm: '25' 
      }
    }]);
  });

  test('parses: [ set wpm : 25 ]', () => {
    expect(parse('[ set wpm : 25 ]')).toEqual([{
      as: '',
      name: 'set', 
      value: {
        wpm: '25' 
      }
    }]);
  });

  test('parses: [set wpm=25 eff=255 vocab=abcdefghijklmnop]', () => {
    expect(parse('[set wpm=25 eff=255 vocab=abcdefghijklmnop]')).toEqual([{
      as: '',
      name: 'set', 
      value: {
        wpm: '25', 
        eff: '255', 
        vocab: 'abcdefghijklmnop' 
      }
    }]);
  });

  test('parses: [set text:"cq cq cq"]', () => {
    expect(parse('[set text:"cq cq cq"]')).toEqual([{
      as: '',
      name: 'set', 
      value: {
        text: 'cq cq cq' 
      }
    }]);
  });

  test('parses: [set text: "cq cq cq" ] ', () => {
    expect(parse('[set text: "cq cq cq" ] ')).toEqual([{
      as: '',
      name: 'set', 
      value: {
        text: 'cq cq cq' 
      }
    }]);
  });

  test('parses: [audio wpm:25 eff:30 vocab:01234567890]', () => {
    expect(parse('[audio wpm:25 eff:30 vocab:01234567890]')).toEqual([{
      as: '',
      name: 'audio', 
      value: {
        wpm: '25', 
        eff: '30', 
        vocab: '01234567890' 
      }
    }]);
  });

  test('parses: [audio wpm:[pick from:15 to:35]]', () => {
    expect(parse('[audio wpm:[pick from:15 to:35]]')).toEqual([{
      as: '',
      name: 'audio',
      value: {
        wpm: {
          as: '',
          name: 'pick',
          value: {
            from: '15',
            to: '35'
          }
        }
      }
    }]);
  });

  test('parses: [audio as:p1 wpm:[pick from:15 to:35]] cq pota [call as:c1]', () => {
    expect(parse('[audio as:p1 wpm:[pick from:15 to:35]] cq pota [call as:c1]')).toEqual([{
      name: 'audio',
      as: 'p1',
      value: {
        wpm: {
          as: '',
          name: 'pick',
          value: {
            from: '15',
            to: '35'
          }
        }
      }
    }, {
      as: '',
      name: 'play',
      value: ' cq pota '
      }, {
      name: 'call',
      as: 'c1',
      value: {}
    }]);
  });

  test('parses: [pick from:"one two three four five six seven"]', () => {
    expect(parse('[pick from:"one two three four five six seven"]')).toEqual([{
      as: '',
      name: 'pick', 
      value: {
        from: "one two three four five six seven" 
      }
    }]);
  });

  test('parses: abcd<BT>', () => {
    expect(parse('abcd<BT> efg')).toEqual([{
      as: '',
      name: 'play',
      value: 'abcd<bt> efg'
    }]);
  });

  test('parses: abcd<BT>efg<BT>', () => {
    expect(parse('abcd<BT> efg<BT>')).toEqual([{
      as: '',
      name: 'play',
      value: 'abcd<bt> efg<bt>'
    }]);
  });

  test('parses: [callsign vocab:1x3]', () => {
    expect(parse('[callsign vocab:1x3,complex]')).toEqual([{
      as: "",
      name: "callsign",
      value: {
        vocab: "1x3,complex",
      },
    }]);
  });

});
