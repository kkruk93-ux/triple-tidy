import { generateDaily, generateLevel } from './generator.js';
import { addToTray, applyKey, canTap, cloneTiles, isFree } from './board.js';
import { MASTER_SEED, dailyConfig, levelConfig, starsFor } from './config.js';
import { findSolution, hintTileId, verifySolution } from './solver.js';
import { mulberry32, mixSeed } from './rng.js';

export class Game {
  constructor() {
    this.resetEmpty();
  }

  resetEmpty() {
    this.level = 1;
    this.config = levelConfig(1);
    this.tiles = [];
    this.solutionIds = [];
    this.officialLeft = [];
    this.tray = [];
    this.undoStack = [];
    this.clicks = 0;
    this.helpsUsed = 0;
    this.helps = { undo: 0, shuffle: 0, hint: 0 };
    this.status = 'idle';
    this.startedAt = 0;
    this.endedAt = 0;
    this.pausedMs = 0;
    this.pauseStarted = 0;
    this.lastCollect = null;
    this.lastMatch = null;
    this.lastHintId = null;
    this.lastUnlock = null;
    this.lastCrack = null;
    this.combo = 0;
    this.daily = false;
    this.dailyDate = null;
    this.matchesInRow = 0;
    this.lastMatchAt = 0;
  }

  _loadGen(gen) {
    this.level = gen.level;
    this.config = gen.config;
    this.tiles = cloneTiles(gen.tiles);
    this.solutionIds = gen.solutionIds.slice();
    this.officialLeft = gen.solutionIds.slice();
    this.tray = [];
    this.undoStack = [];
    this.clicks = 0;
    this.helpsUsed = 0;
    this.helps = { ...gen.config.helps };
    this.status = 'playing';
    this.startedAt = Date.now();
    this.endedAt = 0;
    this.pausedMs = 0;
    this.pauseStarted = 0;
    this.lastCollect = null;
    this.lastMatch = null;
    this.lastHintId = null;
    this.lastUnlock = null;
    this.lastCrack = null;
    this.combo = 0;
    this.daily = !!gen.daily;
    this.dailyDate = gen.dailyDate || null;
    this.matchesInRow = 0;
    this.lastMatchAt = 0;
    return this;
  }

  start(level) {
    return this._loadGen(generateLevel(level));
  }

  startDaily(isoDate) {
    return this._loadGen(generateDaily(isoDate));
  }

  elapsedSec() {
    const end = this.endedAt || Date.now();
    let paused = this.pausedMs;
    if (this.pauseStarted) paused += end - this.pauseStarted;
    return Math.max(0, (end - this.startedAt - paused) / 1000);
  }

  pause() {
    if (this.status === 'playing' && !this.pauseStarted) this.pauseStarted = Date.now();
  }

  resume() {
    if (this.pauseStarted) {
      this.pausedMs += Date.now() - this.pauseStarted;
      this.pauseStarted = 0;
    }
  }

  snapshot() {
    return {
      tiles: cloneTiles(this.tiles),
      tray: this.tray.map((t) => ({ id: t.id, type: t.type })),
      officialLeft: this.officialLeft.slice(),
      clicks: this.clicks,
      combo: this.combo,
      matchesInRow: this.matchesInRow,
    };
  }

  canCollect(id) {
    if (this.status !== 'playing') return false;
    const tile = this.tiles.find((t) => t.id === id);
    return !!(tile && canTap(tile, this.tiles));
  }

  collect(id) {
    if (!this.canCollect(id)) return { ok: false, locked: this._lockedReason(id) };
    const tile = this.tiles.find((t) => t.id === id);
    this.undoStack.push(this.snapshot());
    this.clicks += 1;
    this.lastHintId = null;
    this.lastUnlock = null;
    this.lastCrack = null;

    if (tile.ice > 1) {
      tile.ice -= 1;
      this.lastCrack = { id: tile.id };
      this.lastCollect = null;
      this.lastMatch = null;
      return { ok: true, cracked: true, tile };
    }

    tile.removed = true;
    if (this.officialLeft[0] === id) this.officialLeft.shift();
    else this.officialLeft = [];
    let unlocked = null;
    if (tile.isKey) unlocked = applyKey(this.tiles, tile);
    this.lastUnlock = unlocked;
    const result = addToTray(this.tray, tile);
    this.tray = result.tray;
    this.lastCollect = { id, type: tile.type, isKey: !!tile.isKey };
    this.lastMatch = result.matched;
    if (result.matched) {
      const now = Date.now();
      if (now - this.lastMatchAt < 2200) this.matchesInRow += 1;
      else this.matchesInRow = 1;
      this.lastMatchAt = now;
      this.combo = this.matchesInRow;
    } else {
      this.matchesInRow = 0;
      this.combo = 0;
    }

    if (result.lost) {
      this.status = 'lost';
      this.endedAt = Date.now();
      return { ok: true, lost: true, matched: null, tile, unlocked };
    }
    const left = this.tiles.some((t) => !t.removed);
    if (!left && this.tray.length === 0) {
      this.status = 'won';
      this.endedAt = Date.now();
      return { ok: true, won: true, matched: result.matched, tile, unlocked, stars: this.starCount(), combo: this.combo };
    }
    return { ok: true, matched: result.matched, tile, unlocked, combo: this.combo };
  }

  _lockedReason(id) {
    const tile = this.tiles.find((t) => t.id === id);
    if (!tile) return 'missing';
    if (tile.removed) return 'gone';
    if (!isFree(tile, this.tiles)) return 'covered';
    if (tile.locked) return 'locked';
    return 'other';
  }

  starCount() {
    return starsFor({
      timeSec: this.elapsedSec(),
      usedHelps: this.helpsUsed,
      parTime: this.config.parTime,
      parTime2: this.config.parTime2,
    });
  }

  undo() {
    if (this.status !== 'playing' || this.helps.undo <= 0 || this.undoStack.length === 0) {
      return { ok: false, reason: this.helps.undo <= 0 ? 'empty' : 'none' };
    }
    const snap = this.undoStack.pop();
    this.tiles = snap.tiles;
    this.tray = snap.tray;
    this.officialLeft = snap.officialLeft;
    this.clicks = snap.clicks;
    this.combo = snap.combo || 0;
    this.matchesInRow = snap.matchesInRow || 0;
    this.helps.undo -= 1;
    this.helpsUsed += 1;
    this.lastCollect = null;
    this.lastMatch = null;
    this.lastHintId = null;
    this.lastUnlock = null;
    this.lastCrack = null;
    return { ok: true };
  }

  shuffle() {
    if (this.status !== 'playing' || this.helps.shuffle <= 0) {
      return { ok: false, reason: this.helps.shuffle <= 0 ? 'empty' : 'state' };
    }
    const remaining = this.tiles.filter((t) => !t.removed);
    if (remaining.length < 3) return { ok: false, reason: 'few' };

    const seed = mixSeed(MASTER_SEED, ((this.level || 1) + 17) * 1009 + this.clicks + remaining.length);
    const rng = mulberry32(seed);
    const bag = remaining.map((t) => ({
      id: t.id,
      type: t.type,
      locked: t.locked,
      isKey: t.isKey,
      keyFor: t.keyFor,
    }));

    let sequence;
    try {
      sequence = buildSequenceFromState(bag, this.tray, rng, this.config.delayMatch);
    } catch {
      return { ok: false, reason: 'seq' };
    }
    const placed = placeRemaining(sequence, rng, this.config);
    const byId = new Map(placed.map((t) => [t.id, t]));
    for (const tile of this.tiles) {
      if (tile.removed) continue;
      const p = byId.get(tile.id);
      if (!p) return { ok: false, reason: 'map' };
      tile.x = p.x;
      tile.y = p.y;
      tile.z = p.z;
    }
    this.officialLeft = sequence.map((t) => t.id);
    this.helps.shuffle -= 1;
    this.helpsUsed += 1;
    this.lastHintId = null;
    this.undoStack = [];
    return { ok: true };
  }

  hint() {
    if (this.status !== 'playing' || this.helps.hint <= 0) {
      return { ok: false, reason: this.helps.hint <= 0 ? 'empty' : 'state' };
    }
    const id = hintTileId(this.tiles, this.tray, this.officialLeft, 80000);
    if (id == null) return { ok: false, reason: 'none' };
    this.helps.hint -= 1;
    this.helpsUsed += 1;
    this.lastHintId = id;
    return { ok: true, id };
  }

  grantHelp(kind) {
    if (!['undo', 'shuffle', 'hint'].includes(kind)) return false;
    this.helps[kind] += 1;
    return true;
  }

  forceLose() {
    if (this.status !== 'playing') return { ok: false };
    const leftovers = this.tiles.filter((t) => !t.removed);
    const tray = [];
    const usedTypes = new Set();
    for (const tile of leftovers) {
      if (usedTypes.has(tile.type)) continue;
      usedTypes.add(tile.type);
      tile.removed = true;
      tile.locked = false;
      tile.ice = 0;
      tray.push({ id: tile.id, type: tile.type });
      if (tray.length === 7) break;
    }
    let dummy = 100;
    while (tray.length < 7) {
      tray.push({ id: -dummy, type: dummy });
      dummy += 1;
    }
    this.tray = tray;
    this.status = 'lost';
    this.endedAt = Date.now();
    return { ok: true };
  }
}

function keyStillRemaining(tile, remaining) {
  if (!tile.locked) return false;
  return remaining.some((t) => t.keyFor === tile.id);
}

function buildSequenceFromState(bag, trayStart, rng, delayMatch) {
  const remaining = bag.slice();
  let tray = trayStart.map((t) => ({ id: t.id, type: t.type }));
  const seq = [];
  const TRAY = 7;
  while (remaining.length) {
    const counts = new Map();
    for (const t of tray) counts.set(t.type, (counts.get(t.type) || 0) + 1);
    const legal = remaining.filter((tile) => {
      if (keyStillRemaining(tile, remaining)) return false;
      const c = counts.get(tile.type) || 0;
      return c >= 2 || tray.length + 1 <= TRAY;
    });
    if (!legal.length) throw new Error('stuck');
    const completers = legal.filter((t) => (counts.get(t.type) || 0) >= 2);
    const space = TRAY - tray.length;
    let pool = legal;
    if (completers.length && (space <= 2 || delayMatch <= 0 || rng() > delayMatch)) pool = completers;
    const tile = pool[Math.floor(rng() * pool.length)];
    remaining.splice(remaining.findIndex((t) => t.id === tile.id), 1);
    seq.push(tile);
    const added = addToTray(tray, tile);
    if (added.lost) throw new Error('overflow');
    tray = added.tray;
  }
  return seq;
}

function placeRemaining(sequence, rng, cfg) {
  const { tileSize, tightness, boardW, boardH } = cfg;
  const placed = [];
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  for (let i = sequence.length - 1; i >= 0; i--) {
    const item = sequence[i];
    let x;
    let y;
    if (placed.length === 0) {
      x = (boardW - tileSize) / 2;
      y = (boardH - tileSize) / 2;
    } else {
      const base = placed[Math.floor(rng() * placed.length)];
      const ang = rng() * Math.PI * 2;
      const dist = tileSize * (0.28 + rng() * (tightness * 0.35 + 0.2));
      x = base.x + Math.cos(ang) * dist;
      y = base.y + Math.sin(ang) * dist;
    }
    x = clamp(x, 2, boardW - tileSize - 2);
    y = clamp(y, 2, boardH - tileSize - 2);
    let z = 0;
    for (const p of placed) {
      const a = { x, y, w: tileSize, h: tileSize };
      const overlap =
        Math.min(a.x + a.w, p.x + p.w) > Math.max(a.x, p.x) &&
        Math.min(a.y + a.h, p.y + p.h) > Math.max(a.y, p.y);
      if (overlap) {
        const w = Math.min(a.x + a.w, p.x + p.w) - Math.max(a.x, p.x);
        const h = Math.min(a.y + a.h, p.y + p.h) - Math.max(a.y, p.y);
        if (w * h >= tileSize * tileSize * 0.14) z = Math.max(z, p.z + 1);
      }
    }
    placed.push({ id: item.id, type: item.type, x, y, z, w: tileSize, h: tileSize, removed: false });
  }
  return placed;
}

export { verifySolution, findSolution, dailyConfig };
