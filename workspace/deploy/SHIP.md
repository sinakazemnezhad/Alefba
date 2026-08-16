# Ship checklist · v0.2.8

## Phased hosting plan

Aligned to **G1→G4 gates** and the **18‑month commercial roadmap** in `governance/COMMERCIAL_SCIENTIFIC_PLAN.md`.

```text
STATIC + RECEIPTS  → cheap edge (CF Pages / GitHub Pages for PLR only)
LIGHT API + LEADS  → small origin (Railway) — current phase
INSTRUCT API (G3)  → CF Workers + D1 + GPU elsewhere
PRODUCT (G4)       → edge API + billing + optional Private VPC
```

| Phase | Months | Gate | Charter / API host | Persistence | Inference |
|-------|--------|------|-------------------|-------------|-----------|
| **P0 Charter** | 0–3 | G1 | **Railway** Node | Volume `PERSIST_DIR` | — |
| **P1 Science** | 3–8 | G2 | Railway or CF Pages + Railway API | Volume + R2 backups | External GPU |
| **P2 Instruct** | 8–12 | G3 | **CF Pages** + **Workers** | **D1** | Workers AI / rented API |
| **P3 Vertical** | 12–18 | G4 | CF Pages + Workers | D1 + usage metering | Dedicated GPU if justified |
| **Private (G4)** | 12+ | G4 | Customer VPC | Customer store | Customer or dedicated |

### Phase 0 · Now (G1 pass · G2 in progress) — **Option D selected**

**Canonical URL:** `https://alefba-production.up.railway.app` (no custom domain required).

| Do now | Why |
|--------|-----|
| Keep `ALEFBA_PUBLIC_ORIGIN` = Railway URL | Already set on production |
| Search Console on Railway URL | Sitemap submitted · 7 pages |
| CF account runbook | [CLOUDFLARE-ACCOUNT.md](./CLOUDFLARE-ACCOUNT.md) · `node scripts/cf-phase0-wire.mjs verify` |

**Cloudflare note:** CF cannot proxy `*.up.railway.app`. Edge on **sina.kazemnezhad.ca@gmail.com** CF account applies when you add a hostname on a zone you own (`wire` mode). Until then, Railway-only is correct for Option D.

Optional before custom hostname:

| Do now | Why |
|--------|-----|
| CF API token with **DNS Edit** on target zone | Enables `cf-phase0-wire.mjs wire` |
| Nightly lead backup → R2 | Survives origin migration |

**Do not:** buy a domain or rewrite to D1 until you choose a hostname or G3 ships.

### Phase 1 · G2 base score card (M8)

| Upgrade | Trigger |
|---------|---------|
| CF **Pages** for `public/` static | Site churn drops after G2 receipts stable |
| **R2** for large artifacts | Checkpoints / manifests > few MB |
| Training on **external GPU** | Never Railway — Modal / RunPod / bare GPU |
| **One PLR row** | After published G2 score card (founder order) |

PLR stays on **GitHub Pages** — separate product.

### Phase 2 · G3 instruct MVP (M12)

**Migration trigger:** real `/v1/chat` (or equivalent), API keys, 3 design partners.

| Layer | Target |
|-------|--------|
| Edge API | **Cloudflare Workers** |
| DB | **D1** (`interest_leads`, `api_waitlist`, `api_keys`, `api_usage`) |
| Charter | **CF Pages** |
| Inference | Workers AI (small) or external GPU API |

**Spike (schema + Worker stub only):** [g3-cloudflare/](./g3-cloudflare/README.md)

```text
Customer → CF (WAF, Pages, Workers)
              ├─ Pages: /, /white-paper.html, …
              ├─ Worker: /api/v1/*, /api/interest
              ├─ D1: leads, keys, usage
              └─ GPU provider: inference (rented)
```

Railway demoted to zero or admin-only cron after cutover.

### Phase 3 · G4 paid vertical (M18)

- Studio surface: CF Pages + Workers (multi-tenant)
- Usage metering + Stripe on Worker
- **Alefbâ Private:** customer VPC bundle — not Railway public origin

### Phase 4 · Post‑M18 scale

Self-hosted inference, Vectorize/RAG, multi-region — only after G4 revenue proves economics.

### Platform quick reference

| Platform | Alefbâ fit |
|----------|------------|
| **GitHub Pages** | PLR only — not Alefbâ API |
| **Railway** | Correct **now** — Node + volume |
| **CF Workers + D1 + Pages** | Correct **at G3** |
| **Vercel + Supabase** | Valid alternative at G3 if Postgres preferred |
| **CF Workers alone** | Edge API — needs Pages for static charter |

---

## Local preflight

```bash
cd workspace
npm run ship:preflight
```

Runs: `sync:content` → `train:tokenizer` → `test:g1` → `e2e` (108 checks).

## Git + CI

```bash
git init   # if first push
git add -A
git commit -m "Alefbâ v0.2.8 — G1 fertility, corpus shards, API stub, paper UI"
git push -u origin main
```

GHA `e2e.yml` must green on `0.2.8`.

## Railway

See [RAILWAY.md](./RAILWAY.md). Required:

- `NODE_ENV=production`, `ALEFBA_ADMIN_TOKEN`, `ALEFBA_SHA`, `ALEFBA_PUBLIC_ORIGIN`
- `PERSIST_DIR=/app/persistent` + volume `alefba-volume` mounted at `/app/persistent`
- Optional: `ALEFBA_N8N_INTEREST_WEBHOOK`

### Lead persistence invariant (production)

| Path | Storage | Files |
|------|---------|-------|
| `DATA_DIR` → `/app/data` (baked image) | Deploy artifact | `receipts.json`, G1 reports, corpus inventory, tokenizer specs |
| `PERSIST_DIR` → `/app/persistent` (Railway volume) | **Persistent** | `interest.jsonl`, `api-waitlist.jsonl` |

**Rule:** Never mount the volume at `/app/data` — it shadows baked science receipts. Leads only on `PERSIST_DIR`.

Verify after deploy:

```bash
# record total, redeploy, same total
curl -fsS "$BASE/api/stats"
ALEFBA_BASE_URL="$BASE" npm run smoke:prod
```

## Live smoke

```bash
ALEFBA_BASE_URL=https://your-host npm run smoke:prod
```

Post-deploy gate (GHA `deploy-railway.yml`): `railway up` → `smoke:prod` with `PROD_HEALTH_WAIT_SEC=300`.

**Deploy path:** push `main` → GHA only. Do not manually deploy from Railway dashboard.

## Honest gates (v0.2.8)

| Gate | Status |
|------|--------|
| G1 | `pass` — probe + live BLOOM-560m HF fertility receipt |
| G2 | `in_progress` — proxy score card published |
| G3–G4 | `pending` |

**G3 spike:** [g3-cloudflare/README.md](./g3-cloudflare/README.md) (Workers stub + D1 schema — not production).
