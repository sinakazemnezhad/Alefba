/** D1 interest leads — founding wall + stats (G3 migration lane). */

const DONATE_GOAL_USD = 50000;

export function parseAmountUsd(raw) {
  if (raw == null || raw === "") return 0;
  const s = String(raw).toLowerCase().replace(/,/g, "").trim();
  const m = s.match(/(\d+(?:\.\d+)?)\s*(k|m)?/);
  if (!m) return 0;
  let n = Number(m[1]);
  if (m[2] === "k") n *= 1000;
  if (m[2] === "m") n *= 1_000_000;
  return Number.isFinite(n) ? n : 0;
}

export function firstName(name) {
  const t = String(name || "").trim();
  if (!t) return "Anon";
  return t.split(/\s+/)[0].slice(0, 24);
}

export function isTestRecord(r) {
  const email = String(r.email || "").toLowerCase();
  const name = String(r.name || "").toLowerCase();
  if (email.endsWith("@alefba.local")) return true;
  if (email.endsWith("@example.com")) return true;
  if (
    email.includes("e2e") ||
    email.includes("test") ||
    email.includes("smoke") ||
    email.includes("runtime-gate") ||
    email.includes("persist-probe")
  ) {
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

export function buildStatsFromRows(rows) {
  const counts = { invest: 0, participate: 0, donate: 0, total: 0 };
  let pledgedUsd = 0;
  const wall = [];

  for (const r of rows) {
    if (isTestRecord(r)) continue;
    const lane =
      r.lane === "invest" || r.lane === "participate" || r.lane === "donate" ? r.lane : "participate";
    counts[lane] += 1;
    counts.total += 1;
    if (lane === "donate") pledgedUsd += parseAmountUsd(r.amount);
    if (r.showOnWall !== false && r.show_on_wall !== 0) {
      wall.push({
        name: firstName(r.name),
        lane,
        at: r.at || r.created_at || null,
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
    progressPct:
      pledgedUsd <= 0 ? 0 : Math.max(1, Math.min(100, Math.round((pledgedUsd / DONATE_GOAL_USD) * 100))),
    wall: wall.slice(0, 40),
    updatedAt: new Date().toISOString(),
  };
}

export async function readInterestRows(env) {
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
    show_on_wall: r.show_on_wall,
  }));
}

export async function buildStatsFromD1(env) {
  const rows = await readInterestRows(env);
  return buildStatsFromRows(rows);
}

export function mergeStats(railwayStats, d1Stats) {
  if (!railwayStats && !d1Stats) return null;
  if (!railwayStats) return d1Stats;
  if (!d1Stats) return railwayStats;

  const counts = {
    invest: (railwayStats.counts?.invest ?? 0) + (d1Stats.counts?.invest ?? 0),
    participate: (railwayStats.counts?.participate ?? 0) + (d1Stats.counts?.participate ?? 0),
    donate: (railwayStats.counts?.donate ?? 0) + (d1Stats.counts?.donate ?? 0),
    total: (railwayStats.counts?.total ?? 0) + (d1Stats.counts?.total ?? 0),
  };

  const wallKeys = new Set();
  const wall = [];
  for (const entry of [...(railwayStats.wall || []), ...(d1Stats.wall || [])]) {
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
    progressPct:
      pledgedUsd <= 0 ? 0 : Math.max(1, Math.min(100, Math.round((pledgedUsd / goalUsd) * 100))),
    wall: wall.slice(0, 40),
    updatedAt: new Date().toISOString(),
    persist: "d1+railway",
  };
}
