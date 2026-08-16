#!/usr/bin/env node
/**
 * Eval harness v1 — runs G1 probe suites and validates baseline list integrity.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HARNESS_PATH = path.join(ROOT, "data/eval-harness-v1.json");
const BASELINES_PATH = path.join(ROOT, "data/eval-baselines.json");
const REPORT_PATH = path.join(ROOT, "data/g1-run-report.json");

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function main() {
  const harness = readJson(HARNESS_PATH);
  const baselines = readJson(BASELINES_PATH);
  const results = [];

  const alphabetSuite = harness.suites.find((s) => s.id === "alphabet_coverage");
  if (alphabetSuite) {
    const r = spawnSync("node", [path.join(ROOT, "scripts/tokenizer-alphabet-coverage.mjs")], {
      encoding: "utf8",
      cwd: ROOT,
    });
    const alphabetPass = r.status === 0;
    results.push({
      id: "alphabet_coverage",
      gate: "G1",
      pass: alphabetPass,
      exitCode: r.status,
    });
    if (!alphabetPass) {
      console.error(r.stderr || r.stdout);
    }
  }

  const baselineCount = baselines.baselines?.length ?? 0;
  const listedNotRun = baselines.baselines?.filter((b) => b.status === "listed_not_run").length ?? 0;
  const alefbaTarget = baselines.baselines?.find((b) => b.id === "alefba-tokenizer-v1");
  const bloomBaseline = baselines.baselines?.find((b) => b.id === "bloom-560m");
  const alefbaOk =
    alefbaTarget &&
    ["fertility_receipt_hf", "fertility_receipt", "trained"].includes(alefbaTarget.status);
  const bloomRunOk = bloomBaseline?.status === "hf_tokenizer_run";
  const baselineIntegrity =
    baselineCount >= 5 && listedNotRun >= 3 && alefbaOk && bloomRunOk;
  results.push({
    id: "baseline_list_integrity",
    gate: "G1",
    pass: baselineIntegrity,
    baselineCount,
    listedNotRun,
  });

  const orthoPath = path.join(ROOT, "data/eval-probes/orthography-probes.fa.jsonl");
  const orthoExists = fs.existsSync(orthoPath);
  const orthoLines = orthoExists
    ? fs.readFileSync(orthoPath, "utf8").split("\n").filter((l) => l.trim()).length
    : 0;
  results.push({
    id: "orthography_probes_indexed",
    gate: "G2",
    pass: orthoExists && orthoLines >= 5,
    probeLines: orthoLines,
  });

  const allPass = results.every((r) => r.pass);
  const report = {
    harness: harness.name,
    version: harness.version,
    at: new Date().toISOString(),
    results,
    pass: allPass,
    baselinesFile: "data/eval-baselines.json",
    g1Detail: fs.existsSync(REPORT_PATH) ? readJson(REPORT_PATH) : null,
  };

  fs.writeFileSync(path.join(ROOT, "data/eval-harness-report.json"), JSON.stringify(report, null, 2), "utf8");

  console.log(`\nEval harness v1 → ${allPass ? "GREEN" : "RED"}`);
  for (const r of results) {
    console.log(`  ${r.pass ? "PASS" : "FAIL"}  ${r.id}`);
  }
  console.log(`  report → data/eval-harness-report.json`);

  process.exit(allPass ? 0 : 1);
}

main();
