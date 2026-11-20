import { LEVEL_COUNT } from '../js/config.js';
import { generateLevel } from '../js/generator.js';
import { findSolution, verifySolution } from '../js/solver.js';

const independentUntil = Number(process.env.INDEPENDENT_UNTIL || 12);
let failed = 0;

console.log(`Verifying ${LEVEL_COUNT} Triple Tidy levels (official solution + independent solver on 1–${independentUntil})…`);

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
  const ms = Date.now() - started;
  if (!check.ok) {
    failed += 1;
    console.error(`L${level} FAIL (${gen.config.tileCount} tiles): ${check.reason}`);
    continue;
  }
  let indie = 'skipped';
  if (level <= independentUntil) {
    const found = findSolution(gen.tiles, [], 400000);
    if (!found.ids) {
      failed += 1;
      console.error(`L${level} official OK but independent solver found no path (${found.nodes} nodes)`);
      continue;
    }
    const again = verifySolution(gen.tiles, found.ids);
    if (!again.ok) {
      failed += 1;
      console.error(`L${level} independent path invalid: ${again.reason}`);
      continue;
    }
    indie = `independent ${found.ids.length} moves / ${found.nodes} nodes`;
  }
  console.log(
    `L${String(level).padStart(2, '0')} OK  tiles=${String(gen.config.tileCount).padStart(3, ' ')} types=${String(gen.config.types).padStart(2, ' ')}  official ${check.steps}  ${indie}  ${ms}ms`
  );
}

if (failed) {
  console.error(`\n${failed} level(s) failed.`);
  process.exit(1);
}
console.log(`\nAll ${LEVEL_COUNT} levels are solvable.`);
