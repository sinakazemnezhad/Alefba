#!/usr/bin/env node
/**
 * G1 — Alphabet coverage tests against tokenizer-v1-spec + probe corpus.
 * Runs without GPU: validates spec completeness and probe coverage.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SPEC_PATH = path.join(ROOT, "data/tokenizer-v1-spec.json");
const PROBE_PATH = path.join(ROOT, "data/eval-probes/alphabet-probes.fa.jsonl");
const REPORT_PATH = path.join(ROOT, "data/g1-run-report.json");

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function readJsonl(p) {
  return fs
    .readFileSync(p, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => JSON.parse(l));
}

function charFertility(text) {
  const t = text.replace(/\s+/g, "");
  if (!t.length) return 0;
  return t.length;
}

function main() {
  const spec = readJson(SPEC_PATH);
  const probes = readJsonl(PROBE_PATH);
  const requiredLetters = spec.alphabet?.letters || [];
  const corpusText = probes.map((p) => p.text).join("");
  const missingLetters = requiredLetters.filter((ch) => !corpusText.includes(ch));
  const letterCoveragePct =
    requiredLetters.length === 0
      ? 0
      : Math.round(((requiredLetters.length - missingLetters.length) / requiredLetters.length) * 100);

  const zwnj = spec.alphabet?.zwnj || "\u200c";
  const zwnjInCorpus = corpusText.includes(zwnj);

  const joiningForms = ["ب", "پ", "ت", "ث", "ج", "چ", "ح", "خ", "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف", "ق", "ک", "گ", "ل", "م", "ن", "ه", "ی"];
  const missingJoin = joiningForms.filter((ch) => !corpusText.includes(ch));
  const joiningCoveragePct =
    joiningForms.length === 0
      ? 0
      : Math.round(((joiningForms.length - missingJoin.length) / joiningForms.length) * 100);

  const fertilityChars = probes.map((p) => ({
    id: p.id,
    charCount: charFertility(p.text),
  }));
  const avgChars = fertilityChars.reduce((a, x) => a + x.charCount, 0) / fertilityChars.length;

  const passLetter = letterCoveragePct >= (spec.gateCriteria?.alphabetCoveragePct ?? 100);
  const passJoining = joiningCoveragePct >= (spec.gateCriteria?.joiningFormCoveragePct ?? 95);
  const passZwnj = zwnjInCorpus === spec.gateCriteria?.zwnjInVocab;

  const report = {
    suite: "alphabet_coverage",
    gate: "G1",
    at: new Date().toISOString(),
    specVersion: spec.version,
    probeCount: probes.length,
    letterCoveragePct,
    missingLetters,
    joiningFormCoveragePct: joiningCoveragePct,
    missingJoiningForms: missingJoin,
    zwnjInCorpus,
    avgCharsPerProbeLine: Math.round(avgChars * 10) / 10,
    pass: passLetter && passJoining && passZwnj,
    checks: {
      letterCoverage: passLetter,
      joiningForms: passJoining,
      zwnj: passZwnj,
    },
    note: "Probe corpus pass — tokenizer fertility vs baseline requires trained weights + receipt.",
  };

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");

  const mark = report.pass ? "PASS" : "FAIL";
  console.log(`${mark}  G1 alphabet coverage`);
  console.log(`  letters ${letterCoveragePct}% (${missingLetters.length} missing)`);
  console.log(`  joining ${joiningCoveragePct}%`);
  console.log(`  zwnj in corpus: ${zwnjInCorpus}`);
  console.log(`  report → ${REPORT_PATH}`);

  process.exit(report.pass ? 0 : 1);
}

main();
