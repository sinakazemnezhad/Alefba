#!/usr/bin/env node
/** G1 verify — tokenizer spec + alphabet coverage + eval harness v1 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const steps = [
  ["tokenizer-train-v1.mjs", "Tokenizer train v1"],
  ["tokenizer-fertility-v1.mjs", "Tokenizer fertility v1"],
  ["tokenizer-fertility-hf-baseline.mjs", "HF baseline fertility"],
  ["tokenizer-alphabet-coverage.mjs", "G1 alphabet"],
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
  console.log(`\nRED  G1 verify — ${failed} step(s) failed`);
  process.exit(1);
}
console.log("\nGREEN  G1 verify complete");
process.exit(0);
