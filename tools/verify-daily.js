import { generateDaily } from '../js/generator.js';
import { findSolution, verifySolution } from '../js/solver.js';
import { todayISO, shiftISO } from '../js/config.js';

const start = process.env.DAILY_START || '2026-11-01';
const days = Number(process.env.DAILY_DAYS || 60);
const nodeLimit = Number(process.env.SOLVER_NODES || 1500000);
let failed = 0;
let iso = start;
console.log(`Verifying ${days} Daily Puzzle boards from ${start}…`);
for (let i = 0; i < days; i++) {
  const started = Date.now();
  let gen;
  try {
    gen = generateDaily(iso);
  } catch (err) {
    failed += 1;
    console.error(`${iso} GENERATE FAIL: ${err.message}`);
    iso = shiftISO(iso, 1);
    continue;
  }
  const official = verifySolution(gen.tiles, gen.solutionIds);
  const found = findSolution(gen.tiles, [], nodeLimit);
  const ms = Date.now() - started;
  if (!official.ok || !found.ids) {
    failed += 1;
    console.error(`${iso} FAIL official=${official.ok} independent=${!!found.ids} ${official.reason || ''} ${ms}ms`);
  } else {
    const locks = gen.tiles.filter((t) => t.locked).length;
    const hidden = gen.tiles.filter((t) => t.mystery).length;
    const ice = gen.tiles.filter((t) => t.ice).length;
    console.log(`${iso} OK  ${gen.config.world.id} tiles=${gen.config.tileCount} lock=${locks} hid=${hidden} ice=${ice}  ${found.method} ${ms}ms`);
  }
  iso = shiftISO(iso, 1);
}
const today = todayISO();
const gen = generateDaily(today);
const official = verifySolution(gen.tiles, gen.solutionIds);
const found = findSolution(gen.tiles, [], nodeLimit);
if (!official.ok || !found.ids) {
  failed += 1;
  console.error(`TODAY ${today} FAIL`);
} else {
  console.log(`TODAY ${today} OK`);
}
if (failed) {
  console.error(`\n${failed} daily board(s) failed.`);
  process.exit(1);
}
console.log(`\nAll ${days} daily boards plus today are solvable.`);
