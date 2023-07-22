import { scrambleList, randomEntry, splitVocab, toList, toNumber, countMap } from './utils';
import { states as stateList } from '../resources/states';
import { letters as letterList } from '../resources/letters';
import { numbers as numberList } from '../resources/numbers';

export const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const NUMERIC = '0123456789';
export const ALPHA_NUMERIC = ALPHA + NUMERIC;

// ---------------------------------------------------------
//                         Verbs
// ---------------------------------------------------------

/**
 * Set Audio Properties
 **/
export function set(value) {
  return value;
}

/**
 * Play String of CW
 **/
export function play(value) {
  return value;
}

/**
 * Randomly pick from vocab or words
 **/
export function pick(action) {
  if (!action.from) {
    throw new Error('[pick from:? count:?] missing property "from"');
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
 **/
export function scramble(value) {
  if (!value.from) {
    throw new Error('[scramble from:?] missing property "from"');
  }
  const list = scrambleList(
    toList(value.from)
  );

  const count = toNumber(value.count);

  return count
    ? list.slice(0, count)
    : list;
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