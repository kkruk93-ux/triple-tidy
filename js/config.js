export const APP_NAME = 'Meadow Pile';
export const APP_TAGLINE = 'Match three. Clear the tray. Tidy the pile.';
export const LEVEL_COUNT = 30;
export const MASTER_SEED = 20261120;
export const TRAY_SIZE = 7;
export const BOARD_W = 360;
export const BOARD_H = 520;
export const STORAGE_KEY = 'meadow-pile-v1';
export const LEGACY_STORAGE_KEY = 'triple-tidy-v1';
export const TYPE_COUNT = 12;

/** Smooth, non-decreasing tile counts (types × triples × 3). */
const LEVEL_SPEC = [
  { types: 4, triples: 2 }, // 1: 24
  { types: 4, triples: 2 }, // 2: 24
  { types: 4, triples: 3 }, // 3: 36
  { types: 4, triples: 3 }, // 4: 36
  { types: 5, triples: 3 }, // 5: 45
  { types: 5, triples: 3 }, // 6: 45
  { types: 6, triples: 3 }, // 7: 54
  { types: 7, triples: 3 }, // 8: 63
  { types: 7, triples: 3 }, // 9: 63
  { types: 8, triples: 3 }, // 10: 72
  { types: 7, triples: 4 }, // 11: 84
  { types: 7, triples: 4 }, // 12: 84
  { types: 8, triples: 4 }, // 13: 96
  { types: 8, triples: 4 }, // 14: 96
  { types: 9, triples: 4 }, // 15: 108
  { types: 9, triples: 4 }, // 16: 108
  { types: 10, triples: 4 }, // 17: 120
  { types: 10, triples: 4 }, // 18: 120
  { types: 11, triples: 4 }, // 19: 132
  { types: 11, triples: 4 }, // 20: 132
  { types: 12, triples: 4 }, // 21: 144
  { types: 12, triples: 4 }, // 22: 144
  { types: 10, triples: 5 }, // 23: 150
  { types: 10, triples: 5 }, // 24: 150
  { types: 11, triples: 5 }, // 25: 165
  { types: 11, triples: 5 }, // 26: 165
  { types: 12, triples: 5 }, // 27: 180
  { types: 12, triples: 5 }, // 28: 180
  { types: 12, triples: 5 }, // 29: 180
  { types: 12, triples: 5 }, // 30: 180
];

export function levelConfig(level) {
  const i = Math.max(1, Math.min(LEVEL_COUNT, level | 0));
  const spec = LEVEL_SPEC[i - 1];
  const types = spec.types;
  const triples = spec.triples;
  const tileCount = types * triples * 3;
  const t = (i - 1) / (LEVEL_COUNT - 1);
  const tightness = 0.2 + t * 0.5;
  const delayMatch = i <= 4 ? 0 : Math.min(0.3, (i - 4) * 0.011);
  const maxLayer = 2 + Math.floor((i - 1) / 6);
  const tileSize = tileCount <= 36 ? 58 : tileCount <= 72 ? 54 : tileCount <= 108 ? 50 : 46;
  const cols = i <= 8 ? 5 : i <= 18 ? 6 : 7;
  const rows = i <= 8 ? 6 : i <= 18 ? 7 : 8;
  const undo = i <= 10 ? 5 : i <= 20 ? 3 : 2;
  const shuffle = i <= 10 ? 2 : 1;
  const hint = i <= 10 ? 3 : 2;
  const parTime = Math.round(tileCount * 1.6 + 12);
  const parTime2 = Math.round(tileCount * 3 + 28);
  return {
    level: i,
    types,
    triples,
    tileCount,
    tightness,
    delayMatch,
    maxLayer,
    tileSize,
    cols,
    rows,
    boardW: BOARD_W,
    boardH: BOARD_H,
    helps: { undo, shuffle, hint },
    parTime,
    parTime2,
  };
}

export function starsFor({ timeSec, usedHelps, parTime, parTime2 }) {
  if (usedHelps === 0 && timeSec <= parTime) return 3;
  if (usedHelps <= 1 && timeSec <= parTime2) return 2;
  if (timeSec <= parTime2) return 2;
  return 1;
}
