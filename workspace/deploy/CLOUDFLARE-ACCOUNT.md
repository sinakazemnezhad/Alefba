# Cloudflare · sina.kazemnezhad.ca@gmail.com account

**Founder choice:** Option **D** — canonical URL stays Railway:

`https://alefba-production.up.railway.app`

Search Console + sitemap already on this URL. **No custom domain purchase required.**

## What Cloudflare cannot do on Option D

Cloudflare cannot proxy `*.up.railway.app` — Railway owns that zone. Orange-cloud only works on a **hostname you control** in your Cloudflare account (e.g. `alefba.yourdomain.com`).

So Phase 0 for **D** = Railway production is complete. Cloudflare is **optional until you add a hostname** on a zone in this account.

## Current token check (this shell)

Run:

```bash
cd workspace
node scripts/cf-phase0-wire.mjs verify
```

Observed on 2026-08-16:

| Item | Status |
|------|--------|
| `CLOUDFLARE_API_TOKEN` | Valid |
| Zones listed | `sourceb.ca` only |
| DNS edit on zone | **Blocked** (token needs Zone → DNS → Edit) |

To wire Alefbâ on this CF account, create an API token in the dashboard for **sina.kazemnezhad.ca@gmail.com**:

1. Cloudflare → My Profile → API Tokens → Create Token  
2. Template: **Edit zone DNS** (or custom: Zone:Read, DNS:Edit)  
3. Zone resources: **Include** → the zone you will use for Alefbâ (or all zones on this account)  
4. Store as `CLOUDFLARE_API_TOKEN` in shell / GitHub secret `CLOUDFLARE_API_TOKEN` on `sinakazemnezhad/Alefba`

**Do not** commit the token to git.

## When you add a custom hostname later

1. Add zone to this CF account (or pick subdomain on an existing zone).  
2. `node scripts/cf-phase0-wire.mjs wire --hostname alefba.YOURDOMAIN.com --zone YOURDOMAIN.com`  
3. `railway domain alefba.YOURDOMAIN.com`  
4. `railway variables --set ALEFBA_PUBLIC_ORIGIN=https://alefba.YOURDOMAIN.com`  
5. Update `seo.js` / sitemap `SITE_ORIGIN` + redeploy  
6. New Search Console property + sitemap submit  

## Railway production (Option D — live)

| Variable | Value |
|----------|--------|
| `ALEFBA_PUBLIC_ORIGIN` | `https://alefba-production.up.railway.app` |
| `RAILWAY_PUBLIC_DOMAIN` | `alefba-production.up.railway.app` |

Verify:

```bash
curl -fsS https://alefba-production.up.railway.app/api/health
node scripts/cf-phase0-wire.mjs railway-only
```

## G3 (later)

Workers + D1 spike lives in [g3-cloudflare/](./g3-cloudflare/README.md) — deploy to **this same CF account** when Gate 3 instruct API ships.
