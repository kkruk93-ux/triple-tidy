import { addToTray, applyKey, canTap, cloneTiles, freeTiles, isFree, trayCounts } from './board.js';
import { TRAY_SIZE } from './config.js';

function prepCollect(board, tile) {
  if (tile.ice > 1) {
    tile.ice -= 1;
    return { cracked: true };
  }
  tile.removed = true;
  if (tile.isKey) applyKey(board, tile);
  return { cracked: false };
}

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
    if (tile.locked) {
      return { ok: false, reason: `Step ${step}: tile ${id} is still locked.` };
    }
    if (tile.ice > 1) {
      // Official path may include the collect only; cracking is free and required first.
      tile.ice = 1;
    }
    tile.removed = true;
    if (tile.isKey) applyKey(board, tile);
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

function legalMoves(board, tray) {
  const free = freeTiles(board);
  const counts = trayCounts(tray);
  const moves = [];
  for (const tile of free) {
    if (tile.locked) continue;
    if (tile.ice > 1) {
      moves.push({ tile, kind: 'crack', complete: false, progress: false, layer: tile.z, scoreBoost: 20 });
      continue;
    }
    const c = counts.get(tile.type) || 0;
    if (c < 2 && tray.length + 1 >= TRAY_SIZE) continue;
    moves.push({
      tile,
      kind: 'collect',
      complete: c >= 2,
      progress: c === 1,
      layer: tile.z,
      isKey: !!tile.isKey,
      scoreBoost: tile.isKey ? 50 : 0,
    });
  }
  moves.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === 'crack' ? -1 : 1;
    if (a.complete !== b.complete) return a.complete ? -1 : 1;
    if (a.isKey !== b.isKey) return a.isKey ? -1 : 1;
    if (a.progress !== b.progress) return a.progress ? -1 : 1;
    return b.layer - a.layer;
  });
  return moves;
}

function greedyPath(startTiles, startTray) {
  const board = cloneTiles(startTiles);
  let tray = startTray.map((t) => ({ id: t.id, type: t.type }));
  const ids = [];
  let guard = 0;
  const limit = board.length * 3 + 8;
  while (board.some((t) => !t.removed)) {
    if (++guard > limit) return null;
    const moves = legalMoves(board, tray);
    if (!moves.length) return null;
    const { tile, kind } = moves[0];
    if (kind === 'crack') {
      tile.ice -= 1;
      continue;
    }
    tile.removed = true;
    if (tile.isKey) applyKey(board, tile);
    const result = addToTray(tray, tile);
    if (result.lost) {
      tile.removed = false;
      return null;
    }
    tray = result.tray;
    ids.push(tile.id);
  }
  return ids;
}

/**
 * Independent search from an arbitrary mid-game state.
 * Tries a greedy path first, then backtracking with a node budget.
 */
export function findSolution(tiles, tray, nodeLimit = 800000) {
  const greedy = greedyPath(tiles, tray);
  if (greedy) {
    const check = verifySolution(tiles, greedy);
    if (check.ok) return { ids: greedy, nodes: greedy.length, method: 'greedy' };
  }

  const board = cloneTiles(tiles);
  const startTray = tray.map((t) => ({ id: t.id, type: t.type }));
  let nodes = 0;

  function rec(trayNow) {
    if (++nodes > nodeLimit) return null;
    if (board.every((t) => t.removed)) return [];
    const moves = legalMoves(board, trayNow);
    if (!moves.length) return null;
    for (const { tile, kind } of moves) {
      if (kind === 'crack') {
        tile.ice -= 1;
        const rest = rec(trayNow);
        if (rest) {
          tile.ice += 1;
          return rest;
        }
        tile.ice += 1;
        continue;
      }
      tile.removed = true;
      const unlocked = tile.isKey ? board.find((t) => t.id === tile.keyFor) : null;
      const prevLocked = unlocked ? unlocked.locked : false;
      if (tile.isKey) applyKey(board, tile);
      const result = addToTray(trayNow, tile);
      if (result.lost) {
        tile.removed = false;
        if (unlocked) unlocked.locked = prevLocked;
        continue;
      }
      const rest = rec(result.tray);
      if (rest) {
        const id = tile.id;
        tile.removed = false;
        if (unlocked) unlocked.locked = prevLocked;
        return [id, ...rest];
      }
      tile.removed = false;
      if (unlocked) unlocked.locked = prevLocked;
    }
    return null;
  }

  const path = rec(startTray);
  return path ? { ids: path, nodes, method: 'search' } : { ids: null, nodes, method: 'search' };
}

/** First safe collect from the current state (for the Hint button). */
export function hintTileId(tiles, tray, officialRemainder, nodeLimit = 80000) {
  if (officialRemainder && officialRemainder.length) {
    const nextId = officialRemainder[0];
    const tile = tiles.find((t) => t.id === nextId && !t.removed);
    if (tile && canTap(tile, tiles)) return nextId;
  }
  const found = findSolution(tiles, tray, nodeLimit);
  return found.ids ? found.ids[0] : null;
}
