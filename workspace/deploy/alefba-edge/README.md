# Alefbâ standalone edge (Cloudflare Pages + Worker)

**Product:** Alefbâ only. **Not** Noetfield · **not** SourceB · **not** PLR.

| Layer | Role |
|-------|------|
| **Cloudflare Pages** | Static charter (`workspace/public`) |
| **Cloudflare Worker** | `/api/v1/health`, `/api/v1/status` on edge; other `/api/*` → Railway |
| **Railway** | Lead persistence + science JSON APIs until D1 cutover |

## Account

Cloudflare: **sina.kazemnezhad.ca@gmail.com** (standalone Alefbâ account — separate from any other product).

## Local dev

```bash
cd workspace/deploy/alefba-edge
npm install
# Set account_id in wrangler.jsonc from CF dashboard → Workers & Pages → Account details
npm run dev
```

Open `http://localhost:8787/` — static from `public/`; `/api/stats` proxies to Railway.

## Deploy

```bash
cd workspace/deploy/alefba-edge
npm run deploy
```

Produces a **workers.dev** URL — **live:**

**https://alefba.sina-kazemnezhad-ca.workers.dev**

Account ID: `0d0b967b77e2e5535455d39ff3dae72c` · D1 `alefba-g3` (`35ac9849-4fb3-42df-ac65-c1ddb90cb532`).

Or attach a custom domain later on **this** CF account only.

### Required secrets (GitHub or shell)

| Secret | Permission |
|--------|------------|
| `CLOUDFLARE_API_TOKEN` | Account → Cloudflare Pages:Edit, Workers Scripts:Edit |
| `CLOUDFLARE_ACCOUNT_ID` | Dashboard → account ID |

```bash
gh secret set CLOUDFLARE_API_TOKEN -R sinakazemnezhad/Alefba
gh secret set CLOUDFLARE_ACCOUNT_ID -R sinakazemnezhad/Alefba
```

## Architecture

```text
Browser → CF Worker (alefba)
            ├─ /*           → Pages assets (public/)
            ├─ /api/v1/health|status → Worker (edge)
            └─ /api/*       → Railway origin (persist + receipts)
```

D1 schema (G3): [g3-cloudflare/schema.sql](../g3-cloudflare/schema.sql)

## Search Console

When you cutover public URL from Railway to `workers.dev` or a custom domain on this account, add a **new** Search Console property and resubmit sitemap.

Railway URL can remain as hidden origin (`RAILWAY_ORIGIN` var).
