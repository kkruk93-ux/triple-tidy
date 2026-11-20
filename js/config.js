export const APP_NAME = 'Meadow Pile';
export const APP_TAGLINE = 'Match three. Clear the tray. Tidy the pile.';
export const LEVEL_COUNT = 100;
export const MASTER_SEED = 20261120;
export const TRAY_SIZE = 7;
export const BOARD_W = 360;
export const BOARD_H = 520;
export const STORAGE_KEY = 'meadow-pile-v2';
export const LEGACY_STORAGE_KEYS = ['meadow-pile-v1', 'triple-tidy-v1'];
export const TYPE_COUNT = 12;

export const WORLDS = [
  { id: 'meadow', name: 'Meadow', start: 1, end: 20, tagline: 'Soft grass and wildflowers.', accent: '#2F9E6B' },
  { id: 'orchard', name: 'Orchard', start: 21, end: 40, tagline: 'Ripe fruit in the sun.', accent: '#E85D4C' },
  { id: 'garden', name: 'Garden', start: 41, end: 60, tagline: 'Petals, pots, and paths.', accent: '#E46AA0' },
  { id: 'pond', name: 'Pond', start: 61, end: 80, tagline: 'Ripples and cool shade.', accent: '#3A8FD4' },
  { id: 'forest', name: 'Forest', start: 81, end: 100, tagline: 'Deep shade, dense piles.', accent: '#1E5C3A' },
];

export function worldFor(level) {
  return WORLDS.find((w) => level >= w.start && level <= w.end) || WORLDS[0];
}

export function worldById(id) {
  return WORLDS.find((w) => w.id === id) || WORLDS[0];
}

/** Deterministic, non-decreasing tile counts and a smooth mechanic ramp. */
export function levelSpec(level) {
  const i = Math.max(1, Math.min(LEVEL_COUNT, level | 0));
  let prevTiles = 0;
  let spec = null;
  for (let n = 1; n <= i; n++) {
    const types = Math.min(12, 4 + Math.floor((n - 1) / 9));
    const target = 24 + Math.round(((n - 1) * (168 - 24)) / (LEVEL_COUNT - 1));
    let triples = Math.max(2, Math.round(target / (types * 3)));
    let tileCount = types * triples * 3;
    while (tileCount < prevTiles) {
      triples += 1;
      tileCount = types * triples * 3;
    }
    if (tileCount > 180) {
      triples = Math.max(triples - 1, Math.floor(180 / (types * 3)));
      tileCount = types * triples * 3;
      if (tileCount < prevTiles) {
        triples += 1;
        tileCount = types * triples * 3;
      }
    }
    const locks = n < 21 ? 0 : Math.min(8, 1 + Math.floor((n - 21) / 8));
    const hidden = n < 41 ? 0 : Math.min(16, 3 + Math.floor((n - 41) / 5));
    const ice = n < 61 ? 0 : Math.min(10, 2 + Math.floor((n - 61) / 5));
    spec = { types, triples, tileCount, locks, hidden, ice };
    prevTiles = tileCount;
  }
  return spec;
}

export function levelConfig(level) {
  const i = Math.max(1, Math.min(LEVEL_COUNT, level | 0));
  const spec = levelSpec(i);
  const world = worldFor(i);
  const t = (i - 1) / (LEVEL_COUNT - 1);
  const tightness = 0.2 + t * 0.5;
  const delayMatch = i <= 6 ? 0 : Math.min(0.3, (i - 6) * 0.0032);
  const maxLayer = Math.min(6, 2 + Math.floor((i - 1) / 16));
  const tileCount = spec.tileCount;
  const tileSize = tileCount <= 36 ? 58 : tileCount <= 72 ? 54 : tileCount <= 120 ? 50 : 46;
  const cols = i <= 16 ? 5 : i <= 50 ? 6 : 7;
  const rows = i <= 16 ? 6 : i <= 50 ? 7 : 8;
  const undo = i <= 20 ? 5 : i <= 50 ? 3 : 2;
  const shuffle = i <= 20 ? 2 : 1;
  const hint = i <= 20 ? 3 : 2;
  const parTime = Math.round(tileCount * 1.6 + 12 + spec.ice * 2);
  const parTime2 = Math.round(tileCount * 3 + 28 + spec.ice * 3);
  return {
    level: i,
    world,
    types: spec.types,
    triples: spec.triples,
    tileCount,
    locks: spec.locks,
    hidden: spec.hidden,
    ice: spec.ice,
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

/** Mid-difficulty daily board; world rotates with the date. */
export function dailyConfig(isoDate) {
  const dayNum = Number(String(isoDate).replace(/-/g, '')) || 20261120;
  const world = WORLDS[Math.abs(dayNum) % WORLDS.length];
  const baseLevel = 24 + (Math.abs(dayNum) % 17); // 24–40
  const cfg = levelConfig(baseLevel);
  return {
    ...cfg,
    level: 0,
    daily: true,
    dailyDate: isoDate,
    world,
    // Keep daily compact and fair, with a light taste of later mechanics.
    locks: 2,
    hidden: world.id === 'meadow' || world.id === 'orchard' ? 0 : 4,
    ice: world.id === 'pond' || world.id === 'forest' ? 3 : 0,
  };
}

export function starsFor({ timeSec, usedHelps, parTime, parTime2 }) {
  if (usedHelps === 0 && timeSec <= parTime) return 3;
  if (usedHelps <= 1 && timeSec <= parTime2) return 2;
  if (timeSec <= parTime2) return 2;
  return 1;
}

export const ACHIEVEMENTS = [
  { id: 'first-tidy', name: 'First tidy', desc: 'Clear any level.' },
  { id: 'ten-clear', name: 'Getting tidy', desc: 'Clear 10 campaign levels.' },
  { id: 'fifty-clear', name: 'Halfway neat', desc: 'Clear 50 campaign levels.' },
  { id: 'all-clear', name: 'Every pile', desc: 'Clear all 100 campaign levels.' },
  { id: 'meadow-done', name: 'Meadow walked', desc: 'Clear every Meadow level.' },
  { id: 'orchard-done', name: 'Orchard picked', desc: 'Clear every Orchard level.' },
  { id: 'garden-done', name: 'Garden tended', desc: 'Clear every Garden level.' },
  { id: 'pond-done', name: 'Pond skimmed', desc: 'Clear every Pond level.' },
  { id: 'forest-done', name: 'Forest walked', desc: 'Clear every Forest level.' },
  { id: 'perfect', name: 'Spotless', desc: 'Earn three stars on a level.' },
  { id: 'no-help', name: 'No fuss', desc: 'Clear a campaign level without helps.' },
  { id: 'daily-one', name: 'Morning pile', desc: 'Solve a Daily Puzzle.' },
  { id: 'streak-7', name: 'Week of tidying', desc: 'Hold a 7-day Daily Puzzle streak.' },
];

export function todayISO(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function shiftISO(isoDate, days) {
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(y, m - 1, d + days);
  return todayISO(dt);
}
