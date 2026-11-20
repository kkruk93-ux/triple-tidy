import { LEVEL_COUNT } from '../js/config.js';
import { generateLevel } from '../js/generator.js';
import { findSolution, verifySolution } from '../js/solver.js';

const nodeLimit = Number(process.env.SOLVER_NODES || 1500000);
let failed = 0;

console.log(`Verifying ${LEVEL_COUNT} Meadow Pile levels (official path + independent solver, limit ${nodeLimit} nodes)…`);

for (let level = 1; level <= LEVEL_COUNT; level++) {
  const started = Date.now();
  let gen;
  try {
    gen = generateLevel(level);
  } catch (err) {
    failed += 1;
    console.error(`L${level} GENERATE FAIL: ${err.message}`);
    continue;
  }
  const check = verifySolution(gen.tiles, gen.solutionIds);
  if (!check.ok) {
    failed += 1;
    console.error(`L${level} OFFICIAL FAIL (${gen.config.tileCount} tiles): ${check.reason}`);
    continue;
  }
  const found = findSolution(gen.tiles, [], nodeLimit);
  const ms = Date.now() - started;
  if (!found.ids) {
    failed += 1;
    console.error(`L${level} official OK but independent solver found no path (${found.nodes} nodes, ${ms}ms)`);
    continue;
  }
  const again = verifySolution(gen.tiles, found.ids);
  if (!again.ok) {
    failed += 1;
    console.error(`L${level} independent path invalid: ${again.reason}`);
    continue;
  }
  const locks = gen.tiles.filter((x) => x.locked).length;
  const keys = gen.tiles.filter((x) => x.isKey).length;
  const hidden = gen.tiles.filter((x) => x.mystery).length;
  const ice = gen.tiles.filter((x) => x.ice > 0).length;
  console.log(
    `L${String(level).padStart(3, '0')} OK  tiles=${String(gen.config.tileCount).padStart(3, ' ')} types=${String(gen.config.types).padStart(2, ' ')} lock=${locks}/${keys} hid=${String(hidden).padStart(2, ' ')} ice=${String(ice).padStart(2, ' ')}  official ${check.steps}  independent ${found.method} ${found.ids.length} / ${found.nodes} nodes  ${ms}ms`
  );
}

if (failed) {
  console.error(`\n${failed} level(s) failed.`);
  process.exit(1);
}
console.log(`\nAll ${LEVEL_COUNT} levels are solvable without helps.`);
