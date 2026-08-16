#!/usr/bin/env node
/** G2 verify — orthography/morph/reading proxy score card vs BLOOM-560m HF */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const steps = [
  ["eval-g2-score-card.mjs", "G2 score card eval"],
  ["eval-harness-v1.mjs", "Eval harness v1"],
];

let failed = 0;
for (const [script, label] of steps) {
  const r = spawnSync("node", [path.join(ROOT, "scripts", script)], { encoding: "utf8", cwd: ROOT });
  if (r.status !== 0) {
    failed += 1;
    console.error(`FAIL  ${label}`);
    if (r.stderr) console.error(r.stderr);
  } else {
    console.log(`PASS  ${label}`);
  }
}

if (failed) {
  console.log(`\nRED  G2 verify — ${failed} step(s) failed`);
  process.exit(1);
}
console.log("\nGREEN  G2 verify complete");
process.exit(0);
