#!/usr/bin/env node
/** Sync governance SSOT snippets → content-manifest.json (merge-safe) */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const GOV = path.resolve(ROOT, "../governance");
const OUT = path.join(ROOT, "data/content-manifest.json");
const ALEFBA_JSON = path.resolve(ROOT, "../ALEFBA.json");

const DEFAULT_REFERENCES = [
  "Kaplan et al. 2020 — scaling laws",
  "Hoffmann et al. 2022 — Chinchilla",
  "Workshop et al. 2022 — BLOOM 176B",
  "Rust et al. 2021 — tokenizer fertility",
  "Rafailov et al. 2023 — DPO",
  "Zeng et al. 2022 — GLM-130B",
  "Kudo & Richardson 2018 — SentencePiece",
];

function extractPatternLaw(md) {
  const keep = md.match(/\*\*We keep:\*\*[^\n]+/);
  const change = md.match(/\*\*We change:\*\*[^\n]+/);
  if (!keep || !change) return null;
  const en = `${keep[0].replace(/\*\*/g, "").trim()}; ${change[0].replace(/\*\*/g, "").trim()}`;
  return {
    en: en.replace("We keep: Latin factory.", "Keep Latin factory").replace("We change:", "change"),
    fa: "کارخانهٔ لاتین بماند؛ در · باران · زیان · ارزیابی فارسی شود.",
  };
}

function readExisting() {
  try {
    return JSON.parse(fs.readFileSync(OUT, "utf8"));
  } catch {
    return {};
  }
}

function main() {
  const wp = fs.readFileSync(path.join(GOV, "WHITE_PAPER.md"), "utf8");
  const alefba = JSON.parse(fs.readFileSync(ALEFBA_JSON, "utf8"));
  const existing = readExisting();
  const patternLaw = extractPatternLaw(wp);

  const manifest = {
    ...existing,
    version: alefba.version || existing.version || "0.2.8",
    generatedAt: new Date().toISOString(),
    sources: [
      "ALEFBA/governance/WHITE_PAPER.md",
      "ALEFBA/governance/COMMERCIAL_SCIENTIFIC_PLAN.md",
      "ALEFBA/governance/CONCEPT_BRIEF.md",
    ],
    patternLaw: patternLaw || existing.patternLaw || {
      en: "Keep Latin factory; change door · rain · loss · eval to Persian.",
      fa: "کارخانهٔ لاتین بماند؛ در · باران · زیان · ارزیابی فارسی شود.",
    },
    epigraph: existing.epigraph || {
      en: "Math guesses; books teach; time makes it smarter.",
      fa: "ریاضی حدس می‌زند؛ کتاب یاد می‌دهد؛ زمان هوشمندتر می‌کند.",
    },
    gates: existing.gates || ["G1 Tokenizer", "G2 Base", "G3 Instruct", "G4 Product"],
    fundSplit: existing.fundSplit || { gpu: 42, corpus: 28, raters: 18, ops: 12 },
    references: Array.isArray(existing.references) && existing.references.length >= 7
      ? existing.references
      : DEFAULT_REFERENCES,
  };

  fs.writeFileSync(OUT, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`Wrote ${OUT} v${manifest.version}`);
}

main();
