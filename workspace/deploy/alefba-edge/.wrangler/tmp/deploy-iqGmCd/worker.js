var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/interest-d1.mjs
var DONATE_GOAL_USD = 5e4;
function parseAmountUsd(raw) {
  if (raw == null || raw === "") return 0;
  const s = String(raw).toLowerCase().replace(/,/g, "").trim();
  const m = s.match(/(\d+(?:\.\d+)?)\s*(k|m)?/);
  if (!m) return 0;
  let n = Number(m[1]);
  if (m[2] === "k") n *= 1e3;
  if (m[2] === "m") n *= 1e6;
  return Number.isFinite(n) ? n : 0;
}
__name(parseAmountUsd, "parseAmountUsd");
function firstName(name) {
  const t = String(name || "").trim();
  if (!t) return "Anon";
  return t.split(/\s+/)[0].slice(0, 24);
}
__name(firstName, "firstName");
function isTestRecord(r) {
  const email = String(r.email || "").toLowerCase();
  const name = String(r.name || "").toLowerCase();
  if (email.endsWith("@alefba.local")) return true;
  if (email.endsWith("@example.com")) return true;
  if (email.includes("e2e") || email.includes("test") || email.includes("smoke") || email.includes("runtime-gate") || email.includes("persist-probe")) {
    return true;
  }
  if (name === "e2e" || name.startsWith("polish") || name === "narrative" || name === "smoke test") {
    return true;
  }
  if (name.includes("runtime") || name.includes("persist probe") || name.includes("smoke")) {
    return true;
  }
  return false;
}
__name(isTestRecord, "isTestRecord");
function buildStatsFromRows(rows) {
  const counts = { invest: 0, participate: 0, donate: 0, total: 0 };
  let pledgedUsd = 0;
  const wall = [];
  for (const r of rows) {
    if (isTestRecord(r)) continue;
    const lane = r.lane === "invest" || r.lane === "participate" || r.lane === "donate" ? r.lane : "participate";
    counts[lane] += 1;
    counts.total += 1;
    if (lane === "donate") pledgedUsd += parseAmountUsd(r.amount);
    if (r.showOnWall !== false && r.show_on_wall !== 0) {
      wall.push({
        name: firstName(r.name),
        lane,
        at: r.at || r.created_at || null,
        tier: r.tier || null,
        founding: Boolean(r.tier === "founding" || parseAmountUsd(r.amount) >= 1e3)
      });
    }
  }
  wall.reverse();
  return {
    counts,
    pledgedUsd: Math.round(pledgedUsd),
    goalUsd: DONATE_GOAL_USD,
    progressPct: pledgedUsd <= 0 ? 0 : Math.max(1, Math.min(100, Math.round(pledgedUsd / DONATE_GOAL_USD * 100))),
    wall: wall.slice(0, 40),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
__name(buildStatsFromRows, "buildStatsFromRows");
async function readInterestRows(env) {
  if (!env.DB) return [];
  const { results } = await env.DB.prepare(
    `SELECT created_at, lane, name, email, role, amount, note, tier, lang, ref, show_on_wall
     FROM interest_leads
     ORDER BY id ASC`
  ).all();
  return (results || []).map((r) => ({
    at: r.created_at,
    lane: r.lane,
    name: r.name,
    email: r.email,
    role: r.role,
    amount: r.amount,
    note: r.note,
    tier: r.tier,
    lang: r.lang,
    ref: r.ref,
    showOnWall: r.show_on_wall !== 0,
    show_on_wall: r.show_on_wall
  }));
}
__name(readInterestRows, "readInterestRows");
async function buildStatsFromD1(env) {
  const rows = await readInterestRows(env);
  return buildStatsFromRows(rows);
}
__name(buildStatsFromD1, "buildStatsFromD1");
function mergeStats(railwayStats, d1Stats) {
  if (!railwayStats && !d1Stats) return null;
  if (!railwayStats) return d1Stats;
  if (!d1Stats) return railwayStats;
  const counts = {
    invest: (railwayStats.counts?.invest ?? 0) + (d1Stats.counts?.invest ?? 0),
    participate: (railwayStats.counts?.participate ?? 0) + (d1Stats.counts?.participate ?? 0),
    donate: (railwayStats.counts?.donate ?? 0) + (d1Stats.counts?.donate ?? 0),
    total: (railwayStats.counts?.total ?? 0) + (d1Stats.counts?.total ?? 0)
  };
  const wallKeys = /* @__PURE__ */ new Set();
  const wall = [];
  for (const entry of [...railwayStats.wall || [], ...d1Stats.wall || []]) {
    const key = `${entry.name}|${entry.lane}|${entry.at || ""}|${entry.tier || ""}`;
    if (wallKeys.has(key)) continue;
    wallKeys.add(key);
    wall.push(entry);
  }
  wall.sort((a, b) => String(b.at || "").localeCompare(String(a.at || "")));
  const pledgedUsd = (railwayStats.pledgedUsd ?? 0) + (d1Stats.pledgedUsd ?? 0);
  const goalUsd = d1Stats.goalUsd ?? railwayStats.goalUsd ?? DONATE_GOAL_USD;
  return {
    counts,
    pledgedUsd: Math.round(pledgedUsd),
    goalUsd,
    progressPct: pledgedUsd <= 0 ? 0 : Math.max(1, Math.min(100, Math.round(pledgedUsd / goalUsd * 100))),
    wall: wall.slice(0, 40),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    persist: "d1+railway"
  };
}
__name(mergeStats, "mergeStats");

// ../../lib/chat-v1.mjs
var CHAT_PROBE_MODEL = "alefba-probe-v1";
var READING_PROBES = [
  { id: "r01", text: "\u0622\u0633\u0645\u0627\u0646 \u0622\u0628\u06CC \u0627\u0633\u062A.", reply: "\u0627\u06CC\u0646 \u062C\u0645\u0644\u0647\u0654 \u06A9\u0648\u062A\u0627\u0647 \u0641\u0627\u0631\u0633\u06CC \u0627\u0633\u062A: \xAB\u0622\u0633\u0645\u0627\u0646 \u0622\u0628\u06CC \u0627\u0633\u062A.\xBB \u2014 \u062F\u0631\u06A9 \u0645\u0637\u0644\u0628 \u0627\u0632 \u0627\u0644\u0641\u0628\u0627 \u0628\u0647 \u0645\u0639\u0646\u0627." },
  { id: "r02", text: "\u06A9\u0648\u062F\u06A9 \u06A9\u062A\u0627\u0628 \u0645\u06CC\u200C\u062E\u0648\u0627\u0646\u062F.", reply: "\u062C\u0645\u0644\u0647\u0654 \u0646\u0645\u0648\u0646\u0647: \xAB\u06A9\u0648\u062F\u06A9 \u06A9\u062A\u0627\u0628 \u0645\u06CC\u200C\u062E\u0648\u0627\u0646\u062F.\xBB \u2014 \u0645\u0633\u06CC\u0631 curriculum: \u062D\u0631\u0641 \u2192 \u0648\u0627\u0698\u0647 \u2192 \u062F\u0627\u0633\u062A\u0627\u0646." },
  { id: "r03", text: "\u0645\u0648\u0644\u0648\u06CC \u0627\u0632 \u0634\u0639\u0631 \u062D\u0627\u0641\u0638 \u06CC\u0627\u062F \u0645\u06CC\u200C\u06AF\u06CC\u0631\u062F.", reply: "\u0627\u062F\u0628\u06CC\u0627\u062A \u0641\u0627\u0631\u0633\u06CC \u0632\u0646\u062C\u06CC\u0631\u0647\u0654 \u0645\u0648\u0644\u0648\u06CC \u0648 \u062D\u0627\u0641\u0638 \u0631\u0627 \u062F\u0631 curriculum \u0646\u06AF\u0647 \u0645\u06CC\u200C\u062F\u0627\u0631\u062F." },
  { id: "r04", text: "\u0646\u06CC\u0645\u200C\u0641\u0627\u0635\u0644\u0647 \u062F\u0631 \u0641\u0627\u0631\u0633\u06CC \u0645\u0647\u0645 \u0627\u0633\u062A.", reply: "\u0646\u06CC\u0645\u200C\u0641\u0627\u0635\u0644\u0647 (ZWNJ) \u0628\u062E\u0634\u06CC \u0627\u0632 \u0627\u0645\u0644\u0627\u06CC \u0641\u0627\u0631\u0633\u06CC \u0627\u0633\u062A \u2014 tokenizer \u0627\u0644\u0641\u0628\u0627 \u0622\u0646 \u0631\u0627 \u0646\u06AF\u0647 \u0645\u06CC\u200C\u062F\u0627\u0631\u062F." },
  { id: "r05", text: "\u0641\u0631\u062F\u0648\u0633\u06CC \u0634\u0627\u0647\u0646\u0627\u0645\u0647 \u0631\u0627 \u0633\u0631\u0648\u062F.", reply: "\u0634\u0627\u0647\u0646\u0627\u0645\u0647 \u0641\u0631\u062F\u0648\u0633\u06CC \u0645\u062D\u0648\u0631 narrative corpus \u062F\u0631 \u062F\u0631\u0648\u0627\u0632\u0647\u0654 \u067E\u0627\u06CC\u0647 \u0627\u0633\u062A." },
  { id: "r06", text: "\u0633\u0639\u062F\u06CC \u06AF\u0644\u0633\u062A\u0627\u0646 \u0631\u0627 \u0646\u0648\u0634\u062A.", reply: "\u06AF\u0644\u0633\u062A\u0627\u0646 \u0633\u0639\u062F\u06CC \u0646\u0645\u0648\u0646\u0647\u0654 register \u0627\u062F\u0628\u06CC \u062F\u0631 eval probes \u0627\u0633\u062A." }
];
function chatCapabilityDoc(version = "0.2.8") {
  return {
    route: "/api/v1/chat",
    version,
    instructMvp: "not_live",
    chatAlpha: "probe_only",
    models: [
      {
        id: CHAT_PROBE_MODEL,
        class: "curriculum_probe",
        note: "Static Persian probe echo for API wiring \u2014 not neural inference."
      }
    ],
    methods: ["POST"],
    body: {
      model: CHAT_PROBE_MODEL,
      messages: [{ role: "user", content: "string" }]
    },
    notLive: {
      status: 503,
      error: "instruct_not_live",
      hint: `Set model to ${CHAT_PROBE_MODEL} for probe wiring tests.`,
      waitlist: "/api/v1/waitlist"
    }
  };
}
__name(chatCapabilityDoc, "chatCapabilityDoc");
function lastUserText(messages) {
  if (!Array.isArray(messages)) return "";
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const m = messages[i];
    if (m && m.role === "user" && m.content) return String(m.content).trim();
  }
  return "";
}
__name(lastUserText, "lastUserText");
function matchProbe(userText) {
  const norm = userText.replace(/\s+/g, " ").trim();
  if (!norm) return READING_PROBES[0];
  const hit = READING_PROBES.find((p) => norm.includes(p.text) || p.text.includes(norm));
  return hit || READING_PROBES[0];
}
__name(matchProbe, "matchProbe");
function estimateTokens(text) {
  const s = String(text || "");
  return Math.max(1, Math.ceil(s.length / 4));
}
__name(estimateTokens, "estimateTokens");
function handleChatPost(body, version = "0.2.8") {
  const model = String(body?.model || "").trim();
  const messages = body?.messages;
  if (model !== CHAT_PROBE_MODEL) {
    return {
      status: 503,
      body: {
        ok: false,
        error: "instruct_not_live",
        instructMvp: "not_live",
        chatAlpha: "probe_only",
        hint: `Use model ${CHAT_PROBE_MODEL} for wiring tests until Gate 3 instruct MVP.`,
        waitlist: "/api/v1/waitlist",
        gates: { G3: "pending" }
      }
    };
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return {
      status: 400,
      body: { ok: false, error: "messages_required" }
    };
  }
  const userText = lastUserText(messages);
  const probe = matchProbe(userText);
  const assistantContent = probe.reply;
  const inputTokens = estimateTokens(JSON.stringify(messages));
  const outputTokens = estimateTokens(assistantContent);
  return {
    status: 200,
    body: {
      ok: true,
      model: CHAT_PROBE_MODEL,
      class: "curriculum_probe",
      instructMvp: "not_live",
      probeId: probe.id,
      usage: { input_tokens: inputTokens, output_tokens: outputTokens },
      message: { role: "assistant", content: assistantContent },
      note: "Static probe echo \u2014 not a trained instruct model. Gate 3 lift pending."
    },
    usage: {
      route: "/api/v1/chat",
      model: CHAT_PROBE_MODEL,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      status: "ok"
    }
  };
}
__name(handleChatPost, "handleChatPost");

// ../../lib/design-partner-v1.mjs
function parseDesignPartner(body) {
  const orgName = String(body?.orgName || body?.org_name || "").trim().slice(0, 160);
  const contactEmail = String(body?.contactEmail || body?.contact_email || body?.email || "").trim().slice(0, 180);
  const contactName = String(body?.contactName || body?.contact_name || body?.name || "").trim().slice(0, 120);
  const vertical = String(body?.vertical || body?.useCase || "").trim().slice(0, 120);
  const notes = String(body?.notes || "").trim().slice(0, 2e3);
  return { orgName, contactEmail, contactName, vertical, notes };
}
__name(parseDesignPartner, "parseDesignPartner");
function validateDesignPartner(row) {
  if (!row.orgName) return "org_name_required";
  if (!row.contactEmail) return "contact_email_required";
  return null;
}
__name(validateDesignPartner, "validateDesignPartner");
var G3_ACTIVE_PARTNER_TARGET = 3;
function buildPartnerStats(rows) {
  const counts = { prospect: 0, active: 0, paused: 0, churned: 0, total: 0 };
  for (const r of rows || []) {
    const s = String(r.status || "prospect");
    if (s in counts) counts[s] += 1;
    counts.total += 1;
  }
  const active = counts.active;
  return {
    gate: "G3",
    targetActive: G3_ACTIVE_PARTNER_TARGET,
    active,
    met: active >= G3_ACTIVE_PARTNER_TARGET,
    counts,
    note: "Gate 3 instruct MVP requires 3 active design partners on API alpha."
  };
}
__name(buildPartnerStats, "buildPartnerStats");

// src/chat-v1.mjs
async function handleChatGet(env) {
  return json(chatCapabilityDoc(env.ALEFBA_VERSION || "0.2.8"));
}
__name(handleChatGet, "handleChatGet");
async function handleChatPostRequest(request, env) {
  const started = Date.now();
  const body = await readJson(request);
  const result = handleChatPost(body, env.ALEFBA_VERSION || "0.2.8");
  if (result.usage && env.DB) {
    try {
      await env.DB.prepare(
        `INSERT INTO api_usage (route, model, input_tokens, output_tokens, latency_ms, status)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)`
      ).bind(
        result.usage.route,
        result.usage.model,
        result.usage.input_tokens,
        result.usage.output_tokens,
        Date.now() - started,
        result.usage.status
      ).run();
    } catch {
    }
  }
  return json(result.body, result.status);
}
__name(handleChatPostRequest, "handleChatPostRequest");
async function handleDesignPartnerGet(env) {
  if (!env.DB) {
    return json(buildPartnerStats([]));
  }
  try {
    const { results } = await env.DB.prepare(
      "SELECT status FROM design_partners"
    ).all();
    return json(buildPartnerStats(results || []));
  } catch (e) {
    return json({ ok: false, error: String(e.message || e) }, 500);
  }
}
__name(handleDesignPartnerGet, "handleDesignPartnerGet");
async function handleDesignPartnerPost(request, env) {
  const body = await readJson(request);
  const row = parseDesignPartner(body || {});
  const err = validateDesignPartner(row);
  if (err) return json({ ok: false, error: err }, 400);
  if (!env.DB) {
    return json({
      ok: true,
      persisted: false,
      status: "prospect",
      migration: env.MIGRATION_PHASE || "g3_chat_stub"
    }, 201);
  }
  try {
    await env.DB.prepare(
      `INSERT INTO design_partners (org_name, contact_name, contact_email, vertical, notes, status)
       VALUES (?1, ?2, ?3, ?4, ?5, 'prospect')`
    ).bind(
      row.orgName,
      row.contactName || null,
      row.contactEmail,
      row.vertical || null,
      row.notes || null
    ).run();
    const stats = buildPartnerStats(
      (await env.DB.prepare("SELECT status FROM design_partners").all()).results || []
    );
    return json({
      ok: true,
      persisted: true,
      status: "prospect",
      partnerGate: stats,
      migration: env.MIGRATION_PHASE || "g3_partners_lane",
      note: stats.note
    }, 201);
  } catch (e) {
    return json({ ok: false, error: String(e.message || e) }, 500);
  }
}
__name(handleDesignPartnerPost, "handleDesignPartnerPost");
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
}
__name(json, "json");
async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
__name(readJson, "readJson");

// src/worker.mjs
var VERSION = "0.2.8";
var EDGE_ORIGIN = "https://alefba.sina-kazemnezhad-ca.workers.dev";
var SITEMAP_PAGES = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/white-paper.html", priority: "0.95", changefreq: "monthly" },
  { path: "/corpus.html", priority: "0.9", changefreq: "weekly" },
  { path: "/receipts.html", priority: "0.9", changefreq: "weekly" },
  { path: "/data-room.html", priority: "0.85", changefreq: "monthly" },
  { path: "/press.html", priority: "0.8", changefreq: "monthly" },
  { path: "/api.html", priority: "0.7", changefreq: "monthly" }
];
function edgeOrigin(env) {
  const fromEnv = (env.ALEFBA_PUBLIC_ORIGIN || "").replace(/\/$/, "");
  return fromEnv || EDGE_ORIGIN;
}
__name(edgeOrigin, "edgeOrigin");
function serveRobots(env) {
  const origin = edgeOrigin(env);
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/interest/export",
    "Disallow: /api/interest/export.csv",
    "",
    `Sitemap: ${origin}/sitemap.xml`,
    ""
  ].join("\n");
  return new Response(body, {
    status: 200,
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" }
  });
}
__name(serveRobots, "serveRobots");
function serveSitemap(env) {
  const origin = edgeOrigin(env);
  const lastmod = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const urls = SITEMAP_PAGES.map((p) => {
    const loc = `${origin}${p.path}`;
    return `<url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`;
  }).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  return new Response(xml, {
    status: 200,
    headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" }
  });
}
__name(serveSitemap, "serveSitemap");
function json2(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
}
__name(json2, "json");
async function readJson2(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
__name(readJson2, "readJson");
async function handleWaitlistPost(request, env) {
  const data = await readJson2(request);
  if (!data?.email) {
    return json2({ ok: false, error: "email_required" }, 400);
  }
  const row = {
    name: String(data.name || "").trim().slice(0, 120),
    email: String(data.email || "").trim().slice(0, 180),
    use_case: String(data.useCase || data.role || "").trim().slice(0, 200),
    lang: String(data.lang || "").trim().slice(0, 8)
  };
  if (!env.DB) {
    return json2({
      ok: true,
      message: "waitlist_accepted_stub",
      instructMvp: env.INSTRUCT_MVP || "not_live",
      persisted: false,
      row
    }, 201);
  }
  try {
    await env.DB.prepare(
      `INSERT INTO api_waitlist (name, email, use_case, lang)
       VALUES (?1, ?2, ?3, ?4)
       ON CONFLICT(email) DO UPDATE SET
         name = excluded.name,
         use_case = excluded.use_case,
         lang = excluded.lang`
    ).bind(row.name || null, row.email, row.use_case || null, row.lang || null).run();
    return json2({
      ok: true,
      message: "waitlist_saved",
      instructMvp: env.INSTRUCT_MVP || "not_live",
      migration: env.MIGRATION_PHASE || "g3_chat_stub",
      persisted: true,
      surface: "alefba-standalone-edge"
    }, 201);
  } catch (err) {
    return json2({ ok: false, error: String(err.message || err) }, 500);
  }
}
__name(handleWaitlistPost, "handleWaitlistPost");
async function fetchRailwayStats(env) {
  const origin = (env.RAILWAY_ORIGIN || "https://alefba-production.up.railway.app").replace(/\/$/, "");
  try {
    const res = await fetch(`${origin}/api/stats`, {
      headers: { "x-alefba-edge": "standalone" }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
__name(fetchRailwayStats, "fetchRailwayStats");
async function handleStatsGet(env) {
  const railwayStats = await fetchRailwayStats(env);
  let d1Stats = null;
  if (env.DB) {
    try {
      d1Stats = await buildStatsFromD1(env);
    } catch {
      d1Stats = null;
    }
  }
  const merged = mergeStats(railwayStats, d1Stats);
  if (merged) return json2(merged);
  return json2(
    railwayStats || {
      counts: { invest: 0, participate: 0, donate: 0, total: 0 },
      pledgedUsd: 0,
      goalUsd: 5e4,
      progressPct: 0,
      wall: [],
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  );
}
__name(handleStatsGet, "handleStatsGet");
async function handleInterestPost(request, env) {
  const data = await readJson2(request);
  const lane = ["invest", "participate", "donate"].includes(data?.lane) ? data.lane : "participate";
  const row = {
    lane,
    name: String(data?.name || "").trim().slice(0, 120),
    email: String(data?.email || "").trim().slice(0, 180),
    role: String(data?.role || "").trim().slice(0, 64),
    amount: String(data?.amount || "").trim().slice(0, 64),
    note: String(data?.note || "").trim().slice(0, 2e3),
    tier: String(data?.tier || "").trim().slice(0, 64),
    lang: String(data?.lang || "").trim().slice(0, 8),
    ref: String(data?.ref || "").trim().slice(0, 64),
    showOnWall: data?.showOnWall !== false
  };
  if (!row.name || !row.email) {
    return json2({ ok: false, error: "name_and_email_required" }, 400);
  }
  if (!env.DB) {
    return proxyToRailway(request, env);
  }
  const isTest = isTestRecord(row);
  try {
    await env.DB.prepare(
      `INSERT INTO interest_leads (
         lane, name, email, role, amount, note, tier, lang, ref, show_on_wall, is_test
       ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)`
    ).bind(
      row.lane,
      row.name,
      row.email,
      row.role || null,
      row.amount || null,
      row.note || null,
      row.tier || null,
      row.lang || null,
      row.ref || null,
      row.showOnWall ? 1 : 0,
      isTest ? 1 : 0
    ).run();
  } catch (err) {
    return json2({ ok: false, error: String(err.message || err) }, 500);
  }
  const d1Stats = await buildStatsFromD1(env);
  const railwayStats = await fetchRailwayStats(env);
  const stats = mergeStats(railwayStats, d1Stats) || d1Stats;
  return json2({
    ok: true,
    stats,
    persisted: true,
    surface: "alefba-standalone-edge",
    migration: env.MIGRATION_PHASE || "g3_chat_stub"
  }, 201);
}
__name(handleInterestPost, "handleInterestPost");
async function proxyToRailway(request, env) {
  const origin = (env.RAILWAY_ORIGIN || "https://alefba-production.up.railway.app").replace(/\/$/, "");
  const url = new URL(request.url);
  const target = `${origin}${url.pathname}${url.search}`;
  const headers = new Headers(request.headers);
  headers.set("x-alefba-edge", "standalone");
  return fetch(target, {
    method: request.method,
    headers,
    body: request.method !== "GET" && request.method !== "HEAD" ? request.body : void 0,
    redirect: "manual"
  });
}
__name(proxyToRailway, "proxyToRailway");
async function handleV1Health(env) {
  let d1 = { bound: false };
  if (env.DB) {
    try {
      const row = await env.DB.prepare("SELECT 1 AS ok").first();
      d1 = { bound: true, ok: row?.ok === 1 };
    } catch (err) {
      d1 = { bound: true, ok: false, error: String(err.message || err) };
    }
  }
  return json2({
    ok: true,
    service: "alefba-api",
    surface: "alefba-standalone-edge",
    version: env.ALEFBA_VERSION || VERSION,
    instructMvp: env.INSTRUCT_MVP || "not_live",
    d1
  });
}
__name(handleV1Health, "handleV1Health");
async function handleV1Status(env) {
  let waitlistRows = null;
  let interestRows = null;
  let designPartnerRows = null;
  let chatUsageRows = null;
  let g3PartnerGate = null;
  if (env.DB) {
    try {
      const row = await env.DB.prepare("SELECT COUNT(*) AS n FROM api_waitlist").first();
      waitlistRows = row?.n ?? 0;
    } catch {
      waitlistRows = null;
    }
    try {
      const row = await env.DB.prepare(
        "SELECT COUNT(*) AS n FROM interest_leads WHERE is_test = 0"
      ).first();
      interestRows = row?.n ?? 0;
    } catch {
      interestRows = null;
    }
    try {
      const { results } = await env.DB.prepare("SELECT status FROM design_partners").all();
      g3PartnerGate = buildPartnerStats(results || []);
      designPartnerRows = g3PartnerGate.counts?.total ?? null;
    } catch {
      g3PartnerGate = null;
    }
    try {
      const row = await env.DB.prepare("SELECT COUNT(*) AS n FROM api_usage").first();
      chatUsageRows = row?.n ?? 0;
    } catch {
      chatUsageRows = null;
    }
  }
  return json2({
    version: env.ALEFBA_VERSION || VERSION,
    surface: "alefba-standalone-edge",
    instructMvp: env.INSTRUCT_MVP || "not_live",
    apiAlpha: "waitlist",
    chatAlpha: "probe_only",
    chatRoute: "/api/v1/chat",
    partnerRoute: "/api/v1/design-partners",
    waitlistRows,
    interestRows,
    designPartnerRows,
    chatUsageRows,
    g3PartnerGate,
    migration: env.MIGRATION_PHASE || "g3_partners_lane",
    gates: [
      { id: "G1", status: "pass" },
      { id: "G2", status: "in_progress" },
      { id: "G3", status: "pending" },
      { id: "G4", status: "pending" }
    ]
  });
}
__name(handleV1Status, "handleV1Status");
async function handleWorkerApi(request, env, ctx) {
  const url = new URL(request.url);
  if (url.pathname === "/robots.txt") {
    return serveRobots(env);
  }
  if (url.pathname === "/sitemap.xml") {
    return serveSitemap(env);
  }
  if (url.pathname === "/api/v1/health" && request.method === "GET") {
    return handleV1Health(env);
  }
  if (url.pathname === "/api/v1/status" && request.method === "GET") {
    return handleV1Status(env);
  }
  if (url.pathname === "/api/v1/waitlist" && request.method === "POST") {
    return handleWaitlistPost(request, env);
  }
  if (url.pathname === "/api/v1/chat" && request.method === "GET") {
    return handleChatGet(env);
  }
  if (url.pathname === "/api/v1/chat" && request.method === "POST") {
    return handleChatPostRequest(request, env);
  }
  if (url.pathname === "/api/v1/design-partners" && request.method === "GET") {
    return handleDesignPartnerGet(env);
  }
  if (url.pathname === "/api/v1/design-partners" && request.method === "POST") {
    return handleDesignPartnerPost(request, env);
  }
  if (url.pathname === "/api/stats" && request.method === "GET") {
    return handleStatsGet(env);
  }
  if (url.pathname === "/api/interest" && request.method === "POST") {
    return handleInterestPost(request, env);
  }
  return proxyToRailway(request, env);
}
__name(handleWorkerApi, "handleWorkerApi");
var worker_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/") || url.pathname === "/robots.txt" || url.pathname === "/sitemap.xml") {
      return handleWorkerApi(request, env, ctx);
    }
    if (env.ASSETS) {
      const asset = await env.ASSETS.fetch(request);
      if (asset.status !== 404) return asset;
      if (!url.pathname.includes(".")) {
        const index = await env.ASSETS.fetch(new URL("/index.html", url.origin));
        if (index.status !== 404) return index;
      }
    }
    return new Response("Not found", { status: 404 });
  }
};
export {
  worker_default as default
};
//# sourceMappingURL=worker.js.map
