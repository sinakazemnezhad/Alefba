/**
 * Alefbâ standalone edge — Cloudflare Pages (static) + Worker (API).
 * NOT Noetfield · NOT SourceB · NOT PLR. Railway = persist origin only when needed.
 */

const VERSION = "0.2.8";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
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
  return json({
    version: env.ALEFBA_VERSION || VERSION,
    surface: "alefba-standalone-edge",
    instructMvp: env.INSTRUCT_MVP || "not_live",
    apiAlpha: "waitlist",
    gates: [
      { id: "G1", status: "pass" },
      { id: "G2", status: "in_progress" },
      { id: "G3", status: "pending" },
      { id: "G4", status: "pending" },
    ],
  });
}

async function handleWorkerApi(request, env) {
  const url = new URL(request.url);
  if (url.pathname === "/robots.txt" || url.pathname === "/sitemap.xml") {
    return proxyToRailway(request, env);
  }
  if (url.pathname === "/api/v1/health" && request.method === "GET") {
    return handleV1Health(env);
  }
  if (url.pathname === "/api/v1/status" && request.method === "GET") {
    return handleV1Status(env);
  }
  return proxyToRailway(request, env);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/") || url.pathname === "/robots.txt" || url.pathname === "/sitemap.xml") {
      return handleWorkerApi(request, env);
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
