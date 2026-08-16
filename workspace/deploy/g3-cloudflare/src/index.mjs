/**
 * Alefbâ G3 API spike — Cloudflare Worker stub (not production traffic yet).
 * Railway remains origin for charter + receipts until Gate 3 cutover.
 */

const VERSION = "0.2.8";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function corsHeaders(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return {};
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "content-type, authorization, x-alefba-admin-token",
    vary: "Origin",
  };
}

function withCors(request, response) {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(corsHeaders(request))) headers.set(k, v);
  return new Response(response.body, { status: response.status, headers });
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

async function dbPing(env) {
  if (!env.DB) return { bound: false };
  try {
    const row = await env.DB.prepare("SELECT 1 AS ok").first();
    return { bound: true, ok: row?.ok === 1 };
  } catch (err) {
    return { bound: true, ok: false, error: String(err.message || err) };
  }
}

async function handleHealth(request, env) {
  const db = await dbPing(env);
  return json({
    ok: true,
    service: "alefba-api",
    version: env.ALEFBA_VERSION || VERSION,
    instructMvp: env.INSTRUCT_MVP || "not_live",
    migration: env.MIGRATION_PHASE || "g3_spike",
    note: "G3 Worker stub — Railway origin until Gate 3 cutover",
    d1: db,
  });
}

async function handleStatus(request, env) {
  let waitlistCount = null;
  if (env.DB) {
    try {
      const row = await env.DB.prepare("SELECT COUNT(*) AS n FROM api_waitlist").first();
      waitlistCount = row?.n ?? 0;
    } catch {
      waitlistCount = null;
    }
  }
  return json({
    version: env.ALEFBA_VERSION || VERSION,
    instructMvp: env.INSTRUCT_MVP || "not_live",
    apiAlpha: "waitlist",
    migration: env.MIGRATION_PHASE || "g3_spike",
    waitlistRows: waitlistCount,
    gates: [
      { id: "G1", status: "pass" },
      { id: "G2", status: "in_progress" },
      { id: "G3", status: "pending" },
      { id: "G4", status: "pending" },
    ],
  });
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
      instructMvp: "not_live",
      migration: "g3_spike",
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
      instructMvp: "not_live",
      migration: "g3_spike",
      persisted: true,
    }, 201);
  } catch (err) {
    return json({ ok: false, error: String(err.message || err) }, 500);
  }
}

async function handleInterestPost(request, env) {
  const data = await readJson(request);
  const lane = ["invest", "participate", "donate"].includes(data?.lane) ? data.lane : "participate";
  const name = String(data?.name || "").trim().slice(0, 120);
  const email = String(data?.email || "").trim().slice(0, 180);
  if (!name || !email) {
    return json({ ok: false, error: "name_and_email_required" }, 400);
  }
  if (!env.DB) {
    return json({
      ok: true,
      migration: "g3_spike",
      persisted: false,
      stats: { counts: { total: 0, invest: 0, participate: 0, donate: 0 } },
    }, 201);
  }
  try {
    await env.DB.prepare(
      `INSERT INTO interest_leads (
         lane, name, email, role, amount, note, tier, lang, ref, show_on_wall
       ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)`
    )
      .bind(
        lane,
        name,
        email,
        String(data.role || "").trim().slice(0, 64) || null,
        String(data.amount || "").trim().slice(0, 64) || null,
        String(data.note || "").trim().slice(0, 2000) || null,
        String(data.tier || "").trim().slice(0, 64) || null,
        String(data.lang || "").trim().slice(0, 8) || null,
        String(data.ref || "").trim().slice(0, 64) || null,
        data.showOnWall === false ? 0 : 1
      )
      .run();
    const counts = await env.DB.prepare(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN lane = 'invest' THEN 1 ELSE 0 END) AS invest,
         SUM(CASE WHEN lane = 'participate' THEN 1 ELSE 0 END) AS participate,
         SUM(CASE WHEN lane = 'donate' THEN 1 ELSE 0 END) AS donate
       FROM interest_leads WHERE is_test = 0`
    ).first();
    return json({
      ok: true,
      migration: "g3_spike",
      persisted: true,
      stats: {
        counts: {
          total: counts?.total ?? 0,
          invest: counts?.invest ?? 0,
          participate: counts?.participate ?? 0,
          donate: counts?.donate ?? 0,
        },
      },
    }, 201);
  } catch (err) {
    return json({ ok: false, error: String(err.message || err) }, 500);
  }
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return withCors(request, new Response(null, { status: 204 }));
    }

    const url = new URL(request.url);
    const path = url.pathname;

    let response;
    if (path === "/api/v1/health" && request.method === "GET") {
      response = await handleHealth(request, env);
    } else if (path === "/api/v1/status" && request.method === "GET") {
      response = await handleStatus(request, env);
    } else if (path === "/api/v1/waitlist" && request.method === "POST") {
      response = await handleWaitlistPost(request, env);
    } else if (path === "/api/interest" && request.method === "POST") {
      response = await handleInterestPost(request, env);
    } else if (path === "/" && request.method === "GET") {
      response = json({
        service: "alefba-g3-worker",
        migration: env.MIGRATION_PHASE || "g3_spike",
        routes: ["/api/v1/health", "/api/v1/status", "/api/v1/waitlist", "/api/interest"],
      });
    } else {
      response = json({ ok: false, error: "not_found", migration: "g3_spike" }, 404);
    }

    return withCors(request, response);
  },
};
