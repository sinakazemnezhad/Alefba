#!/usr/bin/env node
/** Production runtime gate — live URL after deploy (health + critical path) */

const BASE = (process.env.ALEFBA_BASE_URL || process.env.ALEFBA_BASE || "").replace(/\/$/, "");
const ADMIN = process.env.ALEFBA_ADMIN_TOKEN || "";
const MIN_HTML = 1500;
const WAIT_SEC = Number(process.env.PROD_HEALTH_WAIT_SEC || 0);
const WAIT_INTERVAL_MS = 5000;

if (!BASE) {
  console.error("Set ALEFBA_BASE_URL (e.g. https://alefba.example)");
  process.exit(1);
}

const results = [];

function record(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(ok ? "PASS" : "RED", name, detail ? `— ${detail}` : "");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  const text = await res.text();
  return { res, text };
}

async function waitForHealth() {
  if (!WAIT_SEC) return true;
  const attempts = Math.ceil(WAIT_SEC / (WAIT_INTERVAL_MS / 1000));
  console.log(`Waiting for health (max ${WAIT_SEC}s)…\n`);
  for (let i = 0; i < attempts; i++) {
    try {
      const health = await get("/api/health");
      if (health.res.ok) {
        const j = JSON.parse(health.text);
        if (j.version === "0.2.8" && j.ok) {
          record("health ready after deploy", true, `${(i + 1) * (WAIT_INTERVAL_MS / 1000)}s`);
          return true;
        }
      }
    } catch {
      /* retry */
    }
    await sleep(WAIT_INTERVAL_MS);
  }
  record("health ready after deploy", false, `timeout ${WAIT_SEC}s`);
  return false;
}

async function main() {
  console.log(`Alefbâ production runtime gate → ${BASE}\n`);

  if (WAIT_SEC) {
    const ready = await waitForHealth();
    if (!ready) {
      process.exit(1);
    }
  }

  const health = await get("/api/health");
  let healthJ = {};
  try {
    healthJ = JSON.parse(health.text);
  } catch {}
  record("health 200", health.res.ok, `${healthJ.version || ""}`);
  record("health version 0.2.8", healthJ.version === "0.2.8");

  const v1Health = await get("/api/v1/health");
  let v1H = {};
  try {
    v1H = JSON.parse(v1Health.text);
  } catch {}
  record("v1 health 200", v1Health.res.ok && v1H.ok, v1H.instructMvp || "");

  const release = await get("/api/release.json");
  let relJ = {};
  try {
    relJ = JSON.parse(release.text);
  } catch {}
  record("release.json", release.res.ok && relJ.version === "0.2.8", relJ.sha || "");

  for (const path of ["/", "/white-paper.html", "/corpus.html", "/receipts.html", "/data-room.html", "/press.html", "/api.html"]) {
    const p = await get(path);
    record(`page ${path}`, p.res.ok && p.text.length >= MIN_HTML, `${p.text.length}b`);
  }

  const robots = await get("/robots.txt");
  record("robots.txt", robots.res.ok && robots.text.includes("Sitemap:"), robots.text.slice(0, 80));
  const sitemap = await get("/sitemap.xml");
  record(
    "sitemap.xml",
    sitemap.res.ok && sitemap.text.includes("<urlset") && (sitemap.text.match(/<url>/g)?.length || 0) >= 7,
    `${sitemap.text.length}b`
  );

  const home = await get("/");
  record(
    "home SEO head",
    home.text.includes("rel=\"canonical\"") && home.text.includes("application/ld+json"),
    "canonical+ld+json"
  );
  record(
    "frontend bundle linked",
    home.text.includes("/app.js") && home.text.includes("data-i18n"),
    "app.js + i18n"
  );

  const statsBefore = await get("/api/stats");
  let statsBeforeJ = { counts: { total: 0 } };
  try {
    statsBeforeJ = JSON.parse(statsBefore.text);
  } catch {}
  record("stats API (frontend wall)", statsBefore.res.ok, `total=${statsBeforeJ.counts?.total ?? "?"}`);

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

  const probeEmail = `founding-deliver-${Date.now()}@partner-check.invalid`;
  const post = await fetch(`${BASE}/api/interest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      lane: "participate",
      name: "Founding Deliver Check",
      email: probeEmail,
      lang: "fa",
      showOnWall: false,
    }),
  });
  record("interest POST (critical path)", post.status === 201, String(post.status));

  const statsAfter = await get("/api/stats");
  let statsAfterJ = {};
  try {
    statsAfterJ = JSON.parse(statsAfter.text);
  } catch {}
  const totalAfter = statsAfterJ.counts?.total ?? 0;
  const totalBefore = statsBeforeJ.counts?.total ?? 0;
  record(
    "interest persisted (stats delta)",
    totalAfter > totalBefore,
    `${totalBefore} → ${totalAfter}`
  );

  const statsRefresh = await get("/api/stats");
  let statsRefreshJ = {};
  try {
    statsRefreshJ = JSON.parse(statsRefresh.text);
  } catch {}
  record(
    "interest persists on refresh",
    statsRefreshJ.counts?.total === totalAfter,
    `total=${statsRefreshJ.counts?.total ?? "?"}`
  );

  const waitlist = await fetch(`${BASE}/api/v1/waitlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: `waitlist-${probeEmail}`,
      name: "Runtime Gate",
      lane: "builder",
    }),
  });
  let waitJ = {};
  try {
    waitJ = JSON.parse(await waitlist.text());
  } catch {}
  record("waitlist POST", waitlist.status === 201 && waitJ.ok, waitJ.message || String(waitlist.status));

  const chatDoc = await get("/api/v1/chat");
  let chatDocOk = false;
  try {
    const cj = JSON.parse(chatDoc.text);
    chatDocOk = cj.chatAlpha === "probe_only";
  } catch {}
  record("chat capability doc", chatDoc.res.ok && chatDocOk);

  const chatBlocked = await fetch(`${BASE}/api/v1/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [{ role: "user", content: "probe" }] }),
  });
  let blockedOk = false;
  try {
    const bj = JSON.parse(await chatBlocked.text());
    blockedOk = chatBlocked.status === 503 && bj.error === "instruct_not_live";
  } catch {}
  record("chat instruct not_live", blockedOk);

  const chatProbe = await fetch(`${BASE}/api/v1/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "alefba-probe-v1",
      messages: [{ role: "user", content: "آسمان آبی است." }],
    }),
  });
  let probeOk = false;
  try {
    const pj = JSON.parse(await chatProbe.text());
    probeOk = chatProbe.status === 200 && pj.ok === true;
  } catch {}
  record("chat probe echo", probeOk);

  const partnerStats = await get("/api/v1/design-partners");
  let partnerStatsOk = false;
  try {
    const ps = JSON.parse(partnerStats.text);
    partnerStatsOk = ps.targetActive === 3;
  } catch {}
  record("design partner stats", partnerStats.res.ok && partnerStatsOk);

  const partnerPost = await fetch(`${BASE}/api/v1/design-partners`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orgName: "Smoke Partner",
      contactEmail: `partner-smoke-${Date.now()}@partner-check.invalid`,
      vertical: "publisher",
    }),
  });
  let partnerPostOk = false;
  try {
    const pp = JSON.parse(await partnerPost.text());
    partnerPostOk = partnerPost.status === 201 && pp.ok === true;
  } catch {}
  record("design partner POST", partnerPostOk);

  const v1Status = await get("/api/v1/status");
  let statusJ = {};
  try {
    statusJ = JSON.parse(v1Status.text);
  } catch {}
  const g1 = (statusJ.gates || []).find((g) => g.id === "G1");
  record("v1 status gates", v1Status.res.ok && g1?.status === "pass", `G1=${g1?.status || "?"}`);

  const receipts = await get("/api/receipts");
  let gatesHonest = false;
  try {
    const rj = JSON.parse(receipts.text);
    const gates = rj.gates || [];
    const g1Gate = gates.find((g) => g.id === "G1");
    const g2Gate = gates.find((g) => g.id === "G2");
    const rest = gates.filter((g) => g.id !== "G1" && g.id !== "G2");
    gatesHonest =
      g1Gate?.status === "pass" &&
      g1Gate?.hfBaselineReport &&
      g2Gate?.status === "in_progress" &&
      g2Gate?.scoreCard === "data/g2-score-card.json" &&
      rest.every((g) => g.status === "pending") &&
      (rj.scoreCards?.length || 0) >= 2;
  } catch {}
  record("gates honest G1 pass + G2 card", gatesHonest);

  const g2Score = await get("/api/g2-score-card");
  let g2Published = false;
  let g2ScoreVal = "";
  try {
    const g2j = JSON.parse(g2Score.text);
    g2Published = g2j.published === true && g2j.pass === true;
    g2ScoreVal = String(g2j.score ?? "");
  } catch {}
  record("G2 score card live", g2Score.res.ok && g2Published, g2ScoreVal ? `${g2ScoreVal}%` : "");

  const corpus = await get("/api/corpus-inventory");
  record("corpus inventory API", corpus.res.ok && corpus.text.length > 200, `${corpus.text.length}b`);

  const corpusPipe = await get("/api/corpus-pipeline-report");
  let pipeOk = false;
  try {
    const pj = JSON.parse(corpusPipe.text);
    pipeOk = pj.pass === true;
  } catch {}
  record("corpus pipeline report", corpusPipe.res.ok && pipeOk);

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${failed.length ? "RED" : "GREEN"}  ${results.length - failed.length}/${results.length} pass`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
