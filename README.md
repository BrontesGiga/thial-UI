# Thial UI

Landing page for **Thial**, handmade candles that turn stories into scents.
Built with [Astro](https://astro.build). Spanish at `/`, English at `/en/`.

See [SPEC.md](SPEC.md) for scope, brand rules and decisions.

## Run locally

Requires Node.js 22.12 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:4321.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server at `localhost:4321` |
| `npm run build` | Static build in `dist/` |
| `npm run preview` | Serve the build |
| `npm run check` | Type check (`astro check`) |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | Build, preview and run Playwright + axe |
| `npm run format` | Prettier |

### First e2e run

```bash
npx playwright install chromium
sudo npx playwright install-deps chromium
```

## Where things live

- Copy (ES/EN): `src/i18n/es.json`, `src/i18n/en.json` — keep keys identical (a test checks it).
- Collections and candles: `src/content/collections/`, `src/content/candles/` (one JSON per item).
- Brand colors and fonts: `src/styles/tokens.css`.
- Buy links: `src/config/links.ts`.
- Brand manual, logo sources, stationery: `docs/brand/`.
