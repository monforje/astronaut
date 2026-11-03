# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Astronaut is a data-integration platform for logistics/transport companies (1C, CRM, carrier/terminal portals, e-document operators, customs software, MDM, an AI agent), starting with Vladivostok. It is at the **idea stage**: no customer conversations yet, no backend. The repo is mostly Russian-language product documentation plus one frontend demo.

| Path | What |
|---|---|
| `idea/product/` | Plain-language product description (start at `10-shpargalka.md` for the one-page summary). No jargon: write "груз, декларация, накладная, 1С", not "интеграционная шина / мастер-данные / коннектор" |
| `idea/skelet/` | Detailed workup: pains, competitors, layers/MVP, logistics flow, `decisions.md` (decision log with решено/гипотеза status), glossary, brand |
| `idea/questions.md` | Single list of open questions for the whole project |
| `frontend/demo-site/` | React demo site (the only code) |

Conventions for `idea/` (from README files): every decision goes to `idea/skelet/decisions.md` with a status; unresolved items go to `idea/questions.md`; new terms go to `idea/skelet/glossary/terms.md`; each new file is added to the map in the folder README. Never invent facts or numbers — missing data becomes `[TODO]`. Prices in `idea/product/05-stoimost.md` are a starting hypothesis, not validated. Old material lives only on git branch `old` (`begining/`), read-only reference.

`idea/skelet/astronaut-idea.pdf` is generated: `uv run idea/skelet/utils/scripts/idea-pdf.py`.

## Frontend (`frontend/demo-site/`)

Bun + Vite + React 19 + Mantine + TanStack Query + valibot + zustand; FSD architecture. Tooling is oxlint/oxfmt/steiger (not eslint/prettier). Go-task wraps everything in Docker (`oven/bun`); scripts can also be run directly with `bun run <script>` from `frontend/demo-site/`.

```bash
bun run dev                 # vite dev server (mocks on by default)
bun run verify              # tsc + oxlint + steiger + codestyle.test.ts + oxfmt --check + vitest
bun run check               # tsc only
bun run lint                # oxlint + steiger (lint:fsd) + codestyle rules (lint:style)
bun run format              # oxfmt --write .
bun x vitest run path/to/File.test.tsx      # single test file
bun run api:gen             # regenerate src/shared/api/generated from the OpenAPI contract
task deploy | task test | task test-layer -- shared | task test-cover | task test-e2e | task gen-api | task api-check
```

Architecture (details in `docs/codestyle/{fsd,codestyle,testing}.md` — read them before adding code; when a doc and a config disagree, the config wins):

- **FSD layers, imports only downward:** `app → pages → widgets → features → entities → shared`. Siblings in a layer don't import each other. Enter a slice only through its `index.ts`; between slices use `@/…` aliases, inside a slice relative paths.
- **Module = folder** with a barrel `index.ts`, a file named after the folder (`ui/archive-button/ArchiveButton.tsx`), and the test + CSS Module beside it. Folders kebab-case, components PascalCase, hooks `useXxx`. `docs/codestyle/codestyle.test.ts` enforces naming/layout, plus rules like `import.meta.env`/`fetch`/`localStorage` only in their own segments.
- **API is contract-first:** `contract/openapi.yaml` → orval → `src/shared/api/generated` (committed, never hand-edited). Entities wrap generated hooks in `entities/<x>/api`; features hold mutations. New endpoint = contract, then `api:gen`, then a mock handler in `mocks/handlers/<tag>.ts` (see `mocks/README.md`).
- **No backend yet:** MSW mocks in `mocks/` answer `/api/v1` in the browser (`VITE_API_MOCK=true`, data in localStorage). App code must not know about mocks. Component tests mock at the `fetch` boundary (`mockApi` from `@/shared/lib/test-utils`), not via `mocks/`.
- UI texts are Russian, written inline in JSX; test names (`it("…")`) are Russian. Env access only via `@/shared/config`. Zod is not used (valibot); server state only in TanStack Query.

### Known breakage

Brand files are wired into the frontend as relative **symlinks to `idea/brand/…`** (`public/favicon.*`, `public/brand/*`, `src/app/styles/{brand.css,fonts}`, `src/shared/ui/theme/theme.ts`, plus `compose.yml` mount and the "ссылки на бренд целы" check in `codestyle.test.ts`). The brand folder has since moved to `idea/skelet/brand/`, so these symlinks are currently **dangling** — expect build/test failures from them until they are re-pointed (`ln -sfn <path> <link>`) and `compose.yml` is updated. The docs under `docs/codestyle/` still say `idea/brand/`.
