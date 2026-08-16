#!/usr/bin/env node
/** Corpus verify — pipeline validate + inventory integrity */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const r = spawnSync("node", [path.join(ROOT, "scripts/corpus-pipeline-v1.mjs")], {
  encoding: "utf8",
  cwd: ROOT,
});

if (r.stdout) process.stdout.write(r.stdout);
if (r.stderr) process.stderr.write(r.stderr);

if (r.status !== 0) {
  console.error("\nRED  corpus verify failed");
  process.exit(1);
}
console.log("\nGREEN  corpus verify complete");
process.exit(0);
