/** Deterministic PRNG (mulberry32). */
export function mulberry32(seed) {
  let t = seed >>> 0;
  return function rng() {
    t += 0x6D2B79F5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

export function mixSeed(a, b) {
  return (Math.imul(a ^ 0x9E3779B9, 2654435761) ^ Math.imul((b + 1) | 0, 1597334677)) >>> 0;
}

export function randInt(rng, n) {
  return Math.floor(rng() * n);
}

export function shuffleIn(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(rng, i + 1);
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

export function pick(arr, rng) {
  return arr[randInt(rng, arr.length)];
}
