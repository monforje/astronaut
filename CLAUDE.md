# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Astronaut is a data-integration platform for logistics/transport companies (1C, CRM, carrier/terminal portals, e-document operators, customs software, MDM, an AI agent), starting with Vladivostok. It is at the **idea stage**: no customer conversations yet, no backend. The repo is mostly Russian-language product documentation plus two frontends (demo site, landing).

| Path | What |
|---|---|
| `idea/product/` | Plain-language product description (start at `10-shpargalka.md` for the one-page summary). No jargon: write "груз, декларация, накладная, 1С", not "интеграционная шина / мастер-данные / коннектор" |
| `idea/skelet/` | Detailed workup: pains, competitors, layers/MVP, logistics flow, `decisions.md` (decision log with решено/гипотеза status), glossary, brand |
| `idea/mvp/` | MVP: `mvp-usecases.md` и `mvp-promises.md` (симлинки на `idea/skelet/product/`), `ddd-contexts.md` (области, mermaid; PNG в `ddd-images/` пересобираются `bash idea/mvp/utils/build-diagrams.sh`), `usecases/` (по папке на юзкейс: `user-view`, `tasks`, `business-logic`, `backend`; общие `fake-data.md` и `side-nav.md`) |
| `idea/questions.md` | Single list of open questions for the whole project |
| `content/` | Telegram post drafts, one `NNN-slug/` folder per post (own `CLAUDE.md`: formats, preview render, text rules). Nothing is sent to the channel without the user's explicit "да" |
| `frontend/demo-site/` | React demo site |
| `frontend/ui-kit/` | UI kit (design-system dictionary + components in `@/ui`), `https://ui-kit.astronaut.localhost`; MCP server `astronaut-ui-kit` (`.mcp.json`, `task mcp`) and skill `ui-kit` (`.claude/skills/ui-kit/`) — agents building UI take components from it |
| `frontend/landing/` | Astro landing (own `CLAUDE.md`, `DESIGN.md`, and `PLAN.md` — section order and copy, following the shared story arc in `idea/skelet/brand/messaging/story.md`) |

Conventions for `idea/` (from README files): every decision goes to `idea/skelet/decisions.md` with a status; unresolved items go to `idea/questions.md`; new terms go to `idea/skelet/glossary/terms.md`; each new file is added to the map in the folder README. Never invent facts or numbers — missing data becomes `[TODO]`. Prices in `idea/product/05-stoimost.md` are a starting hypothesis, not validated. Old material lives only on git branch `old` (`begining/`), read-only reference.

`idea/skelet/astronaut-idea.pdf` is generated: `uv run idea/skelet/utils/scripts/idea-pdf.py`. Likewise `idea/product/product.pdf`: `uv run idea/product/utils/scripts/product-pdf.py`. Rebuild both PDFs after changing the docs they cover.

## Frontends: everything runs in Docker via go-task

Both frontends are containerized. **Don't run `bun`/`bunx`/`vite`/`astro` on the host** — run them through Task from the project folder, which starts a throwaway `oven/bun` container (`deploy/local/lang/bun/Taskfile.yml`):

```bash
task bun -- run verify                 # any bun command: task bun -- <args>
task bun -- x vitest run <file>        # single test file
task bun -- add <pkg>                  # dependencies (task deps-install = bun install if lockfile changed)
task codestyle | task lint | task check | task format
task test | task test-layer -- shared | task test-cover   # vitest by FSD layer / one layer / coverage ≥ 70%
task test-e2e                          # Playwright in its own container against the running stand
```

The dev server is a long-running compose container behind traefik, not a host process: `task deploy` (local CA cert, deps, traefik, container), then `task start -- -d` / `task stop`, logs `task containers -- logs -f frontend`, a command inside it `task command -- <cmd>`. Addresses: `https://demo.astronaut.localhost`, `https://landing.astronaut.localhost`. From the repo root, `task deploy` brings up both and prints the addresses; `task test` / `task lint` / `task codestyle` fan out to every project (`deploy/local/group`).

- `deploy/local/` is the same template in both frontends (the root `Taskfile.yml` takes `group` from demo-site). Change it in both copies identically.
- **Brand files are relative symlinks into `idea/skelet/brand/`** (the whole `public/` → `idea/skelet/brand/public`, `src/app/styles/{brand.css,roles.css,fonts}`, and in demo-site `src/shared/ui/theme/theme.ts`; in landing also `src/shared/brand/*.{png,jpg}` and the whole `src/shared/brand/photos/` folder, where a dropped photo shows up on the page by itself). Containers only see them because the brand folder is mounted at `/idea/skelet/brand`: `compose.yml` does this for the dev server, `DOCKER_BUN_RUN_ARGS` in each project's `Taskfile.yml` for `task bun`. `codestyle.test.ts` checks "ссылки на бренд целы". **Adding a brand file a front needs by URL:** put the source in `idea/skelet/brand/`, then a relative link in `idea/skelet/brand/public/` at the URL path (`ln -sr idea/skelet/brand/icons/x.svg idea/skelet/brand/public/brand/icons/`), and commit both; nothing changes inside the fronts. `codestyle.test.ts` fails on a copy (non-link) in `public/` and on a `/brand/…` URL in code with no file there. Steps: `idea/skelet/brand/README.md`. If the brand folder moves, re-point the links (`ln -sfn <path> <link>`) and update `compose.yml`, both `Taskfile.yml`, `vite.config.ts` / `astro.config.ts` and `docs/codestyle/README.md`.

## Landing (`frontend/landing/`)

Astro 7 + Tailwind 4, FSD, static, no backend. All sections are built; the page stays `noindex` while it shows `[TODO]`. «Записаться на демо» opens a Telegram chat (`DEMO_URL`), no form. Commands, architecture and brand wiring: `frontend/landing/CLAUDE.md`. **Visual style: read `frontend/landing/DESIGN.md` before adding or changing any section**; if the style changes in code, update DESIGN.md in the same change.

## Demo site (`frontend/demo-site/`)

Bun + Vite + React 19 + TanStack Query + valibot + zustand; FSD architecture. Currently a bare FSD skeleton: `app` (routes, layout, providers, error boundary), pages `home` / `not-found`, `entities/system` (the example chain contract → generated hook → entity UI), `shared/{api,config,lib,ui}`. No design or styling yet: no `public/`, no CSS, no brand links — components are plain HTML. Tooling is oxlint/oxfmt/steiger (not eslint/prettier).

Design: read `frontend/demo-site/DESIGN.md`; the reference is the UI kit `frontend/ui-kit`, not the landing.

```bash
task bun -- run verify      # tsc + oxlint + steiger + codestyle.test.ts + oxfmt --check + vitest
task check                  # tsc only
task lint                   # oxlint + steiger (lint:fsd) + codestyle rules (lint:style)
task format                 # oxfmt --write .
task bun -- x vitest run path/to/File.test.tsx
task gen-api                # orval: contract → src/shared/api/generated (mounts the monorepo root)
task api-check              # regenerate and fail on git diff
```

Architecture (details in `docs/codestyle/{fsd,codestyle,testing}.md` — read them before adding code; when a doc and a config disagree, the config wins):

- **FSD layers, imports only downward:** `app → pages → widgets → features → entities → shared`. Siblings in a layer don't import each other. Enter a slice only through its `index.ts`; between slices use `@/…` aliases, inside a slice relative paths.
- **Module = folder** with a barrel `index.ts`, a file named after the folder (`ui/archive-button/ArchiveButton.tsx`), and the test + CSS Module beside it. Folders kebab-case, components PascalCase, hooks `useXxx`. `docs/codestyle/codestyle.test.ts` enforces naming/layout, plus rules like `import.meta.env`/`fetch`/`localStorage` only in their own segments.
- **API is contract-first:** `contract/openapi.yaml` → orval → `src/shared/api/generated` (committed, never hand-edited). Entities wrap generated hooks in `entities/<x>/api`; features hold mutations. New endpoint = contract, then `task gen-api`, then a mock handler in `mocks/handlers/<tag>.ts` (see `mocks/README.md`). When `backend/<BACKEND>` appears, `gen-api` takes its contract instead.
- **No backend yet:** MSW mocks in `mocks/` answer `/api/v1` in the browser (`VITE_API_MOCK=true`, data in localStorage). App code must not know about mocks. Component tests mock at the `fetch` boundary (`mockApi` from `@/shared/lib/test-utils`), not via `mocks/`.
- UI texts are Russian, written inline in JSX; test names (`it("…")`) are Russian. Env access only via `@/shared/config`. Zod is not used (valibot); server state only in TanStack Query.
