# Onyx AI Desktop Action Agent

Onyx has three independent deployment surfaces:

| Surface | Service | Production endpoint |
| --- | --- | --- |
| Browser UI | Cloudflare Pages | `https://onyx-ai-desktop-action-agent-axim.pages.dev` |
| Telemetry API | Cloudflare Worker + D1 | `https://onyx-edge.axim.us.com` |
| Realtime and workflow data | Supabase | Configure per project |

## Cloudflare

Install each JavaScript project, then deploy the Worker before the Pages app:

```bash
npm ci
cd edge-bridge && npm ci
npx wrangler d1 migrations apply onyx-edge-bridge-db --remote
npx wrangler deploy
cd ..
npm run cf:deploy:prod
```

The Worker configuration and D1 migration are version controlled in `edge-bridge/`. The custom domain, existing KV bindings, hourly cleanup trigger, observability, and D1 binding are all declared in `edge-bridge/wrangler.jsonc`.

The Pages build receives `VITE_ONYX_EDGE_API_URL` from `.env.production`. This value is intentionally public; it is an API origin, not a credential.

## Supabase

Copy `.env.example` to `.env.local` and set only the project URL and publishable/anon key:

```bash
Copy-Item .env.example .env.local
```

Do not use a Supabase service-role key in a `VITE_` variable. Until these two browser-safe values are supplied, the UI continues to use Cloudflare telemetry but disables Supabase realtime subscriptions instead of attempting to connect to an empty project.

The Supabase CLI project is linked to `pvbcdndqjguzqeafhwhw`. Apply tracked authentication migrations with:

```bash
npx supabase db push --linked
```

`operator_profiles` is created automatically for every Supabase Auth user and is protected by owner-only RLS. The current UI references additional existing Supabase tables and Edge Functions (`events`, `telemetry_events`, `hitl_audit_logs`, `app_registry`, `webrtc-handshake`, and `notify-email`). Review their existing policies before enabling administrative write actions for additional roles.
