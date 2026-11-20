import { TRAY_SIZE } from './config.js';

export const TILE_OVERLAP = 0.14;

export function rectsOverlap(a, b, minFrac = TILE_OVERLAP) {
  const x0 = Math.max(a.x, b.x);
  const y0 = Math.max(a.y, b.y);
  const x1 = Math.min(a.x + a.w, b.x + b.w);
  const y1 = Math.min(a.y + a.h, b.y + b.h);
  const w = x1 - x0;
  const h = y1 - y0;
  if (w <= 0 || h <= 0) return false;
  const area = w * h;
  const minArea = Math.min(a.w * a.h, b.w * b.h) * minFrac;
  return area >= minArea;
}

export function isFree(tile, tiles, minFrac = TILE_OVERLAP) {
  if (tile.removed) return false;
  for (const other of tiles) {
    if (other.removed || other.id === tile.id) continue;
    if (other.z > tile.z && rectsOverlap(tile, other, minFrac)) return false;
  }
  return true;
}

export function isRevealed(tile, tiles) {
  if (!tile.mystery) return true;
  if (tile.locked) return false;
  return isFree(tile, tiles);
}

export function canTap(tile, tiles) {
  return isFree(tile, tiles) && !tile.locked;
}

export function freeTiles(tiles) {
  return tiles.filter((t) => isFree(t, tiles));
}

export function tappableTiles(tiles) {
  return tiles.filter((t) => canTap(t, tiles));
}

/** Insert beside the same type when present; clear three of a kind. */
export function addToTray(tray, tile) {
  const next = tray.slice();
  let lastSame = -1;
  for (let i = 0; i < next.length; i++) {
    if (next[i].type === tile.type) lastSame = i;
  }
  const guest = { id: tile.id, type: tile.type };
  if (lastSame >= 0) next.splice(lastSame + 1, 0, guest);
  else next.push(guest);

  let same = 0;
  for (const t of next) if (t.type === tile.type) same += 1;
  if (same >= 3) {
    const matched = [];
    let left = 3;
    for (let i = next.length - 1; i >= 0 && left > 0; i--) {
      if (next[i].type === tile.type) {
        matched.push(next[i]);
        next.splice(i, 1);
        left -= 1;
      }
    }
    return { tray: next, matched, lost: false };
  }
  return { tray: next, matched: null, lost: next.length >= TRAY_SIZE };
}

export function trayCounts(tray) {
  const counts = new Map();
  for (const t of tray) counts.set(t.type, (counts.get(t.type) || 0) + 1);
  return counts;
}

export function cloneTiles(tiles) {
  return tiles.map((t) => ({
    id: t.id,
    type: t.type,
    x: t.x,
    y: t.y,
    z: t.z,
    w: t.w,
    h: t.h,
    removed: !!t.removed,
    locked: !!t.locked,
    isKey: !!t.isKey,
    keyFor: t.keyFor || 0,
    mystery: !!t.mystery,
    ice: t.ice | 0,
  }));
}

export function applyKey(tiles, keyTile) {
  if (!keyTile || !keyTile.keyFor) return null;
  const target = tiles.find((t) => t.id === keyTile.keyFor);
  if (target) target.locked = false;
  return target || null;
}
