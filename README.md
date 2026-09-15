# Gram

Visual capacity planner: projects, sub-projects sized in dev-months, and a 12-month timeline to drag them onto.

- `/` is the landing page (`index.html`, static, no framework)
- `/app/` is the planner (`app/index.html` → React app in `src/`)

## Development

```sh
npm install
npm run dev        # Vite on http://localhost:5173 (proxies /api to :8787)
npm run dev:api    # Cloudflare Worker + local D1 on http://localhost:8787 (needs `npm run build` once)
```

Run `npm run db:migrate:local` once to create the local D1 table.

## Sharing

The app works fully offline with `localStorage`. Clicking **Share** publishes the current plan to a random id
and puts it in the URL (`/app/?p=<id>`). Anyone with that link sees the same plan; edits autosave and other open tabs
pick them up within ~10 seconds. The id is the only credential: keep links private.

Opening `/app/` without `?p=` shows your local plan, which is never overwritten by a shared one.

## Deploy (Cloudflare Workers, free tier)

The Worker in `worker/` serves the built app and a small JSON API backed by D1.

One-time setup:

```sh
npx wrangler login
npx wrangler d1 create gram          # copy the printed database_id into wrangler.jsonc
npm run db:migrate                   # creates the `plans` table in the remote database
```

Every deploy:

```sh
npm run deploy                       # = npm run build && wrangler deploy
```

Then attach your domain: Cloudflare dashboard → Workers & Pages → gram → Settings → Domains & Routes →
Add custom domain (`gram.nacx.cl`). The zone must be on Cloudflare DNS.

If you would rather keep hosting the static build elsewhere, deploy only the Worker and build the app with
`VITE_API_BASE=https://gram.<account>.workers.dev` so it talks to the API cross-origin (CORS is enabled).
