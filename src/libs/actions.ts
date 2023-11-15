import { scrambleList, randomEntry, randCallsign, toList, toNumber, countMap } from './utils';
import { states as stateList } from '../resources/states';
import { letters as letterList } from '../resources/letters';
import { numbers as numberList } from '../resources/numbers';
//import { ALPHA, NUMERIC, CALLSIGN_FORMATS } from '../resources/lists';

// ---------------------------------------------------------
//                         Verbs
// ---------------------------------------------------------

/**
 * Set Audio Properties 
 * 
 * @returns {Object} (Audio options)
 **/
export function set(value: Record<string, any>): Record<string, any> {
  return value;
}

/**
 * Play String of CW 
 * 
 * @returns {String} (CW Text to play)
 **/
export function play(value: string): string {
  return value;
}

/**
 * Randomly pick from vocab or words
 * 
 * - action.from = string | string[] = List to pick from
 * - action.combine = number = Pick and combine multiple items (optional)
 * - action.repeat = number = Repeat multiple times (optional)
 * 
 * @returns {string[]} (array of CW text strings to play)
 **/
export function pick(action: Record<string, any>): string[] {
  if (!action.from) {
    throw new Error('[pick from:? combine:? repeat:?] missing property "from"');
  }
  const list = toList(action.from);
  const combine = toNumber(action.combine) || 1;
  const repeat = toNumber(action.repeat) || 1;

  return countMap(repeat, () => {
    let value = '';

    for (let i = 0; i < combine; i++) {
      value += randomEntry(list);
    }
    return value;
  });
}

/**
 * Scramble vocab or words
 * 
 * - action.from = string | string[] = List to scramble
 * - action.count = number = Return subset of list (optional)
 * 
 * @returns {string[]}
 **/
export function scramble(action: Record<string, any>): string[] {
  if (!action.from) {
    throw new Error('[scramble from:? count:?] missing property "from"');
  }
  const list = scrambleList(
    toList(action.from)
  );

  const count = toNumber(action.count);

  return count
    ? list.slice(0, count)
    : list;
}

/**
 * Select a random callsign
 **/
export function callsign(action: Record<string, any>): string {
  const min = parseInt(action.min, 10) || 0;
  const max = parseInt(action.max, 10) || 0;
  
  return randCallsign(min, max);
}

// ---------------------------------------------------------
//                         Nouns
// ---------------------------------------------------------

export function states() {
  return stateList.map(state => 
    state.value.toLowerCase()
  );
}

export function letters() {
  return letterList.map(letter => 
    letter.value.toLowerCase()
  );
}

export function numbers() {
  return numberList.map(number => 
    number.value.toLowerCase()
  );
}

export function alphanumeric() {
  return letterList.map(letter => 
    letter.value.toLowerCase()
  )
  .concat(numberList.map(number => 
    number.value.toLowerCase()
  ));
}

