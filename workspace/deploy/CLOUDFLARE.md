# Cloudflare edge for Alefbâ (Railway origin)

## DNS

1. Create CNAME: `alefba` (or apex via CNAME flattening) → Railway service hostname (`*.up.railway.app`).
2. Proxy status: **Proxied** (orange cloud) for WAF + SSL.

## SSL

- Mode: **Full (strict)** when Railway serves valid TLS.
- Minimum TLS: 1.2

## Cache rules (recommended at launch)

| Path | Cache |
|------|-------|
| `/api/*` | Bypass |
| `*.html` | Bypass or TTL 5m |
| `*.js`, `*.css` | Bypass during `?v=` churn, then edge TTL 1h |

## Security (optional)

- **Cloudflare Access** on `/api/interest/export*` as backup to `ALEFBA_ADMIN_TOKEN`.
- Bot fight mode: moderate — do not block legitimate Persian crawlers aggressively.

## Verify after DNS propagate

```bash
curl -fsS https://your-domain/api/health
curl -fsS https://your-domain/api/release.json
```

Origin header should match `ALEFBA_PUBLIC_ORIGIN` if CORS restriction is enabled.
