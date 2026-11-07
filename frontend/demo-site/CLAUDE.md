# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Demo site of Astronaut (React 19 + Vite + TanStack Query + valibot + zustand, FSD). The monorepo-level `/CLAUDE.md` (two folders up) already covers the Docker/go-task workflow, brand symlinks and the FSD rules — read it first; this file only adds what is specific to working inside `frontend/demo-site/`.

## Commands (run from this folder, never `bun`/`vite` on the host)

```bash
task bun -- run verify                 # tsc + oxlint + steiger + codestyle.test.ts + oxfmt --check + vitest
task bun -- x vitest run src/path/File.test.tsx      # one test file
task bun -- x vitest run -t "название теста"         # one test by name (names are Russian)
task format                            # oxfmt --write . (only oxfmt/oxlint/steiger; no eslint/prettier)
task gen-api / task api-check          # orval client from the contract; api-check fails on git diff
task deploy → task start -- -d         # dev server at https://demo.astronaut.localhost
task test-e2e                          # Playwright (testing/e2e), needs the running stand
```

## Where things are

- `docs/codestyle/{fsd,codestyle,testing}.md` — the rules; `codestyle.test.ts` there enforces what linters can't (module = folder with `index.ts` + same-named file, kebab-case folders, tests beside code, `import.meta.env`/`fetch`/`localStorage` only in their own segments, no inline styles, error-code texts). When a doc and a config (`oxlint.config.ts`, `steiger.config.js`) disagree, the config wins.
- `docs/codestyle/` is a template shared with other projects: change a rule there in the template first, then here.
- Each layer under `src/` has a `README.md` (the codestyle test requires it).

## Adding an endpoint (order matters)

1. Describe it in `contract/openapi.yaml`.
2. `task gen-api` → `src/shared/api/generated` (committed, never hand-edit). A new tag also needs `export * from "./generated/<tag>/<tag>"` in `src/shared/api/index.ts`.
3. Add `mocks/handlers/<tag>.ts` and register it in `mocks/handlers/index.ts`; seed data in `mocks/seed.ts`. See `mocks/README.md`.
4. Wrap the generated hook in `entities/<x>/api`; mutations go in `features`. Pages must not import generated hooks directly.

## Mock backend

With `VITE_API_MOCK=true` (default in `.env.example`) `src/main.tsx` starts MSW before rendering; data lives in `localStorage` under `astronaut:mock-db:v1` (reset: `mockDb.reset()` in the browser console). App code must not reference `mocks/`; component tests mock at the `fetch` boundary with `mockApi` from `@/shared/lib/test-utils`, not through MSW handlers.

## Design

Read `DESIGN.md` (this folder) before any UI work. Source of truth is the UI kit `frontend/ui-kit` (per-component specs in `frontend/ui-kit/src/entries/<id>/README.md`): MCP `astronaut-ui-kit`, skill `ui-kit`, `llms.txt` at https://ui-kit.astronaut.localhost/llms.txt. Brand: `idea/skelet/brand`.

- **Do NOT use `frontend/landing` or the existing demo-site styles as a reference.** Don't carry over buttons, radii, shadows or layout tricks from the current front.
- Colors only as kit roles (no HEX), Onest for the UI, Fira Code only for code and logs; numbers and IDs are not mono.
- If `DESIGN.md` changes, update it in the same change as the code.
- How the kit is wired into demo-site (package / workspace) is not decided yet: `[TODO]` in `DESIGN.md`, section "Как подключить кит". Don't copy kit components or tokens into `src/`.

## State of the project

Bare skeleton: no brand symlinks, `public/`, CSS or design tokens yet — components are plain HTML, UI texts are Russian inline in JSX. `DESIGN.md` is written; the UI kit is not yet connected (`[TODO]`, see above), so styling has not started. `widgets/app-shell` and `app/layout/Layout.tsx` are in progress (uncommitted). When styling starts, wire the brand the way `docs/codestyle/README.md` ("Бренд") describes (symlinks into `idea/skelet/brand/`, and mount the brand folder in `compose.yml` and `DOCKER_BUN_RUN_ARGS`), following `DESIGN.md`.
