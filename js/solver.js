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

function legalMoves(board, tray) {
  const free = freeTiles(board);
  const counts = trayCounts(tray);
  const moves = [];
  for (const tile of free) {
    const c = counts.get(tile.type) || 0;
    if (c < 2 && tray.length + 1 >= TRAY_SIZE) continue;
    moves.push({ tile, complete: c >= 2, progress: c === 1, layer: tile.z });
  }
  moves.sort((a, b) => {
    if (a.complete !== b.complete) return a.complete ? -1 : 1;
    if (a.progress !== b.progress) return a.progress ? -1 : 1;
    return b.layer - a.layer;
  });
  return moves;
}

function applyMove(board, tray, tile) {
  tile.removed = true;
  return addToTray(tray, tile);
}

function greedyPath(startTiles, startTray) {
  const board = cloneTiles(startTiles);
  let tray = startTray.map((t) => ({ id: t.id, type: t.type }));
  const ids = [];
  while (board.some((t) => !t.removed)) {
    const moves = legalMoves(board, tray);
    if (!moves.length) return null;
    const tile = moves[0].tile;
    const result = applyMove(board, tray, tile);
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
    // Prefer completing matches, but still try other legal moves if those fail.
    for (const { tile } of moves) {
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
  return path ? { ids: path, nodes, method: 'search' } : { ids: null, nodes, method: 'search' };
}

/** First safe collect from the current state (for the Hint button). */
export function hintTileId(tiles, tray, officialRemainder, nodeLimit = 80000) {
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
