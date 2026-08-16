#!/usr/bin/env node
/**
 * Phase 0 · Cloudflare edge wire (optional custom hostname → Railway origin)
 *
 * Option D (default): canonical URL stays alefba-production.up.railway.app — no CF DNS required.
 * When you add a hostname on a zone in your CF account, run wire mode.
 *
 * Usage:
 *   node scripts/cf-phase0-wire.mjs verify
 *   node scripts/cf-phase0-wire.mjs wire --hostname alefba.example.com --zone example.com
 *
 * Env:
 *   CLOUDFLARE_API_TOKEN — Zone:Read + DNS:Edit on target zone
 *   RAILWAY_TOKEN — for railway domain add (optional; can add in Railway UI)
 */

const CF_TOKEN = process.env.CLOUDFLARE_API_TOKEN || "";
const RAILWAY_HOST = process.env.RAILWAY_PUBLIC_HOST || "alefba-production.up.railway.app";
const RAILWAY_CANONICAL = `https://${RAILWAY_HOST}`;

async function cf(path, opts = {}) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${CF_TOKEN}`,
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });
  const body = await res.json();
  if (!body.success) {
    const msg = body.errors?.map((e) => e.message).join("; ") || res.statusText;
    throw new Error(`Cloudflare API: ${msg}`);
  }
  return body;
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--hostname") args.hostname = argv[++i];
    else if (a === "--zone") args.zone = argv[++i];
    else if (a === "--railway-host") args.railwayHost = argv[++i];
    else args._.push(a);
  }
  return args;
}

async function verifyToken() {
  if (!CF_TOKEN) {
    console.log("RED  CLOUDFLARE_API_TOKEN not set");
    return false;
  }
  const verify = await cf("/user/tokens/verify");
  console.log("PASS token active", verify.result?.status || "ok");

  const zones = await cf("/zones?per_page=50");
  console.log(`\nZones visible to this token (${zones.result.length}):`);
  for (const z of zones.result) {
    let dns = "no access";
    try {
      const rec = await cf(`/zones/${z.id}/dns_records?per_page=1`);
      dns = `DNS ok (${rec.result.length} shown)`;
    } catch (err) {
      dns = `DNS blocked: ${err.message}`;
    }
    console.log(`  ${z.name}  ${z.id}  ${z.status}  ${dns}`);
  }

  console.log(`\nOption D canonical (no CF wire required): ${RAILWAY_CANONICAL}`);
  return true;
}

async function findZone(zoneName) {
  const zones = await cf(`/zones?name=${encodeURIComponent(zoneName)}`);
  const zone = zones.result?.[0];
  if (!zone) throw new Error(`Zone not found: ${zoneName}`);
  return zone;
}

async function upsertCname(zoneId, hostname, zoneName, target) {
  const host = hostname.replace(/^https?:\/\//, "").split("/")[0].toLowerCase();
  const zone = zoneName.toLowerCase();
  let recordName = host;
  if (host === zone) recordName = "@";
  else if (host.endsWith(`.${zone}`)) recordName = host.slice(0, -(zone.length + 1));

  const existing = await cf(
    `/zones/${zoneId}/dns_records?type=CNAME&name=${encodeURIComponent(host)}`
  );
  const payload = {
    type: "CNAME",
    name: recordName,
    content: target,
    proxied: true,
  };
  if (existing.result?.length) {
    const id = existing.result[0].id;
    await cf(`/zones/${zoneId}/dns_records/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    console.log(`PASS updated CNAME ${host} → ${target} (proxied)`);
  } else {
    await cf(`/zones/${zoneId}/dns_records`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    console.log(`PASS created CNAME ${host} → ${target} (proxied)`);
  }
}

async function wire(hostname, zoneName, railwayHost) {
  if (!hostname.startsWith("http")) hostname = `https://${hostname}`;
  const url = new URL(hostname);
  const host = url.hostname;
  const zone = zoneName || host.split(".").slice(-2).join(".");
  const target = railwayHost || RAILWAY_HOST;

  console.log(`Wire ${host} (zone ${zone}) → ${target}\n`);
  const z = await findZone(zone);
  await upsertCname(z.id, host, zone, target);

  console.log("\nNext (Railway custom domain):");
  console.log(`  railway domain ${host}`);
  console.log(`  railway variables --set ALEFBA_PUBLIC_ORIGIN=https://${host}`);
  console.log("\nThen update repo canonical/sitemap origin and redeploy.");
  console.log("Re-submit sitemap in Google Search Console for the new property URL.");
}

async function main() {
  const args = parseArgs(process.argv);
  const cmd = args._[0] || "verify";

  if (cmd === "verify") {
    await verifyToken();
    return;
  }

  if (cmd === "railway-only") {
    console.log(`Option D — canonical Railway URL:\n  ${RAILWAY_CANONICAL}`);
    console.log("\nAlready set on production if ALEFBA_PUBLIC_ORIGIN matches.");
    console.log("Cloudflare not required until you add a custom hostname on your zone.");
    return;
  }

  if (cmd === "wire") {
    if (!args.hostname) {
      console.error("wire requires --hostname alefba.yourdomain.com [--zone yourdomain.com]");
      process.exit(1);
    }
    await wire(args.hostname, args.zone, args.railwayHost);
    return;
  }

  console.error(`Unknown command: ${cmd}`);
  process.exit(1);
}

main().catch((err) => {
  console.error("RED", err.message || err);
  process.exit(1);
});
