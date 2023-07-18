/**
 * Generate an exponential backoff curve array
 **/
export function backoff(start, end) {
  const count = 10;
  let curve = new Float32Array(count + 1);
  let t = 0;

  start = Math.max(start, 0.0000001);
  end = Math.max(end, 0.0000001);

  for (var i = 0; i <= count; ++i) {
    curve[i] = start * Math.pow(end / start, t);
    t += 1 / count;
  }
  return curve;
}

/**
 * Random number from zero < size
 **/
export function rand(size) {
  return Math.floor(Math.random() * size);
}

/**
 * Count Map
 **/
export function countMap(count, cb) {
  const out = Array(count);

  for (let i = 0; i < count; ++i) {
    out[i] = cb(i);
  }
  return out;
}

/**
 * Scramble an array
 **/
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

/**
 * Randomly select one item from a list
 **/
export function randomEntry(list) {
  return list[rand(list.length)];
}

/**
 * Split list of CW Vocabulary Chars
 **/
export function splitVocab(text) {
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
export function toList(list) {
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
export function toNumber(value) {
  if (value && typeof value === 'object') {
    value = Array.isArray(value)
      ? value[0]
      : value.value;
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