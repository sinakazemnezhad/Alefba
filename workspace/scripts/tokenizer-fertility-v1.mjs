#!/usr/bin/env node
/**
 * G1 fertility receipt — Alefbâ tokenizer v1 vs named baseline proxies on FA probes.
 * Output: data/g1-tokenizer-receipt.json (spec receiptArtifact)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SPEC_PATH = path.join(ROOT, "data/tokenizer-v1-spec.json");
const MODEL_PATH = path.join(ROOT, "data/tokenizer-v1-model.json");
const BASELINES_PATH = path.join(ROOT, "data/eval-baselines.json");
const PROBE_PATH = path.join(ROOT, "data/eval-probes/alphabet-probes.fa.jsonl");
const ORTHO_PATH = path.join(ROOT, "data/eval-probes/orthography-probes.fa.jsonl");
const RECEIPT_PATH = path.join(ROOT, "data/g1-tokenizer-receipt.json");
const RECEIPTS_PATH = path.join(ROOT, "data/receipts.json");

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
    .map((l) => JSON.parse(l));
}

function charCount(text) {
  return String(text || "").replace(/\s+/g, "").length;
}

function buildVocabMap(model) {
  const map = new Map();
  for (let i = 0; i < model.idToToken.length; i++) {
    map.set(model.idToToken[i], i);
  }
  return map;
}

function encodeWordAware(text, vocab) {
  const unk = vocab.get("<unk>") ?? 0;
  const zwnjId = vocab.get("<zwnj>") ?? unk;
  const tokens = [];
  const parts = String(text).split(/(\s+|[،؛؟!.«»\-—…]+)/);
  for (const part of parts) {
    if (!part) continue;
    if (part === "\u200c") {
      tokens.push(zwnjId);
      continue;
    }
    if (/^\s+$/.test(part)) {
      continue;
    }
    if (vocab.has(part)) {
      tokens.push(vocab.get(part));
      continue;
    }
    tokens.push(...encodeGreedy(part, vocab));
  }
  return tokens;
}

function encodeGreedy(text, vocab) {
  const unk = vocab.get("<unk>") ?? 0;
  const zwnjId = vocab.get("<zwnj>") ?? unk;
  const tokens = [];
  let i = 0;
  const s = String(text);
  while (i < s.length) {
    if (s[i] === "\u200c") {
      tokens.push(zwnjId);
      i += 1;
      continue;
    }
    if (s[i] === " ") {
      i += 1;
      continue;
    }
    let matched = null;
    for (let len = Math.min(24, s.length - i); len >= 1; len--) {
      const piece = s.slice(i, i + len);
      if (vocab.has(piece)) {
        matched = piece;
        break;
      }
    }
    if (matched) {
      tokens.push(vocab.get(matched));
      i += matched.length;
    } else {
      tokens.push(vocab.get(s[i]) ?? unk);
      i += 1;
    }
  }
  return tokens;
}

function latinSubwordProxyEncode(text) {
  const tokens = [];
  const s = String(text).replace(/\s+/g, "");
  for (let i = 0; i < s.length; i += 2) {
    tokens.push(s.slice(i, i + 2));
  }
  return tokens.length || 1;
}

function fertilityOnProbes(probes, encodeFn) {
  let chars = 0;
  let tokens = 0;
  for (const p of probes) {
    chars += charCount(p.text);
    const n = typeof encodeFn === "function" ? encodeFn(p.text) : encodeFn;
    tokens += n;
  }
  return {
    probeCount: probes.length,
    totalChars: chars,
    totalTokens: tokens,
    charsPerToken: tokens > 0 ? Math.round((chars / tokens) * 1000) / 1000 : 0,
  };
}

function modelHash(model) {
  return createHash("sha256").update(JSON.stringify(model.idToToken)).digest("hex").slice(0, 16);
}

function main() {
  if (!fs.existsSync(MODEL_PATH)) {
    console.error("RED  tokenizer model missing — run tokenizer-train-v1.mjs first");
    process.exit(1);
  }

  const spec = readJson(SPEC_PATH);
  const model = readJson(MODEL_PATH);
  const baselines = readJson(BASELINES_PATH);
  const probes = [...readJsonl(PROBE_PATH), ...readJsonl(ORTHO_PATH)];
  const fertilityProbes = probes.filter(
    (p) => !p.tags?.includes("full_alphabet_row") && p.id !== "a01"
  );
  const vocab = buildVocabMap(model);

  const alefba = fertilityOnProbes(fertilityProbes, (t) => encodeWordAware(t, vocab).length);
  const latinProxy = fertilityOnProbes(fertilityProbes, (t) => latinSubwordProxyEncode(t));
  const bloomProxyCpt = 2.05;
  const bloomTokens = Math.ceil(alefba.totalChars / bloomProxyCpt);
  const bloom = {
    baselineId: "bloom-560m",
    huggingfaceId: "bigscience/bloom-560m",
    method: "published_proxy_chars_per_token",
    charsPerToken: bloomProxyCpt,
    totalChars: alefba.totalChars,
    totalTokens: bloomTokens,
    note: "Proxy from multilingual thin-slice posture — not a live HF run in this harness",
  };

  const beatsLatin = alefba.charsPerToken > latinProxy.charsPerToken;
  const beatsBloomProxy = alefba.charsPerToken >= bloomProxyCpt;
  const pass = beatsLatin && beatsBloomProxy;

  const receipt = {
    gate: "G1",
    suite: "tokenizer_fertility",
    at: new Date().toISOString(),
    specVersion: spec.version,
    modelId: "alefba-tokenizer-v1",
    modelHash: modelHash(model),
    metric: "characters_per_token",
    alefba,
    fertilityProbeCount: fertilityProbes.length,
    excludedProbeIds: ["a01"],
    excludedReason: "full_alphabet_row display probe — not used for chars/token fertility",
    baselines: {
      latin_subword_proxy: latinProxy,
      bloom_560m_proxy: bloom,
    },
    compare: {
      beatsLatinSubwordProxy: beatsLatin,
      beatsBloom560mProxy: beatsBloomProxy,
      targetFromSpec: spec.fertility?.targetVsBloom560m || "lower_or_equal_chars_per_token_on_fa_probes",
    },
    pass,
    note: pass
      ? "Fertility receipt on held probes — G1 probe + fertility criteria met for research tokenizer v1."
      : "Fertility below baseline proxy — gate remains open.",
  };

  fs.writeFileSync(RECEIPT_PATH, JSON.stringify(receipt, null, 2), "utf8");

  const bl = baselines.baselines || [];
  const target = bl.find((b) => b.id === "alefba-tokenizer-v1");
  if (target) {
    target.status = pass ? "fertility_receipt" : "trained";
    target.charsPerToken = alefba.charsPerToken;
    target.modelHash = receipt.modelHash;
    fs.writeFileSync(BASELINES_PATH, JSON.stringify(baselines, null, 2), "utf8");
  }

  if (fs.existsSync(RECEIPTS_PATH)) {
    const receipts = readJson(RECEIPTS_PATH);
    const g1 = receipts.gates?.find((g) => g.id === "G1");
    if (g1) {
      g1.status = pass ? "in_progress" : "pending";
      g1.probeStatus = pass ? "fertility_receipt" : "harness_ready";
      g1.fertilityReceipt = "data/g1-tokenizer-receipt.json";
    }
    const card = {
      date: receipt.at.slice(0, 10),
      gate: "G1",
      modelHash: receipt.modelHash,
      split: "public_eval_probes",
      metric: "chars_per_token",
      score: alefba.charsPerToken,
      baseline: "bloom-560m-proxy",
      baselineScore: bloomProxyCpt,
      notes: pass ? "Tokenizer v1 fertility receipt vs named proxy" : "Fertility below proxy",
    };
    receipts.scoreCards = [card, ...(receipts.scoreCards || []).filter((c) => c.gate !== "G1")];
    receipts.updatedAt = receipt.at;
    fs.writeFileSync(RECEIPTS_PATH, JSON.stringify(receipts, null, 2), "utf8");
  }

  const mark = pass ? "PASS" : "FAIL";
  console.log(`${mark}  tokenizer-fertility-v1`);
  console.log(`  alefba ${alefba.charsPerToken} chars/token`);
  console.log(`  latin proxy ${latinProxy.charsPerToken} · bloom proxy ${bloomProxyCpt}`);
  console.log(`  receipt → ${RECEIPT_PATH}`);
  process.exit(pass ? 0 : 1);
}

main();
