#!/usr/bin/env node
/** Pre-deploy checklist — run locally before Railway promote */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const steps = [
  ["npm run sync:content", "sync:content"],
  ["npm run train:tokenizer", "train:tokenizer"],
  ["npm run test:g1", "test:g1"],
  ["node scripts/e2e-local.mjs", "e2e"],
];

console.log("Alefbâ ship preflight v0.2.8\n");

let failed = 0;
for (const [cmd, label] of steps) {
  const r = spawnSync(cmd, { shell: true, encoding: "utf8", cwd: ROOT });
  if (r.status !== 0) {
    failed += 1;
    console.error(`RED  ${label}`);
    if (r.stderr) console.error(r.stderr.slice(0, 500));
  } else {
    console.log(`GREEN  ${label}`);
  }
}

if (failed) {
  console.log(`\nBLOCKED  ${failed} step(s) — fix before deploy`);
  process.exit(1);
}

console.log("\nPASS_SHIP_PREFLIGHT");
console.log("Next: push main → green GHA → Railway deploy → ALEFBA_BASE_URL npm run smoke:prod");
