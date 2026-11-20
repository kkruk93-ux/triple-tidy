export const LEVEL_COUNT = 30;
export const MASTER_SEED = 20261120;
export const TRAY_SIZE = 7;
export const BOARD_W = 360;
export const BOARD_H = 520;
export const STORAGE_KEY = 'triple-tidy-v1';
export const TYPE_COUNT = 12;

export function levelConfig(level) {
  const i = Math.max(1, Math.min(LEVEL_COUNT, level | 0));
  const types = Math.min(TYPE_COUNT, 4 + Math.floor((i - 1) / 3));
  let triples = 2;
  if (i >= 7) triples = 3;
  if (i >= 16) triples = 4;
  if (i >= 25) triples = 5;
  // Keep later boards dense but still playable on a phone.
  const tileCount = types * triples * 3;
  const tightness = 0.22 + ((i - 1) / (LEVEL_COUNT - 1)) * 0.58;
  const delayMatch = i <= 5 ? 0 : Math.min(0.42, (i - 5) * 0.018);
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
