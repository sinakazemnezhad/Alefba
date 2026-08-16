# Ship checklist · v0.2.8

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
| G2–G4 | `pending` |
