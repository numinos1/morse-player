import { CALLSIGN_FORMATS, ALPHA, NUMERIC } from "../resources/lists";

/**
 * Generate an exponential backoff curve array
 **/
export function backoff(start: number, end: number) {
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

/**
 * Random number from zero < size
 **/
export function rand(size: number) {
  return Math.floor(Math.random() * size);
}

/**
 * Count Map
 **/
export function countMap(count: number, cb: Function) {
  const out = Array(count);

  for (let i = 0; i < count; ++i) {
    out[i] = cb(i);
  }
  return out;
}

/**
 * Scramble an array
 **/
export function scrambleList<Type>(list: Type[]) {
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

/**
 * Randomly select one item from a list
 **/
export function randomEntry<Type>(list: Type[]) {
  return list[rand(list.length)];
}

/**
 * Split list of CW Vocabulary Chars
 **/
export function splitVocab(text: string): string[] {
  return text
    .split(/(\<.*?\>)/gm)
    .reduce((list, text, index) => 
      list.concat(index % 2 
        ? text 
        : text.split('')
      ),
      []
    );
}

/**
 * Ensure list of CW words
 * - return arrays as-is
 * - if space, split on space
 * - else split on cw tokens
 **/
export function toList(list: string | string[]) {
  if (Array.isArray(list)) {
    return list;
  }
  return (list.indexOf(' ') >= 0)
    ? list.split(' ')
    : splitVocab(list);
}

/**
 * Cast a value as an Int
 **/
export function toNumber(value: any): number {
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

/**
 * Generate a callsign
 * - L{1,2}NL{1,3} (90%)
 * - NLNL{1-3} (10%)
 **/
export function randCallsign(
  min: number = 3,
  max: number = 0
): string {
  if (max <= min) {
    max = min;
  }
  return randomEntry(
      CALLSIGN_FORMATS.filter(format =>
        format.length >= min && format.length <= max
      )
    )
    .split('')
    .map(format => 
      randomEntry(format === 'L' ? ALPHA : NUMERIC)
    )
    .join('');
}