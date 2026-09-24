# Spec: Thial Brand Landing (v1)

Status: DRAFT — awaiting review
Source of truth for brand rules: `docs/brand/manual-de-marca-thial.pdf`

## Objective

Build a one-page brand landing site for **Thial**, an artisanal candle brand that
"turns stories into aromas" ("Historias que se pueden sentir"). The site runs on the
developer's local machine only (no deployment in v1).

**Primary visitor:** someone who found Thial (e.g. via Instagram) and wants to understand
what the brand is, what the collections are, and how to buy.

**What success looks like:** a visitor lands on the page, feels the brand (calm, warm,
elegant, editorial), understands the story-to-aroma concept, sees the four collections and
sample candles, and knows how to buy — in Spanish or English.

### User stories

- As a visitor, I see a hero with the Thial logo, the tagline and the central concept
  ("Tu historia todavía se está escribiendo.").
- As a visitor, I read a short origin/intro section that explains what Thial is.
- As a visitor, I see the brand values (Conexión, Autenticidad, Creatividad, Sensibilidad,
  Significado).
- As a visitor, I see the four collections (Personas, Lugares, Momentos, Experiencias) with a
  one-line description each.
- As a visitor, I see candle cards, each with: name, collection, aroma, short phrase.
- As a visitor, I read an FAQ.
- As a visitor, I see a "Cómo comprar" section with links to Instagram / WhatsApp (no cart).
- As a visitor, I switch between Spanish (default) and English, and the choice is kept in the URL.

### Page sections (in order)

1. Header — logo, section nav, language switch
2. Hero — logo, tagline, concept phrase, soft CTA ("Descubre las colecciones")
3. Introducción / Esencia — intro text + concept, purpose, philosophy, promise
4. Valores — 5 values, numbered 01–05, thin vertical dividers (manual p.6 layout)
5. Colecciones — 4 collections by story origin
6. Velas — candle cards (placeholder content until real list exists)
7. Preguntas frecuentes — accordion (native `<details>`)
8. Cómo comprar — steps + Instagram / WhatsApp links
9. Footer — logo, tagline, social links, © Thial

Out of scope for v1: cart, checkout, payments, CMS, per-candle pages, blog, deployment,
analytics, contact forms.

## Brand tokens (from the manual)

| Token | Value | Use |
|---|---|---|
| `--color-ivory` | `#fff9f4` | Page background |
| `--color-taupe` | `#6B5D5D` | Body text, headings, divider lines |
| `--color-raspberry` | `#b03b7a` | Logo, primary accent, links/CTA |
| `--color-sage` | `#68766B` | Secondary accent (nature) |
| `--color-lilac` | `#c28ec1` | Accent (emotion) |
| `--color-sky` | `#ace8f5` | Accent (freshness) |
| `--color-gold` | TBD (≈ `#b8943f`) | Fine details only (rules, icons) |

- **Display font:** The Seasons (commercial). v1 uses a free look-alike
  (Cormorant Garamond, self-hosted) until an Adobe Fonts kit is available.
- **Secondary font:** Prata (free, self-hosted via Fontsource).
- **Body font:** readable serif for long text (proposal: Lora — see Open Questions).
- **Layout language:** generous white space, thin 1px taupe rules, numbered items,
  centered editorial blocks, soft warm photography. No saturation, no clutter.
- **Voice rules (apply to all copy, both languages):** sensitive, warm, simple elegance.
  Avoid: hard-sell language or purchase pressure, clichés, childish look, exaggerated
  emotional promises, telling the customer what to feel, invented stories.

## Tech Stack

- Node.js 24 (installed: v24.21.0), npm 12
- Astro (latest stable at scaffold time) — static output, zero client JS by default
- Astro built-in i18n routing: `defaultLocale: "es"`, `locales: ["es", "en"]`,
  `prefixDefaultLocale: false` → `/` is Spanish, `/en/` is English
- Astro content collections for candles and collections (typed with Zod schemas)
- Plain CSS with custom properties (no Tailwind) — brand tokens in one file
- Fonts self-hosted via `@fontsource/*` packages (works offline)
- Testing: Vitest (unit), Playwright (e2e smoke + accessibility with `@axe-core/playwright`)

## Commands

```
Install:        npm install
Dev server:     npm run dev              # http://localhost:4321
Build:          npm run build            # static output in dist/
Preview build:  npm run preview
Type check:     npm run check            # astro check
Unit tests:     npm test                 # vitest run
E2E tests:      npm run test:e2e         # playwright test (builds + previews first)
Format:         npm run format           # prettier --write .
```

## Project Structure

```
thial-ui/
├── SPEC.md                    # This spec
├── docs/brand/                # Manual PDF, logo sources, stationery (reference only)
├── astro.config.mjs           # i18n + site config
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/
│   │   ├── logo/              # thial-logo.svg (vector from Drive logo PDF, currentColor)
│   │   └── images/            # hero, moodboard, candle photos (placeholders cropped from manual)
│   ├── content/
│   │   ├── candles/           # one .md/.json per candle, es + en fields
│   │   └── collections/       # personas, lugares, momentos, experiencias
│   ├── content.config.ts      # Zod schemas for content collections
│   ├── i18n/
│   │   ├── es.json            # UI strings (Spanish)
│   │   ├── en.json            # UI strings (English)
│   │   └── utils.ts           # t(), getLocale(), localized paths
│   ├── components/            # Header, Hero, Values, Collections, CandleCard, Faq, HowToBuy, Footer, Divider
│   ├── layouts/
│   │   └── BaseLayout.astro   # <html lang>, fonts, meta, tokens
│   ├── pages/
│   │   ├── index.astro        # Spanish
│   │   └── en/index.astro     # English
│   └── styles/
│       ├── tokens.css         # brand colors, fonts, spacing
│       └── global.css         # reset + base typography
├── tests/
│   ├── unit/                  # Vitest: i18n utils, content schema
│   └── e2e/                   # Playwright: smoke, i18n, a11y
└── tasks/
    ├── plan.md
    └── todo.md
```

## Code Style

- Astro components, one per section, PascalCase filenames.
- Components take already-translated data as props; they do not import locale files.
- CSS: component-scoped `<style>` blocks; only tokens and base styles are global.
- Only use brand tokens for color. No raw hex values outside `tokens.css`.
- Semantic HTML first (`<header>`, `<section aria-labelledby>`, `<details>`), JS only when needed.
- Prettier defaults + `prettier-plugin-astro`.

```astro
---
// src/components/Values.astro
import Divider from "./Divider.astro";

interface Props {
  title: string;
  items: { name: string; text: string }[];
}
const { title, items } = Astro.props;
---

<section class="values" aria-labelledby="values-title">
  <h2 id="values-title">{title}</h2>
  <ol>
    {items.map((item, i) => (
      <li>
        <span class="number">{String(i + 1).padStart(2, "0")}</span>
        <Divider vertical />
        <h3>{item.name}</h3>
        <p>{item.text}</p>
      </li>
    ))}
  </ol>
</section>

<style>
  .values ol {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
    gap: var(--space-l);
    list-style: none;
    text-align: center;
  }
  .number {
    font-family: var(--font-display);
    color: var(--color-taupe);
  }
</style>
```

## Testing Strategy

| Level | Tool | What | Location |
|---|---|---|---|
| Static | `astro check` | Types, props, content schema | — |
| Unit | Vitest | i18n helpers (`t()`, locale paths), EN/ES key parity | `tests/unit/` |
| E2E smoke | Playwright (Chromium) | `/` and `/en/` load, no console errors, all sections present, language switch works | `tests/e2e/` |
| Accessibility | `@axe-core/playwright` | No serious/critical violations on both locales | `tests/e2e/` |

No coverage target in v1 (logic is thin); the key-parity test is required.

## Boundaries

- **Always:**
  - Use brand tokens from `tokens.css`; follow the manual's voice rules in every piece of copy.
  - Keep ES and EN string files in sync (the parity test enforces this).
  - Run `npm run check && npm test` before each commit.
  - Give every image meaningful `alt` text in both languages.
- **Ask first:**
  - Adding any dependency not listed in Tech Stack.
  - Writing or changing real brand copy (candle names, stories, FAQ answers).
  - Committing the brand manual PDF or photos to git.
  - Adding client-side JavaScript beyond the language switch / small progressive enhancements.
- **Never:**
  - Invent a founder's personal story or put the founder's private details (manual p.11) on
    the site without explicit approval.
  - Use the template leftovers from the manual (`unsitiogenial.es`, "SANDRA HARO",
    lorem ipsum, "NOMBRE DE LA MARCA").
  - Add a cart, payments or tracking in v1.
  - Commit secrets or Adobe Fonts kit IDs.

## Success Criteria

1. `npm install && npm run dev` starts the site at `http://localhost:4321` on a clean clone.
2. `/` renders in Spanish and `/en/` renders in English; the language switch keeps the section.
3. All 9 sections render in the order above in both languages.
4. Only brand palette colors appear (verified by reviewing `tokens.css` usage; no stray hex).
5. Layout works from 360px to 1440px width with no horizontal scroll.
6. `npm run build` succeeds with zero errors; `npm run check` has zero errors.
7. `npm test` and `npm run test:e2e` pass, including axe with no serious/critical violations.
8. Text contrast meets WCAG AA. Measured on ivory `#fff9f4`: taupe 6.00:1, raspberry
   5.36:1, sage 4.58:1 (all pass for text). Lilac (2.53:1) and sky are for decoration only,
   never for text.
9. Lighthouse (local, desktop) Performance ≥ 90 and Accessibility ≥ 95.
10. The site works offline after `npm install` (fonts self-hosted, no CDN).

## Open Questions

1. **Logo file:** please add the Thial logo (SVG preferred) to `src/assets/logo/`, or tell me
   its path. Do you also have a monogram/icon version for the favicon?
2. **Body font:** the manual lists only The Seasons + Prata. Is Lora (or similar) OK for
   long paragraphs, or should body text use Prata?
3. **The Seasons fallback:** is Cormorant Garamond acceptable until you have an Adobe Fonts kit?
4. **Gold hex:** the manual shows gold only as an image. Do you have an exact value?
5. **Photos:** OK to crop images from the PDF (cover candle, moodboard) as placeholders?
6. **Candles & FAQ content:** I'll write placeholder candles (2 per collection) and FAQ in
   the brand voice, clearly marked as placeholders. OK?
7. **Buy links:** Instagram handle and WhatsApp number (or leave `#` placeholders)?
8. **English copy:** I translate from the manual's Spanish, keeping the voice rules — OK, or
   will you provide English text?
9. **Founder story (manual p.11):** include a short, softened "Historia de origen" section, or
   leave it out of v1?
10. **Git:** should the brand manual PDF be committed, or added to `.gitignore`?
