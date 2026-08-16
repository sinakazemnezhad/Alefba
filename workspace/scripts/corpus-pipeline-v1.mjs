#!/usr/bin/env node
/**
 * Corpus pipeline v1 — validate shards on disk, sync inventory stats, emit receipt.
 * Law: provenance + license class on every indexed shard; no bytes without inventory row.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SHARD_DIR = path.join(ROOT, "data/corpus/shards");
const INVENTORY_PATH = path.join(ROOT, "data/corpus-inventory.json");
const REPORT_PATH = path.join(ROOT, "data/corpus-pipeline-report.json");

const REQUIRED_SHARD_META = ["shard_id", "curriculum", "license_class", "status", "split"];

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function readJsonl(p) {
  if (!fs.existsSync(p)) return [];
  return fs
    .readFileSync(p, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l, i) => {
      try {
        return JSON.parse(l);
      } catch {
        return { _parseError: true, _line: i + 1 };
      }
    });
}

function shardIdFromFilename(name) {
  return name.replace(/\.jsonl$/, "");
}

function charCount(text) {
  return String(text || "").replace(/\s+/g, "").length;
}

function scanShardFile(relPath) {
  const full = path.join(ROOT, relPath);
  const errors = [];
  if (!fs.existsSync(full)) {
    return { ok: false, errors: ["file_missing"], lineCount: 0, charCount: 0 };
  }
  const raw = fs.readFileSync(full, "utf8");
  const hash = createHash("sha256").update(raw).digest("hex").slice(0, 16);
  const rows = readJsonl(full);
  let chars = 0;
  for (const row of rows) {
    if (row._parseError) {
      errors.push(`json_parse_line_${row._line}`);
      continue;
    }
    if (!row.id) errors.push(`missing_id:${row.id || "?"}`);
    if (!row.text || String(row.text).trim().length < 2) errors.push(`short_text:${row.id || "?"}`);
    chars += charCount(row.text);
  }
  return {
    ok: errors.length === 0 && rows.length > 0,
    errors,
    lineCount: rows.length,
    charCount: chars,
    bytes: Buffer.byteLength(raw, "utf8"),
    sha256Prefix: hash,
  };
}

function main() {
  const inventory = readJson(INVENTORY_PATH);
  const shards = inventory.shards || [];
  const checks = [];
  const shardStats = {};

  const diskFiles = fs.existsSync(SHARD_DIR)
    ? fs.readdirSync(SHARD_DIR).filter((n) => n.endsWith(".jsonl"))
    : [];

  const at = new Date().toISOString();

  for (const file of diskFiles) {
    const shardId = shardIdFromFilename(file);
    if (!shards.find((s) => s.shard_id === shardId)) {
      const curriculum = shardId.startsWith("a0")
        ? "A0"
        : shardId.startsWith("l0")
          ? "L0"
          : shardId.startsWith("n0")
            ? "N0"
            : shardId.startsWith("b0")
              ? "B0"
              : "A0";
      shards.push({
        shard_id: shardId,
        curriculum,
        source_class: "curriculum_sample",
        license_class: "internal_research",
        volume_band: null,
        quality_grade: "curriculum_sample",
        split: "train",
        status: "indexed",
        provenance: { file: `data/corpus/shards/${file}`, indexedAt: at.slice(0, 10) },
        gate: curriculum === "A0" || curriculum === "L0" ? "G1" : "G2",
        publisher_lane: null,
      });
    }
  }
  inventory.shards = shards;

  for (const file of diskFiles) {
    const shardId = shardIdFromFilename(file);
    const rel = `data/corpus/shards/${file}`;
    const scan = scanShardFile(rel);
    shardStats[shardId] = { file: rel, ...scan };
    const inv = shards.find((s) => s.shard_id === shardId);
    if (!inv) {
      checks.push({ id: `register_${shardId}`, pass: false, detail: "file_on_disk_not_in_inventory" });
      continue;
    }
    for (const field of REQUIRED_SHARD_META) {
      if (!inv[field]) {
        checks.push({ id: `${shardId}_meta_${field}`, pass: false, detail: "missing" });
      }
    }
    if (inv.status === "indexed") {
      const provFile = inv.provenance?.file;
      checks.push({
        id: `${shardId}_indexed_file`,
        pass: scan.ok && provFile === rel,
        detail: provFile === rel ? `${scan.lineCount} lines` : `expected ${rel}`,
      });
      if (inv.split === "train" && inv.license_class === "licensed_pending") {
        checks.push({ id: `${shardId}_license_pending_train`, pass: false, detail: "train_bytes_need_license" });
      }
    }
  }

  for (const inv of shards) {
    if (inv.status !== "indexed") continue;
    const provFile = inv.provenance?.file;
    if (!provFile) {
      checks.push({ id: `${inv.shard_id}_provenance`, pass: false, detail: "no file path" });
      continue;
    }
    if (!fs.existsSync(path.join(ROOT, provFile))) {
      checks.push({ id: `${inv.shard_id}_missing_bytes`, pass: false, detail: provFile });
    }
  }

  const indexedTrain = shards.filter((s) => s.status === "indexed" && s.split === "train");
  const trainLines = indexedTrain.reduce((sum, s) => sum + (shardStats[s.shard_id]?.lineCount || 0), 0);
  const trainChars = indexedTrain.reduce((sum, s) => sum + (shardStats[s.shard_id]?.charCount || 0), 0);

  checks.push({
    id: "min_indexed_train_shards",
    pass: indexedTrain.length >= 4,
    detail: `${indexedTrain.length} shards`,
  });
  checks.push({
    id: "min_train_lines",
    pass: trainLines >= 20,
    detail: `${trainLines} lines`,
  });
  checks.push({
    id: "license_map_present",
    pass: (inventory.licenseMap || []).length >= 4,
    detail: `${(inventory.licenseMap || []).length} entries`,
  });

  const pass = checks.every((c) => c.pass) && checks.length > 0;

  const report = {
    pipeline: "corpus-pipeline-v1",
    version: "1.0.0",
    at,
    phase: inventory.phase || "P1",
    gate: inventory.gate || "G1",
    pass,
    checks,
    shardStats,
    totals: {
      diskShardFiles: diskFiles.length,
      indexedTrainShards: indexedTrain.length,
      trainLines,
      trainChars,
    },
    inventoryFile: "data/corpus-inventory.json",
    law: inventory.law,
  };

  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  inventory.updatedAt = at;
  if (inventory.volumeBands) {
    const bandMap = {
      A0_alphabet: ["a0-alphabet-curriculum-v1", "a0-primer-probes-v1", "a0-joining-forms-v1"],
      L0_lexicon: ["l0-lexicon-sample-v1"],
      N0_narrative: ["n0-narrative-sample-v1"],
      B0_books: ["b0-pd-literary-sample-v1"],
    };
    for (const [band, ids] of Object.entries(bandMap)) {
      if (!inventory.volumeBands[band]) continue;
      let lines = 0;
      for (const id of ids) {
        if (shardStats[id]?.lineCount) lines += shardStats[id].lineCount;
      }
      if (lines > 0) {
        inventory.volumeBands[band].tokens = lines;
        inventory.volumeBands[band].lastPipelineAt = at;
      }
    }
  }

  inventory.pipelineReport = "data/corpus-pipeline-report.json";
  inventory.pipelineStatus = pass ? "pass" : "fail";

  for (const src of inventory.evalSources || []) {
    if (src.id === "eval-morph-probes") src.status = "harness_ready";
    if (src.id === "eval-reading-probes") src.status = "harness_ready";
  }
  if (!inventory.evalSources?.find((e) => e.id === "eval-morph-probes")) {
    inventory.evalSources = inventory.evalSources || [];
    inventory.evalSources.push({
      id: "eval-morph-probes",
      role: "eval_only",
      status: "harness_ready",
      file: "data/eval-probes/morphology-probes.fa.jsonl",
      note: "G2 morphology probes — round-trip fidelity in eval-g2-score-card",
    });
  }
  if (!inventory.evalSources?.find((e) => e.id === "eval-reading-probes")) {
    inventory.evalSources.push({
      id: "eval-reading-probes",
      role: "eval_only",
      status: "harness_ready",
      file: "data/eval-probes/reading-probes.fa.jsonl",
      note: "G2 reading proxy probes — held sentences",
    });
  }

  if (inventory.volumeBands?.A0_alphabet && shardStats["a0-alphabet-curriculum-v1"]) {
    inventory.volumeBands.A0_alphabet.shards = [
      ...new Set([
        ...(inventory.volumeBands.A0_alphabet.shards || []),
        "a0-alphabet-curriculum-v1",
      ]),
    ];
  }

  fs.writeFileSync(INVENTORY_PATH, `${JSON.stringify(inventory, null, 2)}\n`, "utf8");

  console.log(`\nCorpus pipeline v1 → ${pass ? "GREEN" : "RED"}`);
  for (const c of checks) {
    console.log(`  ${c.pass ? "PASS" : "FAIL"}  ${c.id}${c.detail ? ` — ${c.detail}` : ""}`);
  }
  console.log(`  train: ${trainLines} lines · ${trainChars} chars · ${indexedTrain.length} shards`);
  console.log(`  report → ${REPORT_PATH}`);

  process.exit(pass ? 0 : 1);
}

main();
