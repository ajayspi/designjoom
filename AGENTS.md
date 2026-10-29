# designjoom.com — A V Ajay Kiran

Astro 7 + Tailwind CSS v4. Static site, no UI framework. Deployed to Vercel from `main`.

## Commands

```bash
pnpm install
pnpm dev            # astro dev on :4321
pnpm build          # astro build -> dist/
pnpm preview        # serve dist/ on :4321

pnpm verify         # SEO/AEO assertions against dist/  — the test suite
pnpm parity <url>   # behavioural assertions against a running site
```

**`pnpm verify` and `pnpm parity` are the tests.** There is no test framework in this
repo and there should not be — a static site does not need Vitest. Both scripts assert
against real output (`dist/` or a served URL) and exit non-zero on failure. Run both
after any change; a change that ships with either red is not done.

First `astro build` after a dependency change takes ~70s (dep optimisation + type
generation). Steady state is ~3-7s. That is normal, not a hang.

## Project structure

```
astro.config.mjs        site URL, sitemap integration, Tailwind via @tailwindcss/vite
public/                 copied verbatim to dist/ — robots.txt, llms.txt, favicon,
                        ajay-kiran.png (stable schema: URL), og-image.jpg
src/
  seo.ts                identity, metadata, quick facts, results ledger, FAQ
  data.ts               projects, experience, skills (unchanged since the React era)
  index.css             Tailwind import, design tokens, global CSS, reduced-motion
  layouts/Base.astro    <head> (all metadata + JSON-LD), skip link, cursor markup
  components/*.astro    one file per section; markup is static HTML, no hydration
  lib/chart.ts          build-time SVG geometry (sparkline, area, radar, bars)
  scripts/*.ts          the only client JS: reveal, counters, nav, cursor,
                        canvas, typewriter, dom (shared readiness guard)
  pages/index.astro     composes the sections in order
scripts/verify.mjs      dist/ assertions: head, social, schema, content, assets
scripts/parity.mjs      behavioural assertions against a served URL
docs/geo-prompt-panel.md  the 12 fixed prompts + monthly citation log
```

## Rules that are not obvious

- **`src/seo.ts` is the single source of identity.** `IDENTITY.name` and
  `IDENTITY.descriptor` are the canonical strings used verbatim in the `<title>`, the
  `<h1>` and the JSON-LD `Person` node. Change them there, nowhere else, or the
  declared entity drifts.
- **Answer content must be visible to users, not just to crawlers.** The FAQ, quick
  facts and results table exist in the rendered page *and* in the schema. Content served
  only to crawlers is cloaking — a ranking penalty and a lie.
- **Never let a script own visibility.** Reveal-on-scroll hides content behind
  `[data-reveal-ready]`, which `reveal.ts` sets only after attaching an observer, plus a
  3s fallback. If you touch that logic, keep the invariant: no JS, an early-running
  script, or a dead observer must all leave the page readable.
- **Git LFS will silently break site images.** `*.png`, `*.jpg` and `*.webp` are
  LFS-tracked by `.gitattributes`. Every image the site actually serves needs a raw
  exception appended at the **END** of that file — later rules override earlier ones.
  An LFS pointer shipped as content is exactly how the hero photo broke once before;
  `verify.mjs` and `parity.mjs` both grep `dist/` for `git-lfs` to stop it recurring.
- **`astro.config.mjs` sets `vite.configFile: false` on purpose.** The old Figma Make
  `vite.config.ts` must never leak into Astro's Vite instance.
- **Tailwind only.** No CSS frameworks, no component libraries. Icons live in
  `Icon.astro` as inlined lucide geometry rather than a runtime icon package.
- **prefers-reduced-motion is honoured** site-wide: framer is gone, so animations are
  CSS keyframes killed by the backstop in `index.css`, and the JS scripts check
  `matchMedia` before animating.
- **Content honesty is non-negotiable.** Every metric traces to a verified source in
  `src/data.ts`. No invented numbers, testimonials, clients or credentials. If a fact is
  unavailable, omit the element — do not approximate it.

## History

`v1` is the original Figma Make site. `v2` is the React/Vite SPA (e8b1912), preserved
because it was live until this migration; tag `pre-astro-vite` points at the same commit.
`main` is the Astro site. Do not force-push `main`.
