#!/usr/bin/env node
/** Production smoke — run against live BASE URL after deploy */

const BASE = (process.env.ALEFBA_BASE_URL || process.env.ALEFBA_BASE || "").replace(/\/$/, "");
const ADMIN = process.env.ALEFBA_ADMIN_TOKEN || "";
const MIN_HTML = 1500;

if (!BASE) {
  console.error("Set ALEFBA_BASE_URL (e.g. https://alefba.example)");
  process.exit(1);
}

const results = [];

function record(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(ok ? "PASS" : "RED", name, detail ? `— ${detail}` : "");
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  const text = await res.text();
  return { res, text };
}

async function main() {
  console.log(`Alefbâ production smoke → ${BASE}\n`);

  const health = await get("/api/health");
  let healthJ = {};
  try {
    healthJ = JSON.parse(health.text);
  } catch {}
  record("health 200", health.res.ok, `${healthJ.version || ""}`);
  record("health version 0.2.8", healthJ.version === "0.2.8");

  const release = await get("/api/release.json");
  let relJ = {};
  try {
    relJ = JSON.parse(release.text);
  } catch {}
  record("release.json", release.res.ok && relJ.version === "0.2.8", relJ.sha || "");

  for (const path of ["/", "/white-paper.html", "/corpus.html", "/receipts.html", "/data-room.html", "/press.html"]) {
    const p = await get(path);
    record(`page ${path}`, p.res.ok && p.text.length >= MIN_HTML, `${p.text.length}b`);
  }

  const exportNoAuth = await get("/api/interest/export.json");
  let exportJ = {};
  try {
    exportJ = JSON.parse(exportNoAuth.text);
  } catch {}
  record(
    "export blocked without token",
    exportNoAuth.res.status === 401 || exportJ.error === "admin_required",
    String(exportNoAuth.res.status)
  );

  if (ADMIN) {
    const expAuth = await fetch(`${BASE}/api/interest/export.json`, {
      headers: { "X-Alefba-Admin-Token": ADMIN },
    });
    record("export ok with admin token", expAuth.status === 200, String(expAuth.status));
  }

  const post = await fetch(`${BASE}/api/interest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      lane: "participate",
      name: "Smoke Test",
      email: `smoke-${Date.now()}@alefba.local`,
      lang: "fa",
      showOnWall: false,
    }),
  });
  record("interest POST", post.status === 201, String(post.status));

  const receipts = await get("/api/receipts");
  let gatesHonest = false;
  try {
    const rj = JSON.parse(receipts.text);
    const gates = rj.gates || [];
    const g1 = gates.find((g) => g.id === "G1");
    const rest = gates.filter((g) => g.id !== "G1");
    gatesHonest =
      g1?.status === "pass" &&
      g1?.hfBaselineReport &&
      rest.every((g) => g.status === "pending") &&
      (rj.scoreCards?.length || 0) >= 1;
  } catch {}
  record("gates honest G1 pass + HF receipt", gatesHonest);

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${failed.length ? "RED" : "GREEN"}  ${results.length - failed.length}/${results.length} pass`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
