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

- Volume on `workspace/data`
- `NODE_ENV=production`, `ALEFBA_ADMIN_TOKEN`, `ALEFBA_SHA`, `ALEFBA_PUBLIC_ORIGIN`
- Optional: `ALEFBA_N8N_INTEREST_WEBHOOK`

## Live smoke

```bash
ALEFBA_BASE_URL=https://your-host ALEFBA_ADMIN_TOKEN=... npm run smoke:prod
```

## Honest gates (v0.2.8)

| Gate | Status |
|------|--------|
| G1 | `in_progress` — probe + fertility receipt on disk |
| G2–G4 | `pending` |
