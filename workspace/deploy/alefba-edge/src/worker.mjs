/**
 * Alefbâ standalone edge — Cloudflare Pages (static) + Worker (API).
 * NOT Noetfield · NOT SourceB · NOT PLR. Railway = persist origin only when needed.
 */

import {
  buildStatsFromD1,
  isTestRecord,
  mergeStats,
} from "./interest-d1.mjs";

const VERSION = "0.2.8";
const EDGE_ORIGIN = "https://alefba.sina-kazemnezhad-ca.workers.dev";

const SITEMAP_PAGES = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/white-paper.html", priority: "0.95", changefreq: "monthly" },
  { path: "/corpus.html", priority: "0.9", changefreq: "weekly" },
  { path: "/receipts.html", priority: "0.9", changefreq: "weekly" },
  { path: "/data-room.html", priority: "0.85", changefreq: "monthly" },
  { path: "/press.html", priority: "0.8", changefreq: "monthly" },
  { path: "/api.html", priority: "0.7", changefreq: "monthly" },
];

function edgeOrigin(env) {
  const fromEnv = (env.ALEFBA_PUBLIC_ORIGIN || "").replace(/\/$/, "");
  return fromEnv || EDGE_ORIGIN;
}

function serveRobots(env) {
  const origin = edgeOrigin(env);
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/interest/export",
    "Disallow: /api/interest/export.csv",
    "",
    `Sitemap: ${origin}/sitemap.xml`,
    "",
  ].join("\n");
  return new Response(body, {
    status: 200,
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
}

function serveSitemap(env) {
  const origin = edgeOrigin(env);
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = SITEMAP_PAGES.map((p) => {
    const loc = `${origin}${p.path}`;
    return `<url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`;
  }).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, {
    status: 200,
    headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

async function handleWaitlistPost(request, env) {
  const data = await readJson(request);
  if (!data?.email) {
    return json({ ok: false, error: "email_required" }, 400);
  }
  const row = {
    name: String(data.name || "").trim().slice(0, 120),
    email: String(data.email || "").trim().slice(0, 180),
    use_case: String(data.useCase || data.role || "").trim().slice(0, 200),
    lang: String(data.lang || "").trim().slice(0, 8),
  };
  if (!env.DB) {
    return json({
      ok: true,
      message: "waitlist_accepted_stub",
      instructMvp: env.INSTRUCT_MVP || "not_live",
      persisted: false,
      row,
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
    )
      .bind(row.name || null, row.email, row.use_case || null, row.lang || null)
      .run();
    return json({
      ok: true,
      message: "waitlist_saved",
      instructMvp: env.INSTRUCT_MVP || "not_live",
      migration: env.MIGRATION_PHASE || "g3_interest_d1",
      persisted: true,
      surface: "alefba-standalone-edge",
    }, 201);
  } catch (err) {
    return json({ ok: false, error: String(err.message || err) }, 500);
  }
}

async function fetchRailwayStats(env) {
  const origin = (env.RAILWAY_ORIGIN || "https://alefba-production.up.railway.app").replace(/\/$/, "");
  try {
    const res = await fetch(`${origin}/api/stats`, {
      headers: { "x-alefba-edge": "standalone" },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

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
  if (merged) return json(merged);
  return json(
    railwayStats || {
      counts: { invest: 0, participate: 0, donate: 0, total: 0 },
      pledgedUsd: 0,
      goalUsd: 50000,
      progressPct: 0,
      wall: [],
      updatedAt: new Date().toISOString(),
    }
  );
}

async function handleInterestPost(request, env, ctx) {
  const data = await readJson(request);
  const lane = ["invest", "participate", "donate"].includes(data?.lane) ? data.lane : "participate";
  const row = {
    lane,
    name: String(data?.name || "").trim().slice(0, 120),
    email: String(data?.email || "").trim().slice(0, 180),
    role: String(data?.role || "").trim().slice(0, 64),
    amount: String(data?.amount || "").trim().slice(0, 64),
    note: String(data?.note || "").trim().slice(0, 2000),
    tier: String(data?.tier || "").trim().slice(0, 64),
    lang: String(data?.lang || "").trim().slice(0, 8),
    ref: String(data?.ref || "").trim().slice(0, 64),
    showOnWall: data?.showOnWall !== false,
  };

  if (!row.name || !row.email) {
    return json({ ok: false, error: "name_and_email_required" }, 400);
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
    )
      .bind(
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
      )
      .run();
  } catch (err) {
    return json({ ok: false, error: String(err.message || err) }, 500);
  }

  const d1Stats = await buildStatsFromD1(env);
  const railwayStats = await fetchRailwayStats(env);
  const stats = mergeStats(railwayStats, d1Stats) || d1Stats;

  if (ctx && !isTest) {
    const backupBody = JSON.stringify({
      lane: row.lane,
      name: row.name,
      email: row.email,
      role: row.role,
      amount: row.amount,
      note: row.note,
      tier: row.tier,
      lang: row.lang,
      ref: row.ref,
      showOnWall: row.showOnWall,
    });
    ctx.waitUntil(
      proxyToRailway(
        new Request(request.url, {
          method: "POST",
          headers: { "content-type": "application/json", "x-alefba-edge": "standalone" },
          body: backupBody,
        }),
        env
      )
    );
  }

  return json({
    ok: true,
    stats,
    persisted: true,
    surface: "alefba-standalone-edge",
    migration: env.MIGRATION_PHASE || "g3_interest_d1",
  }, 201);
}

async function proxyToRailway(request, env) {
  const origin = (env.RAILWAY_ORIGIN || "https://alefba-production.up.railway.app").replace(/\/$/, "");
  const url = new URL(request.url);
  const target = `${origin}${url.pathname}${url.search}`;
  const headers = new Headers(request.headers);
  headers.set("x-alefba-edge", "standalone");
  return fetch(target, {
    method: request.method,
    headers,
    body: request.method !== "GET" && request.method !== "HEAD" ? request.body : undefined,
    redirect: "manual",
  });
}

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
  return json({
    ok: true,
    service: "alefba-api",
    surface: "alefba-standalone-edge",
    version: env.ALEFBA_VERSION || VERSION,
    instructMvp: env.INSTRUCT_MVP || "not_live",
    d1,
  });
}

async function handleV1Status(env) {
  let waitlistRows = null;
  let interestRows = null;
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
  }
  return json({
    version: env.ALEFBA_VERSION || VERSION,
    surface: "alefba-standalone-edge",
    instructMvp: env.INSTRUCT_MVP || "not_live",
    apiAlpha: "waitlist",
    waitlistRows,
    interestRows,
    migration: env.MIGRATION_PHASE || "g3_interest_d1",
    gates: [
      { id: "G1", status: "pass" },
      { id: "G2", status: "in_progress" },
      { id: "G3", status: "pending" },
      { id: "G4", status: "pending" },
    ],
  });
}

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
  if (url.pathname === "/api/stats" && request.method === "GET") {
    return handleStatsGet(env);
  }
  if (url.pathname === "/api/interest" && request.method === "POST") {
    return handleInterestPost(request, env, ctx);
  }
  return proxyToRailway(request, env);
}

export default {
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
  },
};
