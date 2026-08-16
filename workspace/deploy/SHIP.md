# Ship checklist · v0.2.8

## Phased hosting plan

Aligned to **G1→G4 gates** and the **18‑month commercial roadmap** in `governance/COMMERCIAL_SCIENTIFIC_PLAN.md`.

```text
STANDALONE ALEFBÂ ONLY — not Noetfield · not SourceB · not PLR hosting

CF Pages + Workers (alefba)  → public charter + edge API
Railway (alefba)             → lead persist + science JSON origin (until D1)
```

See [STANDALONE.md](./STANDALONE.md).

| Phase | Months | Gate | Public edge | Persist / API origin |
|-------|--------|------|-------------|----------------------|
| **P0 Charter** | 0–3 | G1 | **CF Pages + Worker** + Railway URL fallback | Railway volume |
| **P1 Science** | 3–8 | G2 | CF Pages + Worker | Railway + R2 backups |
| **P2 Instruct** | 8–12 | G3 | CF Pages + Worker + **D1** | D1 leads; Railway optional |
| **P3 Vertical** | 12–18 | G4 | CF Pages + Worker | D1 + billing |

### Phase 0 · Now (deploy standalone edge)

| Step | Command / doc |
|------|----------------|
| Standalone law | [STANDALONE.md](./STANDALONE.md) |
| CF Pages + Worker | [alefba-edge/README.md](./alefba-edge/README.md) |
| Railway origin (persist) | [RAILWAY.md](./RAILWAY.md) — `RAILWAY_ORIGIN` in Worker |
| CF account | [CLOUDFLARE-ACCOUNT.md](./CLOUDFLARE-ACCOUNT.md) |

```bash
cd workspace/deploy/alefba-edge && npm install && npm run deploy
```

Public URL becomes `https://alefba.<account>.workers.dev` (standalone). Railway stays origin for `/api/interest` until D1.

Search Console today: Railway URL. After CF cutover: new property on workers.dev or Alefbâ-only custom domain.

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
