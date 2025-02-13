import { scrambleList, randomEntry, randCallsign, toList, toNumber, countMap } from './utils';
import { states as stateList } from '../resources/states';
import { letters as letterList } from '../resources/letters';
import { numbers as numberList } from '../resources/numbers';
export function set(value) {
    return value;
}
export function play(value) {
    return value;
}
export function pick(action) {
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
export function scramble(action) {
    if (!action.from) {
        throw new Error('[scramble from:? count:?] missing property "from"');
    }
    const list = scrambleList(toList(action.from));
    const count = toNumber(action.count);
    return count
        ? list.slice(0, count)
        : list;
}
export function callsign(action) {
    const min = parseInt(action.min, 10) || 0;
    const max = parseInt(action.max, 10) || 0;
    const vocab = action.vocab || '';
    return randCallsign(min, max, vocab);
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
