#!/usr/bin/env node
/** dis-brand-agent repo=PLUS ONE product=DIS BRAND tag=DIS-PLUSONE-ALEFBA-WORKSPACE-SRC-SERVER-MJS name="DIS BRAND Governed Agent" action=edit at=2026-08-09T20:35:01.830Z */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../public");
const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.resolve(__dirname, "../data");
/** Mutable lead capture only — mount Railway volume here in production. */
const PERSIST_DIR = process.env.PERSIST_DIR
  ? path.resolve(process.env.PERSIST_DIR)
  : DATA_DIR;
const INTEREST_FILE = path.join(PERSIST_DIR, "interest.jsonl");
const RECEIPTS_FILE = path.join(DATA_DIR, "receipts.json");
const MANIFEST_FILE = path.join(DATA_DIR, "content-manifest.json");
const CORPUS_INVENTORY_FILE = path.join(DATA_DIR, "corpus-inventory.json");
const TOKENIZER_SPEC_FILE = path.join(DATA_DIR, "tokenizer-v1-spec.json");
const EVAL_BASELINES_FILE = path.join(DATA_DIR, "eval-baselines.json");
const EVAL_HARNESS_FILE = path.join(DATA_DIR, "eval-harness-v1.json");
const G1_REPORT_FILE = path.join(DATA_DIR, "g1-run-report.json");
const G1_FERTILITY_FILE = path.join(DATA_DIR, "g1-tokenizer-receipt.json");
const G1_HF_REPORT_FILE = path.join(DATA_DIR, "g1-hf-baseline-report.json");
const TOKENIZER_MODEL_FILE = path.join(DATA_DIR, "tokenizer-v1-model.json");
const API_WAITLIST_FILE = path.join(PERSIST_DIR, "api-waitlist.jsonl");
const HOST =
  process.env.ALEFBA_HOST ||
  (process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1");
const PORT = Number(process.env.ALEFBA_PORT || process.env.PORT || 5293);
const DONATE_GOAL_USD = Number(process.env.ALEFBA_DONATE_GOAL || 50000);
const VERSION = "0.2.8";
const BUILD_SHA = process.env.ALEFBA_SHA || "local";
const ADMIN_TOKEN = process.env.ALEFBA_ADMIN_TOKEN || "";
const PUBLIC_ORIGIN = process.env.ALEFBA_PUBLIC_ORIGIN || "";
const N8N_INTEREST_WEBHOOK = process.env.ALEFBA_N8N_INTEREST_WEBHOOK || "";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
};

const rateMap = new Map();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 12;

function ensureData() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(PERSIST_DIR, { recursive: true });
  migrateLegacyLeads();
  if (!fs.existsSync(INTEREST_FILE)) fs.writeFileSync(INTEREST_FILE, "", "utf8");
  if (!fs.existsSync(RECEIPTS_FILE)) {
    fs.writeFileSync(
      RECEIPTS_FILE,
      JSON.stringify({ version: VERSION, gates: [], scoreCards: [] }, null, 2),
      "utf8"
    );
  }
}

/** One-time: copy leads from baked DATA_DIR when PERSIST_DIR is a separate volume mount. */
function migrateLegacyLeads() {
  if (PERSIST_DIR === DATA_DIR) return;
  const pairs = [
    [path.join(DATA_DIR, "interest.jsonl"), INTEREST_FILE],
    [path.join(DATA_DIR, "api-waitlist.jsonl"), API_WAITLIST_FILE],
  ];
  for (const [legacy, target] of pairs) {
    if (fs.existsSync(target) && fs.statSync(target).size > 0) continue;
    if (!fs.existsSync(legacy)) continue;
    const content = fs.readFileSync(legacy, "utf8").trim();
    if (!content) continue;
    fs.writeFileSync(target, content.endsWith("\n") ? content : `${content}\n`, "utf8");
  }
}

function safeJoin(root, urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]).replace(/\\/g, "/");
  const rel = clean === "/" ? "/index.html" : clean;
  const full = path.resolve(root, "." + rel);
  if (!full.startsWith(root)) return null;
  return full;
}

function corsOrigin(req) {
  if (!PUBLIC_ORIGIN) return "*";
  const origin = req.headers.origin;
  return origin === PUBLIC_ORIGIN ? origin : PUBLIC_ORIGIN;
}

function securityHeaders() {
  return {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Frame-Options": "SAMEORIGIN",
    "Content-Security-Policy": "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; script-src 'self' 'unsafe-inline'; connect-src 'self'",
  };
}

function authorizeAdmin(req) {
  if (!ADMIN_TOKEN) {
    return process.env.NODE_ENV !== "production";
  }
  const auth = String(req.headers.authorization || "");
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const header = String(req.headers["x-alefba-admin-token"] || "").trim();
  return bearer === ADMIN_TOKEN || header === ADMIN_TOKEN;
}

function sendJson(res, req, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": corsOrigin(req),
    ...securityHeaders(),
  });
  res.end(JSON.stringify(body));
}

async function notifyInterestWebhook(row) {
  if (!N8N_INTEREST_WEBHOOK || isTestRecord(row)) return;
  try {
    await fetch(N8N_INTEREST_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "interest.created", row, service: "alefba", version: VERSION }),
    });
  } catch {
    /* glue only — never block interest capture */
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > 64_000) {
        reject(new Error("payload_too_large"));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function parseAmountUsd(raw) {
  if (raw == null || raw === "") return 0;
  const s = String(raw).toLowerCase().replace(/,/g, "").trim();
  const m = s.match(/(\d+(?:\.\d+)?)\s*(k|m)?/);
  if (!m) return 0;
  let n = Number(m[1]);
  if (m[2] === "k") n *= 1000;
  if (m[2] === "m") n *= 1_000_000;
  return Number.isFinite(n) ? n : 0;
}

function firstName(name) {
  const t = String(name || "").trim();
  if (!t) return "Anon";
  return t.split(/\s+/)[0].slice(0, 24);
}

function isTestRecord(r) {
  const email = String(r.email || "").toLowerCase();
  const name = String(r.name || "").toLowerCase();
  if (email.endsWith("@alefba.local")) return true;
  if (email.includes("e2e") || email.includes("test")) return true;
  if (name === "e2e" || name.startsWith("polish") || name === "narrative" || name === "smoke test") return true;
  return false;
}

function readRecords() {
  ensureData();
  const text = fs.readFileSync(INTEREST_FILE, "utf8");
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      try {
        return JSON.parse(l);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function buildStats() {
  const rows = readRecords().filter((r) => !isTestRecord(r));
  const counts = { invest: 0, participate: 0, donate: 0, total: rows.length };
  let pledgedUsd = 0;
  const wall = [];

  for (const r of rows) {
    const lane = r.lane === "invest" || r.lane === "participate" || r.lane === "donate" ? r.lane : "participate";
    counts[lane] += 1;
    if (lane === "donate") pledgedUsd += parseAmountUsd(r.amount);
    if (r.showOnWall !== false) {
      wall.push({
        name: firstName(r.name),
        lane,
        at: r.at || null,
        tier: r.tier || null,
        founding: Boolean(r.tier === "founding" || parseAmountUsd(r.amount) >= 1000),
      });
    }
  }

  wall.reverse();
  return {
    counts,
    pledgedUsd: Math.round(pledgedUsd),
    goalUsd: DONATE_GOAL_USD,
    progressPct: pledgedUsd <= 0 ? 0 : Math.max(1, Math.min(100, Math.round((pledgedUsd / DONATE_GOAL_USD) * 100))),
    wall: wall.slice(0, 40),
    updatedAt: new Date().toISOString(),
  };
}

function readReceipts() {
  ensureData();
  try {
    return JSON.parse(fs.readFileSync(RECEIPTS_FILE, "utf8"));
  } catch {
    return { version: VERSION, gates: [], scoreCards: [] };
  }
}

function readJsonFile(file, fallback) {
  ensureData();
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function readCorpusInventory() {
  return readJsonFile(CORPUS_INVENTORY_FILE, { version: VERSION, shards: [], licenseMap: [] });
}

function rateLimit(ip) {
  const now = Date.now();
  const bucket = rateMap.get(ip) || [];
  const fresh = bucket.filter((t) => now - t < RATE_WINDOW_MS);
  if (fresh.length >= RATE_MAX) return false;
  fresh.push(now);
  rateMap.set(ip, fresh);
  return true;
}

function exportInterestCsv() {
  const rows = readRecords();
  const header = "at,lane,name,email,role,amount,tier,lang,ref";
  const lines = rows.map((r) =>
    [r.at, r.lane, r.name, r.email, r.role, r.amount, r.tier, r.lang, r.ref]
      .map((v) => `"${String(v || "").replace(/"/g, '""')}"`)
      .join(",")
  );
  return `${header}\n${lines.join("\n")}\n`;
}

async function handleApi(req, res, pathname) {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": corsOrigin(req),
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Alefba-Admin-Token",
      ...securityHeaders(),
    });
    res.end();
    return true;
  }

  if (pathname === "/api/health" && req.method === "GET") {
    sendJson(res, req, 200, { ok: true, service: "alefba", port: PORT, version: VERSION });
    return true;
  }

  if (pathname === "/api/release.json" && req.method === "GET") {
    sendJson(res, req, 200, {
      version: VERSION,
      sha: BUILD_SHA,
      builtAt: new Date().toISOString(),
      service: "alefba",
    });
    return true;
  }

  if (pathname === "/api/stats" && req.method === "GET") {
    sendJson(res, req, 200, buildStats());
    return true;
  }

  if (pathname === "/api/receipts" && req.method === "GET") {
    sendJson(res, req, 200, readReceipts());
    return true;
  }

  if (pathname === "/api/content-manifest" && req.method === "GET") {
    ensureData();
    if (fs.existsSync(MANIFEST_FILE)) {
      sendJson(res, req, 200, JSON.parse(fs.readFileSync(MANIFEST_FILE, "utf8")));
    } else {
      sendJson(res, req, 200, { version: VERSION, patternLaw: {}, gates: [] });
    }
    return true;
  }

  if (pathname === "/api/corpus-inventory" && req.method === "GET") {
    sendJson(res, req, 200, readCorpusInventory());
    return true;
  }

  if (pathname === "/api/tokenizer-v1-spec" && req.method === "GET") {
    sendJson(res, req, 200, readJsonFile(TOKENIZER_SPEC_FILE, { error: "missing" }));
    return true;
  }

  if (pathname === "/api/eval-baselines" && req.method === "GET") {
    sendJson(res, req, 200, readJsonFile(EVAL_BASELINES_FILE, { baselines: [] }));
    return true;
  }

  if (pathname === "/api/eval-harness" && req.method === "GET") {
    sendJson(res, req, 200, readJsonFile(EVAL_HARNESS_FILE, { suites: [] }));
    return true;
  }

  if (pathname === "/api/g1-report" && req.method === "GET") {
    sendJson(res, req, 200, readJsonFile(G1_REPORT_FILE, { pass: false, note: "run npm run test:g1" }));
    return true;
  }

  if (pathname === "/api/g1-tokenizer-receipt" && req.method === "GET") {
    sendJson(res, req, 200, readJsonFile(G1_FERTILITY_FILE, { pass: false, note: "run npm run train:tokenizer" }));
    return true;
  }

  if (pathname === "/api/g1-hf-baseline-report" && req.method === "GET") {
    sendJson(res, req, 200, readJsonFile(G1_HF_REPORT_FILE, { pass: false, note: "run npm run test:hf-baseline" }));
    return true;
  }

  if (pathname === "/api/tokenizer-v1-model" && req.method === "GET") {
    const model = readJsonFile(TOKENIZER_MODEL_FILE, { error: "not_trained" });
    if (model.idToToken) {
      sendJson(res, req, 200, {
        version: model.version,
        vocabSize: model.vocabSize,
        trainedAt: model.trainedAt,
        probeFertility: model.probeFertility,
        trainingShards: model.trainingShards,
      });
    } else {
      sendJson(res, req, 200, model);
    }
    return true;
  }

  if (pathname === "/api/v1/health" && req.method === "GET") {
    sendJson(res, req, 200, {
      ok: true,
      service: "alefba-api",
      version: VERSION,
      instructMvp: "not_live",
      note: "Instruct MVP ships after Gate 3 — join waitlist at /api/v1/waitlist",
    });
    return true;
  }

  if (pathname === "/api/v1/status" && req.method === "GET") {
    const receipts = readReceipts();
    const g1 = receipts.gates?.find((g) => g.id === "G1");
    sendJson(res, req, 200, {
      version: VERSION,
      gates: receipts.gates || [],
      scoreCards: (receipts.scoreCards || []).length,
      g1Status: g1?.status || "pending",
      instructMvp: "not_live",
      apiAlpha: "waitlist",
      charter: `${req.headers.host ? `https://${req.headers.host}` : ""}/`,
    });
    return true;
  }

  if (pathname === "/api/v1/waitlist" && req.method === "POST") {
    const ip = req.socket.remoteAddress || "local";
    if (!rateLimit(ip)) {
      sendJson(res, req, 429, { ok: false, error: "rate_limited" });
      return true;
    }
    try {
      const raw = await readBody(req);
      const data = JSON.parse(raw || "{}");
      const row = {
        at: new Date().toISOString(),
        email: String(data.email || "").trim().slice(0, 180),
        name: String(data.name || "").trim().slice(0, 120),
        useCase: String(data.useCase || data.role || "").trim().slice(0, 200),
        lang: String(data.lang || "").trim().slice(0, 8),
      };
      if (!row.email) {
        sendJson(res, req, 400, { ok: false, error: "email_required" });
        return true;
      }
      ensureData();
      fs.appendFileSync(API_WAITLIST_FILE, `${JSON.stringify(row)}\n`, "utf8");
      sendJson(res, req, 201, { ok: true, message: "waitlist_saved", instructMvp: "not_live" });
    } catch (err) {
      sendJson(res, req, 400, { ok: false, error: String(err.message || err) });
    }
    return true;
  }

  if (pathname === "/api/interest/export.csv" && req.method === "GET") {
    if (!authorizeAdmin(req)) {
      sendJson(res, req, 401, { ok: false, error: "admin_required" });
      return true;
    }
    res.writeHead(200, {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="alefba-interest.csv"',
      "Cache-Control": "no-store",
      ...securityHeaders(),
    });
    res.end(exportInterestCsv());
    return true;
  }

  if (pathname === "/api/interest/export.json" && req.method === "GET") {
    if (!authorizeAdmin(req)) {
      sendJson(res, req, 401, { ok: false, error: "admin_required" });
      return true;
    }
    sendJson(res, req, 200, { rows: readRecords(), exportedAt: new Date().toISOString() });
    return true;
  }

  if (pathname === "/api/interest" && req.method === "POST") {
    const ip = req.socket.remoteAddress || "local";
    if (!rateLimit(ip)) {
      sendJson(res, req, 429, { ok: false, error: "rate_limited" });
      return true;
    }
    try {
      const raw = await readBody(req);
      const data = JSON.parse(raw || "{}");
      const lane = ["invest", "participate", "donate"].includes(data.lane) ? data.lane : "participate";
      const row = {
        at: new Date().toISOString(),
        lane,
        name: String(data.name || "").trim().slice(0, 120),
        email: String(data.email || "").trim().slice(0, 180),
        role: String(data.role || "").trim().slice(0, 64),
        amount: String(data.amount || "").trim().slice(0, 64),
        note: String(data.note || "").trim().slice(0, 2000),
        tier: String(data.tier || "").trim().slice(0, 64),
        lang: String(data.lang || "").trim().slice(0, 8),
        ref: String(data.ref || "").trim().slice(0, 64),
        showOnWall: data.showOnWall !== false,
      };
      if (!row.name || !row.email) {
        sendJson(res, req, 400, { ok: false, error: "name_and_email_required" });
        return true;
      }
      ensureData();
      fs.appendFileSync(INTEREST_FILE, `${JSON.stringify(row)}\n`, "utf8");
      notifyInterestWebhook(row);
      sendJson(res, req, 201, { ok: true, stats: buildStats() });
    } catch (err) {
      sendJson(res, req, 400, { ok: false, error: String(err.message || err) });
    }
    return true;
  }

  return false;
}

ensureData();

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${HOST}:${PORT}`);
  const handled = await handleApi(req, res, url.pathname);
  if (handled) return;

  const file = safeJoin(ROOT, url.pathname);
  if (!file) {
    res.writeHead(403).end("Forbidden");
    return;
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404).end("Not found");
      return;
    }
    const ext = path.extname(file);
    const etag = createHash("md5").update(data).digest("hex").slice(0, 12);
    res.writeHead(200, {
      "Content-Type": TYPES[ext] || "application/octet-stream",
      "Cache-Control": "no-store",
      ETag: `"${etag}"`,
      ...securityHeaders(),
    });
    res.end(data);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Alefbâ startup page → http://${HOST}:${PORT}/`);
  console.log(`Alefbâ data dir      → ${DATA_DIR}`);
  console.log(`Alefbâ persist dir   → ${PERSIST_DIR}`);
  console.log(`Alefbâ API health   → http://${HOST}:${PORT}/api/health`);
  console.log(`Alefbâ API stats    → http://${HOST}:${PORT}/api/stats`);
  console.log(`Alefbâ receipts     → http://${HOST}:${PORT}/receipts.html`);
});
