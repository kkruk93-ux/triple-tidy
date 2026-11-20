import { addToTray, cloneTiles, freeTiles, isFree, trayCounts } from './board.js';
import { TRAY_SIZE } from './config.js';

export function verifySolution(tiles, solutionIds) {
  const board = cloneTiles(tiles);
  for (const t of board) t.removed = false;
  let tray = [];
  for (let step = 0; step < solutionIds.length; step++) {
    const id = solutionIds[step];
    const tile = board.find((t) => t.id === id);
    if (!tile || tile.removed) {
      return { ok: false, reason: `Step ${step}: tile ${id} is missing.` };
    }
    if (!isFree(tile, board)) {
      return { ok: false, reason: `Step ${step}: tile ${id} is covered.` };
    }
    tile.removed = true;
    const result = addToTray(tray, tile);
    if (result.lost) {
      return { ok: false, reason: `Step ${step}: tray overflow after tile ${id}.` };
    }
    tray = result.tray;
  }
  if (board.some((t) => !t.removed)) {
    return { ok: false, reason: 'Uncollected tiles remain.' };
  }
  if (tray.length) {
    return { ok: false, reason: `Tray still has ${tray.length} tile(s).` };
  }
  return { ok: true, steps: solutionIds.length };
}

/**
 * Independent search from an arbitrary mid-game state.
 * Returns an array of tile ids, or null if none found within the node budget.
 */
export function findSolution(tiles, tray, nodeLimit = 250000) {
  const board = cloneTiles(tiles);
  const startTray = tray.map((t) => ({ id: t.id, type: t.type }));
  let nodes = 0;

  function scoreMove(tile, boardNow, counts, trayLen) {
    const c = counts.get(tile.type) || 0;
    if (c < 2 && trayLen + 1 >= TRAY_SIZE) return -Infinity;
    let score = 0;
    if (c >= 2) score = 400;
    else if (c === 1) score = 90;
    else score = 16 - trayLen * 3;
    tile.removed = true;
    let uncover = 0;
    for (const o of boardNow) {
      if (!o.removed && o.id !== tile.id && isFree(o, boardNow)) uncover += 1;
    }
    tile.removed = false;
    return score + uncover * 5;
  }

  function rec(trayNow) {
    if (++nodes > nodeLimit) return null;
    if (board.every((t) => t.removed)) return [];
    const free = freeTiles(board);
    if (!free.length) return null;
    const counts = trayCounts(trayNow);
    const ranked = free
      .map((tile) => ({ tile, score: scoreMove(tile, board, counts, trayNow.length) }))
      .filter((x) => x.score !== -Infinity)
      .sort((a, b) => b.score - a.score);
    if (!ranked.length) return null;

    const completers = ranked.filter((x) => (counts.get(x.tile.type) || 0) >= 2);
    const order = completers.length ? completers.concat(ranked.filter((x) => (counts.get(x.tile.type) || 0) < 2)) : ranked;

    for (const { tile } of order) {
      tile.removed = true;
      const result = addToTray(trayNow, tile);
      if (result.lost) {
        tile.removed = false;
        continue;
      }
      const rest = rec(result.tray);
      if (rest) {
        const id = tile.id;
        tile.removed = false;
        return [id, ...rest];
      }
      tile.removed = false;
    }
    return null;
  }

  const path = rec(startTray);
  return path ? { ids: path, nodes } : { ids: null, nodes };
}

/** First safe collect from the current state (for the Hint button). */
export function hintTileId(tiles, tray, officialRemainder, nodeLimit = 40000) {
  if (officialRemainder && officialRemainder.length) {
    const nextId = officialRemainder[0];
    const tile = tiles.find((t) => t.id === nextId && !t.removed);
    if (tile && isFree(tile, tiles)) {
      const probe = addToTray(tray, tile);
      if (!probe.lost) return nextId;
    }
  }
  const found = findSolution(tiles, tray, nodeLimit);
  return found.ids ? found.ids[0] : null;
}
