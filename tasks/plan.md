# Plan: Thial Brand Landing v1 (implements SPEC.md)

## Context

The repo `thial-ui` has only a README, `.gitignore` and the brand manual PDF. `SPEC.md` (draft)
defines a one-page bilingual (ES default at `/`, EN at `/en/`) Astro landing for the Thial
candle brand, run locally. This plan turns the spec into ordered, verifiable tasks and
resolves the spec's open questions with the user's answers:

- Logo + assets: download from the Thial Google Drive folder
  (`1TrLuuZs1dwGHvfjDbRDeSuUAiL3TiBuv`) into the repo.
- Fonts: Cormorant Garamond (stand-in for The Seasons) + Prata + Lora, self-hosted.
- Buy links: `#` placeholders, kept in one config file.
- Commit the brand manual PDF to git.
- Not answered → spec defaults apply: placeholder candles (2 per collection) + FAQ written in
  brand voice and marked `placeholder: true`; English translated by me; no founder-story
  section in v1; moodboard/cover photos cropped from the manual PDF as placeholder images.

## Drive inventory (verified, read-only)

| Drive file | ID | Use |
|---|---|---|
| Logo/LOGO THIAL.pdf (vector, 305 KB) | `17Hh5y5jo0J1GEPf8Qxsaxz3xrrQQtNBK` | Source for SVG logo |
| PNG/LOGO THIAL 1..4 (~18 KB each) | `18-IWheV75fZHJLMtwmIxnTobw1JbmHne`, `1ntOWK98WEmhJaNWyqxJsra1ljCX6usQn`, `1OeahiWdGa6mDDbXMfcpNcoVmuRzB0ALx`, `1TIbxNicsAbH5IT48BBQBa2eagS-em9nC` | Logo variants (fallback, favicon) |
| Papelería/tarjeta THIAL .pdf | `1-SAfK7R6wnbrAO0oF3e_f_XCEDEza7sV` | Reference: card design (candle card style) |
| Papelería/HOJA MEMBRETE THIAL.pdf | `13YqwaHDPgofBCaQ1QuoR6Y6Yu6pzrzWh` | Reference: letterhead |
| Skipped | — | `.ai` sources (not web-usable), 41 MB `manual THIAL.pdf` (duplicate of repo PDF), `JPEG/` logo copies (duplicates of PNGs) |

## Tasks (vertical slices, each ends green)

**T1 — Assets + repo hygiene**
- Download the files above via Drive MCP `download_file_content` → decode base64.
  - Logos → `src/assets/logo/` (kebab-case names, e.g. `thial-logo-1.png`).
  - Stationery PDFs → `docs/brand/` (reference only, not served).
- Look at each PNG to label variants (color / white / monogram) and rename accordingly.
- Convert `LOGO THIAL.pdf` → `thial-logo.svg` using a scratchpad-only tool (`mupdf` npm WASM
  SVG writer). If output is unusable, use the best PNG variant and note it in SPEC.
- Crop placeholder photos from the manual PDF (cover candle p.2, moodboard p.15, Instagram
  grid p.16) using the scratchpad `pdf-to-img` renderer at scale 3 → `src/assets/images/`.
- `.gitignore`: add `*:Zone.Identifier`, `node_modules/`, `dist/`, `.astro/`,
  `test-results/`, `playwright-report/`.
- Move `Manual de marca Thial.pdf` → `docs/brand/` and commit it.
- Verify: `ls src/assets/logo src/assets/images docs/brand`; open each image once.

**T2 — Scaffold Astro**
- `npm create astro@latest . -- --template minimal --typescript strict --no-git --install`
- `astro.config.mjs`: `i18n: { defaultLocale: "es", locales: ["es","en"], routing: { prefixDefaultLocale: false } }`.
- Add scripts from SPEC Commands; add Prettier + `prettier-plugin-astro`.
- Verify: `npm run dev` serves `http://localhost:4321`; `npm run check` 0 errors.

**T3 — Tokens, fonts, base layout**
- `src/styles/tokens.css`: palette + `--color-gold` (sample hex from manual p.18 gold image),
  font stacks, spacing scale (`--space-xs..xl`), `--rule: 1px solid var(--color-taupe)`.
- `@fontsource/cormorant-garamond`, `@fontsource/prata`, `@fontsource/lora` imported in
  `BaseLayout.astro`.
- `src/styles/global.css`: reset, ivory background, taupe text, heading/body fonts.
- `src/components/Divider.astro` (horizontal/vertical thin rule).
- Verify: page shows ivory bg + fonts load with network offline (DevTools).

**T4 — i18n core (TDD)**
- Tests first in `tests/unit/i18n.test.ts`: `t(locale, key)`, `localizedPath(locale, path)`,
  `getLocaleFromUrl(url)`, and ES/EN key parity (deep keys equal).
- `src/i18n/es.json`, `en.json`, `utils.ts`. Strings from the manual (hero, intro, esencia,
  values, collections, FAQ, how-to-buy, footer).
- `src/config/links.ts`: `instagram: "#"`, `whatsapp: "#"`.
- Verify: `npm test` passes.

**T5 — Content collections**
- `src/content.config.ts`: `collections` (id, order, name{es,en}, description{es,en}) and
  `candles` (name{es,en}, collection ref, aroma{es,en}, phrase{es,en}, image?, placeholder bool).
- Data: 4 collection files + 8 placeholder candles (JSON) in brand voice.
- Verify: `npm run check` validates schema.

**T6 — Sections**
- Components per SPEC: `Header` (logo, nav anchors, lang switch link), `Hero`, `Essence`,
  `Values`, `Collections`, `CandleCard` + `Candles`, `Faq` (`<details>`), `HowToBuy`, `Footer`.
- Visual language from manual: numbered 01–05 items with vertical rules, centered editorial
  blocks, raspberry for logo/CTA only, lilac/sky decorative only (contrast rule).
- Verify: visual check at 360 / 768 / 1440 px, no horizontal scroll.

**T7 — Pages + language switch**
- `src/pages/index.astro` (es) and `src/pages/en/index.astro` (en) both render a shared
  `LandingPage.astro` with locale prop. Lang switch keeps `#hash` via tiny inline script
  (progressive enhancement; plain link works without JS).
- `<html lang>`, `hreflang` alternates, localized `<title>`/meta description.
- Verify: `/` ES, `/en/` EN, switching keeps section.

**T8 — E2E + a11y + perf**
- Playwright config with `webServer: npm run build && npm run preview`.
- `tests/e2e/smoke.spec.ts`: both locales load, no console errors, 9 sections in order,
  lang switch; `tests/e2e/a11y.spec.ts`: axe, no serious/critical.
- Run Lighthouse once locally (`npx lighthouse http://localhost:4321 --preset=desktop`).
- Verify: `npm run test:e2e` green; Lighthouse Perf ≥ 90, A11y ≥ 95.

**T9 — Docs**
- Update `SPEC.md`: status Approved, Open Questions → Decisions, asset paths.
- Write `tasks/plan.md` (this plan) + `tasks/todo.md` (checkbox list T1–T9).
- README: how to run (`npm install`, `npm run dev`).

Commits: one per task (Conventional Commits), on branch `feat/landing-v1`; no push/PR
unless asked.

## Critical files

`astro.config.mjs`, `src/styles/tokens.css`, `src/i18n/{es,en}.json`, `src/i18n/utils.ts`,
`src/content.config.ts`, `src/components/*.astro`, `src/pages/index.astro`,
`src/pages/en/index.astro`, `tests/unit/i18n.test.ts`, `tests/e2e/*.spec.ts`, `.gitignore`,
`SPEC.md`.

## Verification (end-to-end)

1. `npm install && npm run dev` → open `http://localhost:4321` and `/en/`.
2. `npm run check && npm test && npm run build` → all zero errors.
3. `npm run test:e2e` → smoke + axe pass.
4. Manual: resize 360→1440 px, toggle language, disable network → fonts still render.
5. Lighthouse desktop: Perf ≥ 90, A11y ≥ 95.
