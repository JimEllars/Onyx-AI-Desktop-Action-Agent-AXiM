# Onyx AI Desktop Action Agent (Cloudflare Setup)

This app is configured for **Cloudflare Pages** deployment.

## 1. Install dependencies

```bash
npm ci
```

## 2. Authenticate Wrangler

```bash
npx wrangler login
npx wrangler whoami
```

## 3. Create the Cloudflare Pages project (one time)

```bash
npx wrangler pages project create onyx-ai-desktop-action-agent-axim
```

## 4. Deploy and activate

```bash
npm run cf:deploy:prod
```

This command builds the app and deploys `dist/` to Cloudflare Pages on the `main` branch.

## Environment variables (if needed)

If your app needs runtime env vars, add them in Cloudflare:

```bash
npx wrangler pages secret put <NAME> --project-name onyx-ai-desktop-action-agent-axim
```

Then redeploy with:

```bash
npm run cf:deploy:prod
```
