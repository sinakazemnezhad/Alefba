# Cloudflare · Alefbâ standalone account

**Account:** sina.kazemnezhad.ca@gmail.com  
**Law:** Alefbâ only — **not** Noetfield · **not** SourceB · **not** PLR. See [STANDALONE.md](./STANDALONE.md).

## Stack

| Piece | Project name | Role |
|-------|--------------|------|
| **Workers + Pages** | `alefba` | Public charter + edge API ([alefba-edge/](./alefba-edge/README.md)) |
| **Railway** | `alefba` | Origin for lead persist + science JSON (`RAILWAY_ORIGIN`) |
| **D1** | `alefba-g3` | G3 instruct leads (schema in [g3-cloudflare/schema.sql](./g3-cloudflare/schema.sql)) |

## Dashboard (this account)

| Surface | Link |
|---------|------|
| **Home** | https://dash.cloudflare.com/0d0b967b77e2e5535455d39ff3dae72c/home |
| **Workers & Pages** | https://dash.cloudflare.com/0d0b967b77e2e5535455d39ff3dae72c/workers-and-pages |
| **Worker `alefba`** | https://dash.cloudflare.com/0d0b967b77e2e5535455d39ff3dae72c/workers/services/view/alefba/production |
| **D1 `alefba-g3`** | https://dash.cloudflare.com/0d0b967b77e2e5535455d39ff3dae72c/workers/d1 |


| | |
|---|---|
| **URL** | https://alefba.sina-kazemnezhad-ca.workers.dev |
| **Account** | `0d0b967b77e2e5535455d39ff3dae72c` |
| **D1** | `alefba-g3` · schema applied |

Railway remains origin for `/api/interest` and science JSON (`RAILWAY_ORIGIN`).

## Deploy standalone edge

```bash
cd workspace/deploy/alefba-edge
npm install
# Add account_id to wrangler.jsonc (CF dashboard → Workers & Pages)
npm run deploy
```

### API token permissions (this account only)

Create token on **sina.kazemnezhad.ca@gmail.com**:

- Account → **Workers Scripts:Edit**
- Account → **Cloudflare Pages:Edit**
- (Optional) Account → **D1:Edit** for G3

Store:

```bash
gh secret set CLOUDFLARE_API_TOKEN -R sinakazemnezhad/Alefba
gh variable set CLOUDFLARE_ACCOUNT_ID -R sinakazemnezhad/Alefba --body 0d0b967b77e2e5535455d39ff3dae72c
```

**Do not** reuse Noetfield or SourceB zone tokens for Alefbâ deploy.

## Railway origin (optional but live today)

| Variable | Value |
|----------|--------|
| `RAILWAY_ORIGIN` (Worker var) | `https://alefba-production.up.railway.app` |
| `ALEFBA_PUBLIC_ORIGIN` (Railway) | same |

Worker proxies `/api/interest`, `/api/stats`, receipts, sitemap, etc. to Railway. Edge serves `/api/v1/health` and `/api/v1/status` locally.

## Custom domain (later, Alefbâ-only zone)

When you add a zone on **this** CF account (not another product’s zone):

```bash
node scripts/cf-phase0-wire.mjs wire --hostname alefba.YOURDOMAIN.com --zone YOURDOMAIN.com
```

Then attach route in `alefba-edge/wrangler.jsonc` or CF dashboard → Worker route.

## Verify token

```bash
cd workspace && npm run cf:verify
```
