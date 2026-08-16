# G3 Cloudflare spike (Workers + D1)

**Status:** spike only — **not** production traffic. Railway remains the live origin until Gate 3 instruct MVP.

## Contents

| File | Purpose |
|------|---------|
| `schema.sql` | D1 tables: leads, waitlist, design partners, API keys, usage |
| `wrangler.jsonc` | Worker binding config |
| `src/index.mjs` | Stub routes mirroring future G3 API surface |

## Local dev

```bash
cd workspace/deploy/g3-cloudflare
npm i -g wrangler   # or npx wrangler
wrangler d1 create alefba-g3          # once — copy database_id into wrangler.jsonc
wrangler d1 execute alefba-g3 --local --file=./schema.sql
wrangler dev
```

Smoke the stub:

```bash
curl -sS http://localhost:8787/api/v1/health | jq
curl -sS -X POST http://localhost:8787/api/v1/waitlist \
  -H 'content-type: application/json' \
  -d '{"name":"Partner","email":"partner@example.com","useCase":"EdTech"}'
```

## Remote (when founder authorizes G3 cutover)

1. `wrangler d1 create alefba-g3` → set `database_id` in `wrangler.jsonc`
2. `wrangler d1 execute alefba-g3 --remote --file=./schema.sql`
3. Migrate `interest.jsonl` + `api-waitlist.jsonl` from Railway volume → D1
4. Deploy Worker; route `alefba.example.com/api/*` on Cloudflare
5. Move charter HTML to CF Pages; keep science JSON baked or on R2

See [SHIP.md](../SHIP.md) phased hosting plan and [CLOUDFLARE.md](../CLOUDFLARE.md) edge DNS.

## Gate 3 cutover checklist

- [ ] D1 schema applied (remote)
- [ ] Leads migrated from `PERSIST_DIR`
- [ ] Worker routes live behind custom domain
- [ ] Railway demoted to admin/cron or retired
- [ ] `smoke:prod` updated for CF origin
- [ ] G3 gate evidence: 3 design partners in `design_partners` table
