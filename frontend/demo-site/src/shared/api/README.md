# shared/api

Клиент API бэкенда.

```
api/
  generated/          orval из контракта (task gen-api) — коммитится, руками не правится
    <тег>/<тег>.ts    функции запросов, хуки TanStack Query, ключи запросов, invalidate-хелперы
    model/            типы схем OpenAPI (SystemInfo, ErrorCode…)
  http-client/        customFetch — мутатор orval: базовый URL, CSRF, обновление сессии, ApiError
  index.ts            наружу: ApiError, customFetch, setSessionRefresh и всё сгенерированное
```

## Правила

- Контракт: пока бэкенда нет — `contract/openapi.yaml` во фронте, отвечает мок-бэкенд `mocks/`
  (`mocks/README.md`); появится `backend/${BACKEND}` — `task gen-api` возьмёт его контракт.
- Каждый запрос идёт через `customFetch`: он ставит `X-CSRF-Token` изменяющим запросам, превращает
  `application/problem+json` в `ApiError(status, code, message, fieldErrors, retryAfter)` и, если включено
  `setSessionRefresh`, один раз продлевает сессию на 401 и повторяет запрос.
- Контракт изменился → `task gen-api` (локально — `bun run api:gen`). Что клиент не отстал от контракта —
  `task api-check`.
- Сгенерированные хуки не вызываются из страниц напрямую — их оборачивают сущности (`entities/*/api`)
  и фичи (`features/*/model`).
- Новый тег контракта → строка `export * from "./generated/<тег>/<тег>"` в `index.ts`.
