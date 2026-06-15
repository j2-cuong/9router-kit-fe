# 9router Next Web

Modern Next.js marketing site and API-key dashboard for 9router.

## Run

```powershell
cd D:\Soucre\9router-kit\NEXT-WEB
npm install
npm run dev
```

By default it talks to the Go Server at:

```env
NEXT_PUBLIC_API_BASE=http://127.0.0.1:49281
```

If you deploy Next on the same public domain as the web frontend, you can leave `NEXT_PUBLIC_API_BASE` empty and set `SERVER_API_BASE` for server-side rewrites. The app routes `/auth/*`, `/account/*`, `/admin/*`, `/telegram/*`, `/v1/*`, and `/v1beta/*` to the Go Server.

## Routes

- `/` - SEO/GEO optimized landing page with smoke canvas and premium model cards.
- `/login` - API key web activation using `/auth/api-key/login`, plus account login/register. Warn users not to activate keys for another buyer.
- `/dashboard` - API key dashboard with quota, time left, and activated device information.

Newly approved API keys start as `activation_required`. Buyers must log in at `https://agent-gateway.site/` with the API key to bind it to their own device before runtime API calls are allowed. Key expiration is still counted from approval/issue time, even before activation.
