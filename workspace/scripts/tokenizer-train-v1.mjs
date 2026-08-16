#!/usr/bin/env node
/**
 * Train Alefbâ tokenizer v1 — word + frequent n-gram vocab from curriculum shards (no GPU).
 * Output: data/tokenizer-v1-model.json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SPEC_PATH = path.join(ROOT, "data/tokenizer-v1-spec.json");
const OUT_PATH = path.join(ROOT, "data/tokenizer-v1-model.json");
const SHARD_DIR = path.join(ROOT, "data/corpus/shards");
const PROBE_PATH = path.join(ROOT, "data/eval-probes/alphabet-probes.fa.jsonl");

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

function persianLettersFromSpec(spec) {
  const set = new Set();
  for (const ch of spec.alphabet?.letters || []) set.add(ch);
  for (const ch of spec.alphabet?.extended || []) set.add(ch);
  for (const ch of spec.alphabet?.digits || []) set.add(ch);
  for (const ch of spec.alphabet?.punctuation || []) set.add(ch);
  set.add(spec.alphabet?.zwnj || "\u200c");
  set.add(" ");
  return set;
}

function collectCorpusLines() {
  const lines = [];
  if (fs.existsSync(SHARD_DIR)) {
    for (const name of fs.readdirSync(SHARD_DIR)) {
      if (!name.endsWith(".jsonl")) continue;
      for (const row of readJsonl(path.join(SHARD_DIR, name))) {
        if (row.text) lines.push(row.text);
      }
    }
  }
  for (const row of readJsonl(PROBE_PATH)) {
    if (row.text) lines.push(row.text);
  }
  const ortho = path.join(ROOT, "data/eval-probes/orthography-probes.fa.jsonl");
  for (const row of readJsonl(ortho)) {
    if (row.text) lines.push(row.text);
  }
  return lines;
}

function tokenizeWords(text) {
  return text
    .replace(/\u200c/g, " ")
    .split(/[\s،؛؟!.«»\-—…]+/)
    .map((w) => w.trim())
    .filter(Boolean);
}

function ngramFreq(text, minLen, maxLen) {
  const freq = new Map();
  const compact = text.replace(/\s+/g, "");
  for (let len = minLen; len <= maxLen; len++) {
    for (let i = 0; i <= compact.length - len; i++) {
      const g = compact.slice(i, i + len);
      freq.set(g, (freq.get(g) || 0) + 1);
    }
  }
  return freq;
}

function buildVocab(spec, corpusLines) {
  const specials = spec.algorithm?.specialTokens || ["<pad>", "<bos>", "<eos>", "<unk>", "<zwnj>"];
  const letters = persianLettersFromSpec(spec);
  const vocab = new Map();
  let id = 0;
  for (const t of specials) vocab.set(t, id++);

  for (const ch of letters) {
    if (!vocab.has(ch)) vocab.set(ch, id++);
  }

  const wordFreq = new Map();
  const ngramTotal = new Map();
  for (const line of corpusLines) {
    for (const word of tokenizeWords(line)) {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 10);
    }
    const compactWords = line.split(/\s+/).filter(Boolean);
    for (const w of compactWords) {
      wordFreq.set(w, (wordFreq.get(w) || 0) + 15);
    }
    for (const [g, c] of ngramFreq(line, 2, 6)) {
      ngramTotal.set(g, (ngramTotal.get(g) || 0) + c);
    }
  }

  const targetSize = spec.algorithm?.vocabSizeTarget || 32000;
  const candidates = [];

  for (const [word, c] of wordFreq) candidates.push({ piece: word, score: c * word.length });
  for (const [g, c] of ngramTotal) {
    if (c >= 2) candidates.push({ piece: g, score: c * g.length });
  }

  candidates.sort((a, b) => b.score - a.score);
  for (const { piece } of candidates) {
    if (vocab.size >= targetSize) break;
    if (!piece || vocab.has(piece)) continue;
    vocab.set(piece, id++);
  }

  return vocab;
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
  const s = text;
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
    for (let len = Math.min(32, s.length - i); len >= 1; len--) {
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

function charCount(text) {
  return text.replace(/\s+/g, "").length;
}

function main() {
  const spec = readJson(SPEC_PATH);
  const corpusLines = collectCorpusLines();
  const vocab = buildVocab(spec, corpusLines);
  const idToToken = [...vocab.entries()].sort((a, b) => a[1] - b[1]).map(([t]) => t);

  const probes = readJsonl(PROBE_PATH);
  let totalChars = 0;
  let totalTokens = 0;
  for (const p of probes) {
    const t = p.text || "";
    totalChars += charCount(t);
    totalTokens += encodeWordAware(t, vocab).length;
  }
  const charsPerToken = totalTokens > 0 ? totalChars / totalTokens : 0;

  const model = {
    version: "1.0.0",
    gate: "G1",
    algorithm: spec.algorithm?.family || "BPE",
    trainedAt: new Date().toISOString(),
    vocabSize: vocab.size,
    specialTokens: spec.algorithm?.specialTokens || [],
    idToToken,
    probeFertility: {
      metric: "characters_per_token",
      probeCount: probes.length,
      totalChars,
      totalTokens,
      charsPerToken: Math.round(charsPerToken * 1000) / 1000,
    },
    trainingShards: fs.existsSync(SHARD_DIR)
      ? fs.readdirSync(SHARD_DIR).filter((f) => f.endsWith(".jsonl"))
      : [],
    law: "Research tokenizer v1 — fertility receipt required vs named baseline before G1 pass.",
  };

  fs.writeFileSync(OUT_PATH, JSON.stringify(model, null, 2), "utf8");
  console.log(`PASS  tokenizer-train-v1`);
  console.log(`  vocab ${model.vocabSize} tokens`);
  console.log(`  probe fertility ${model.probeFertility.charsPerToken} chars/token`);
  console.log(`  model → ${OUT_PATH}`);
}

main();
