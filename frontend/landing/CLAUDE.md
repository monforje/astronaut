# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Static marketing landing for Astronaut (Astro 7 + Tailwind 4, FSD). No backend, no API client, no
contract, no mocks. UI text is Russian, written inline in markup. Rules live in `docs/codestyle/`
(`fsd.md`, `codestyle.md`, `testing.md`); the visual style lives in `DESIGN.md`, so read it before
adding or changing a section. When a doc and a config disagree, the config wins. When a rule
changes, update the doc and its check in `codestyle.test.ts` together.

## Commands

Everything runs in Docker through go-task from this folder; don't run `bun`/`astro` on the host.
`task bun -- <args>` runs any bun command in a throwaway `oven/bun` container. Inside, the scripts
call Astro through `bun --bun`.

```bash
task bun -- run verify       # astro check + oxlint + steiger + codestyle.test.ts + format:check + vitest
task check                   # astro check (types), TypeScript 6; TS 7 is not supported by @astrojs/check
task lint                    # oxlint + lint:fsd (steiger) + lint:style (vitest run docs/codestyle)
task codestyle               # check + lint + format:check
task format                  # oxfmt for .ts/.css/.md + prettier (prettier-plugin-astro) for .astro
task test                    # vitest by FSD layer; task test-layer -- shared; task test-cover (≥ 70%)
task bun -- x vitest run src/pages/home/ui/home-page/HomePage.test.ts   # single test file
task bun -- add <pkg>        # dependencies; task deps-install = bun install when the lockfile changed
task build-site              # astro check + astro build → dist/
task test-e2e                # Playwright container against the running stand (E2E_BASE_URL)
```

The dev server is the compose container `frontend` (`bun run dev`) behind traefik, at
`https://landing.astronaut.localhost`: `task deploy` the first time (local CA cert, deps, traefik,
container), then `task start -- -d` / `task stop`, logs `task containers -- logs -f frontend`.

`deploy/local/` is the same template as in `frontend/demo-site`; change both copies identically.
Brand symlinks resolve inside containers only because `idea/skelet/brand` is mounted at
`/idea/skelet/brand`: in `compose.yml` for the dev server and through `DOCKER_BUN_RUN_ARGS` in
`Taskfile.yml` for `task bun`.

## Architecture

- **`srcDir` is `src/app`.** Astro requires routes in `<srcDir>/pages`, but `src/pages` is the FSD
  layer. So Astro routes are thin files in `src/app/pages/*.astro`: only `<Layout><XPage /></Layout>`
  with no markup of their own (`codestyle.test.ts` enforces this). A new screen means a slice in
  `src/pages/<screen>` plus a route file. Endpoints (`robots.txt.ts`) go there too; right now there
  is only `index.astro`.
- **FSD layers, imports only downward:** `app → pages → widgets → features → entities → shared`.
  Siblings don't import each other. Enter a slice only through its `index.ts` (`.astro` re-exported as
  `export { default as X } from "./X.astro"`); use `@/…` between slices and relative paths inside one.
  oxlint checks layer boundaries in `.ts` only; steiger and review cover `.astro`.
- **Module = folder**: kebab-case folder, a file named after it (`ui/site-header/SiteHeader.astro`),
  the test next to it, and a barrel `index.ts`. Named exports only.
- **Zero client JS by default.** `client:*` islands are allowed only in `features/` and need a reason;
  an island framework is added together with the first island, not ahead of it.
- `Layout` (`src/app/layout`) owns `<head>`, the skip link, `SiteHeader` and `<main id="content">`.
  SEO tags go only through `SeoHead`, via `Layout`'s `title`/`description`/`noindex` props. Env access
  only through `@/shared/config`, which exports nothing yet. `PUBLIC_SITE_URL` (`.env`, passed to the
  dev container by `compose.yml`) sets canonical and sitemap in `astro.config.ts`.
- `codestyle.test.ts` also enforces: no hex colors in markup (only `theme-color` in `Layout`);
  `import.meta.env`, `fetch` and `localStorage` only in their own segments; layer READMEs exist;
  tests sit beside code.

## Styles and brand

- CSS entry `src/app/styles/index.css`, imported in this order: Tailwind, then `brand.css`, then
  `tokens.css`, then `global.css`. Components use only the role utilities from `tokens.css`
  (`bg-bg`, `bg-surface`, `text-muted`, `bg-accent`, `text-accent-strong`, `bg-spark`…). Add a missing
  shade there as `color-mix` of brand colors, never as a new hex value.
- `global.css` defines the shared width utility `page-container` and the `animate-rise` animation.
- Component variants are typed props (`variant`, `size`) combined with `class:list`, not raw class
  strings passed in from outside.
- **Brand files are relative symlinks into `idea/skelet/brand/`, never copies:** the whole `public/`
  folder, `src/shared/brand/*.png` (rasters for `astro:assets`), `src/app/styles/brand.css`
  (→ `design/tokens.css`) and `src/app/styles/fonts/`. `astro.config.ts` sets `preserveSymlinks` and
  `server.fs.allow`; containers mount the brand folder (see Commands). A renamed brand file fails
  the "ссылки на бренд целы" check; re-point it with `ln -sfn`. An image needed by URL is linked in
  `idea/skelet/brand/public/`, not in the landing (steps: `idea/skelet/brand/README.md`). The full list is in
  `docs/codestyle/README.md`, section «Бренд».
- Section order, each section's job and draft copy live in `PLAN.md`; it follows the story arc in
  `idea/skelet/brand/messaging/story.md`, shared with the pitch and the letters. Change the arc there
  first, then the plan.
- Copy comes from `idea/skelet/brand/messaging/` (`phrases.md`, `cta.md`, voice in `voice.md`).
  Missing facts become `[TODO]`; never invent numbers, clients or cases.

## Tests

Vitest runs in the `node` environment with Astro's `getViteConfig`; a browser env would stub out
`.astro` files. Render components with `renderAstro(Component, { props, slots, request })` from
`@/shared/lib/test-utils` (Container API rendered into a happy-dom `Document`), then query the DOM.
Test behaviour and accessibility: one `h1`, anchors pointing at existing ids, SEO tags. Don't assert
Tailwind classes. `it("…")` names are in Russian. E2E scenarios go in `testing/e2e/*.e2e.ts` and
select by role or label.
