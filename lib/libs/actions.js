import { scrambleList, randomEntry, splitVocab, toList, toNumber, countMap } from './utils';
import { states as stateList } from '../resources/states';
import { letters as letterList } from '../resources/letters';
import { numbers as numberList } from '../resources/numbers';
import { ALPHA, NUMERIC } from '../resources/lists';
export function set(value) {
    return value;
}
export function play(value) {
    return value;
}
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
export function scramble(value) {
    if (!value.from) {
        throw new Error('[scramble from:?] missing property "from"');
    }
    const list = scrambleList(toList(value.from));
    const count = toNumber(value.count);
    return count
        ? list.slice(0, count)
        : list;
}
export function states() {
    return stateList.map(state => state.value.toLowerCase());
}
export function letters() {
    return letterList.map(letter => letter.value.toLowerCase());
}
export function numbers() {
    return numberList.map(number => number.value.toLowerCase());
}
export function alphanumeric() {
    return letterList.map(letter => letter.value.toLowerCase())
        .concat(numberList.map(number => number.value.toLowerCase()));
}
export function callsign(min, max) {
    return randomEntry(CALLSIGN_FORMATS.filter(format => format.length >= min && format.length <= max))
        .split()
        .map(format => randomEntry(format === 'L'
        ? ALPHA
        : NUMERIC))
        .join('');
}
