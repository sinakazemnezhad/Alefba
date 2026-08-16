#!/usr/bin/env node
/** Spawn G2 score card eval (Python + transformers). */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const script = path.join(path.dirname(fileURLToPath(import.meta.url)), "eval-g2-score-card.py");
const r = spawnSync("python3", [script], {
  encoding: "utf8",
  cwd: path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."),
});

if (r.stdout) process.stdout.write(r.stdout);
if (r.stderr) process.stderr.write(r.stderr);

process.exit(r.status === 0 ? 0 : 1);
