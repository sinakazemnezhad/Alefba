# Alefbâ production environment

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `NODE_ENV` | yes | `production` | Enables export auth gate |
| `ALEFBA_HOST` | yes | `0.0.0.0` | Railway bind |
| `ALEFBA_PORT` | auto | `5293` | Falls back to Railway `PORT` when set |
| `ALEFBA_SHA` | yes | `abc123…` | Set from GHA on deploy |
| `ALEFBA_ADMIN_TOKEN` | yes | *(secret)* | Required for `/api/interest/export.*` |
| `ALEFBA_PUBLIC_ORIGIN` | recommended | `https://alefba.example` | Restricts CORS |
| `ALEFBA_DONATE_GOAL` | optional | `50000` | Thermometer goal USD |
| `ALEFBA_N8N_INTEREST_WEBHOOK` | optional | `https://n8n…/webhook/alefba-interest` | New interest notify |

## Persistent data

Mount volume at `workspace/data` (or set `DATA_DIR` if extended later):

- `interest.jsonl` — pledges
- `receipts.json` — gates
- `content-manifest.json` — SSOT sync output
- `g1-run-report.json` — harness receipts

## Health

```bash
curl -fsS "$BASE/api/health"
curl -fsS "$BASE/api/release.json"
```

## Smoke

```bash
ALEFBA_BASE_URL=https://your-railway-host npm run smoke:prod
```
