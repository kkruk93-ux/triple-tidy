import { MASTER_SEED, levelConfig } from './config.js';
import { mulberry32, mixSeed, pick, randInt, shuffleIn } from './rng.js';
import { addToTray, rectsOverlap } from './board.js';
import { TRAY_SIZE as TRAY } from './config.js';

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

/**
 * Build a collection order that never overflows the 7-slot tray.
 * All tiles are "free" during this step; occlusion is added later, in reverse.
 */
export function buildSequence(bag, rng, delayMatch) {
  const remaining = bag.slice();
  shuffleIn(remaining, rng);
  let tray = [];
  const seq = [];

  while (remaining.length) {
    const counts = new Map();
    for (const t of tray) counts.set(t.type, (counts.get(t.type) || 0) + 1);
    const legal = remaining.filter((tile) => {
      const c = counts.get(tile.type) || 0;
      if (c >= 2) return true;
      return tray.length + 1 <= TRAY;
    });
    if (!legal.length) {
      throw new Error('Sequence generation stuck (tray overflow).');
    }

    const completers = legal.filter((t) => (counts.get(t.type) || 0) >= 2);
    const progressors = legal.filter((t) => (counts.get(t.type) || 0) === 1);
    const fresh = legal.filter((t) => !counts.get(t.type));
    const space = TRAY - tray.length;

    let pool;
    const mustComplete = space <= 2 && completers.length;
    const preferComplete = completers.length && (mustComplete || delayMatch <= 0 || rng() > delayMatch);
    if (preferComplete) pool = completers;
    else if (space <= 1 && completers.length) pool = completers;
    else if (progressors.length && (fresh.length === 0 || space <= 3 || rng() < 0.55)) pool = progressors;
    else if (fresh.length && space > 2) pool = fresh;
    else pool = legal;

    const tile = pick(pool, rng);
    const idx = remaining.findIndex((t) => t.id === tile.id);
    remaining.splice(idx, 1);
    seq.push(tile);
    const added = addToTray(tray, tile);
    if (added.lost) throw new Error('Sequence overflowed the tray.');
    tray = added.tray;
  }
  return seq;
}

function placeTiles(sequence, rng, cfg) {
  const { tileSize, tightness, boardW, boardH, cols, rows } = cfg;
  const stepX = tileSize * 0.78;
  const stepY = tileSize * 0.78;
  const gridW = (cols - 1) * stepX + tileSize;
  const gridH = (rows - 1) * stepY + tileSize;
  const marginX = (boardW - gridW) / 2;
  const marginY = Math.max(6, (boardH - gridH) / 2);

  const slots = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const ox = (r % 2) * stepX * 0.32;
      slots.push({
        x: marginX + c * stepX + ox,
        y: marginY + r * stepY,
      });
    }
  }

  const placed = [];
  for (let i = sequence.length - 1; i >= 0; i--) {
    const item = sequence[i];
    let x;
    let y;
    const wantOverlap = placed.length > 0 && rng() < tightness;

    if (placed.length === 0) {
      x = (boardW - tileSize) / 2;
      y = (boardH - tileSize) / 2;
    } else if (wantOverlap) {
      const base = placed[randInt(rng, placed.length)];
      const ang = rng() * Math.PI * 2;
      const dist = tileSize * (0.26 + rng() * 0.42);
      x = base.x + Math.cos(ang) * dist;
      y = base.y + Math.sin(ang) * dist;
    } else {
      const slot = slots[randInt(rng, slots.length)];
      // Stay near the existing cluster so early levels stay readable.
      const jitter = tileSize * (0.08 + tightness * 0.12);
      x = slot.x + (rng() - 0.5) * jitter * 2;
      y = slot.y + (rng() - 0.5) * jitter * 2;
      if (placed.length > 3 && tightness < 0.45) {
        // Pull slightly toward center so the pile does not look sparse.
        const cx = (boardW - tileSize) / 2;
        const cy = (boardH - tileSize) / 2;
        x = x * 0.82 + cx * 0.18;
        y = y * 0.82 + cy * 0.18;
      }
    }

    x = clamp(x, 2, boardW - tileSize - 2);
    y = clamp(y, 2, boardH - tileSize - 2);

    let z = 0;
    for (const p of placed) {
      if (rectsOverlap({ x, y, w: tileSize, h: tileSize }, p)) {
        z = Math.max(z, p.z + 1);
      }
    }

    placed.push({
      id: item.id,
      type: item.type,
      x,
      y,
      z,
      w: tileSize,
      h: tileSize,
      removed: false,
    });
  }
  return placed;
}

export function generateLevel(level, masterSeed = MASTER_SEED) {
  const cfg = levelConfig(level);
  const rng = mulberry32(mixSeed(masterSeed, cfg.level));
  const bag = [];
  let id = 1;
  for (let type = 0; type < cfg.types; type++) {
    for (let n = 0; n < cfg.triples * 3; n++) {
      bag.push({ id: id++, type });
    }
  }
  const sequence = buildSequence(bag, rng, cfg.delayMatch);
  const tiles = placeTiles(sequence, rng, cfg);
  return {
    level: cfg.level,
    config: cfg,
    tiles,
    solutionIds: sequence.map((t) => t.id),
  };
}

