import { CALLSIGN_FORMATS, ALPHA, NUMERIC } from "../resources/lists";
export function backoff(start, end) {
    const count = 10;
    const divisor = count - 1;
    let curve = new Float32Array(count);
    let t = 0;
    start = Math.max(start, 0.0000001);
    end = Math.max(end, 0.0000001);
    for (var i = 0; i < count; ++i) {
        curve[i] = start * Math.pow(end / start, t);
        t += 1 / divisor;
    }
    return curve;
}
export function rand(size) {
    return Math.floor(Math.random() * size);
}
export function countMap(count, cb) {
    const out = Array(count);
    for (let i = 0; i < count; ++i) {
        out[i] = cb(i);
    }
    return out;
}
export function scrambleList(list) {
    const randomized = list.slice();
    const size = randomized.length;
    for (let i = 0; i < size; ++i) {
        const to = Math.floor(Math.random() * size);
        const temp = randomized[to];
        randomized[to] = randomized[i];
        randomized[i] = temp;
    }
    return randomized;
}
export function randomEntry(list) {
    return list[rand(list.length)];
}
export function splitVocab(text) {
    return text
        .split(/(\<.*?\>)/gm)
        .reduce((list, text, index) => list.concat(index % 2
        ? text
        : text.split('')), []);
}
export function toList(list) {
    if (Array.isArray(list)) {
        return list;
    }
    return (list.indexOf(' ') >= 0)
        ? list.split(' ')
        : splitVocab(list);
}
export function toNumber(value) {
    if (value && typeof value === 'object') {
        value = Array.isArray(value)
            ? toNumber(value[0])
            : toNumber(value.value);
    }
    if (typeof value === 'number') {
        return value;
    }
    if (typeof value === 'string') {
        value = parseInt(value, 10);
        return isNaN(value) ? 0 : value;
    }
    return 0;
}
export function randCallsign(min = 3, max = 0) {
    if (max <= min) {
        max = min;
    }
    return randomEntry(CALLSIGN_FORMATS.filter(format => format.length >= min && format.length <= max))
        .split('')
        .map(format => randomEntry(format === 'L' ? ALPHA : NUMERIC))
        .join('');
}
