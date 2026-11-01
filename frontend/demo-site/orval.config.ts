import { defineConfig } from "orval";

/**
 * Клиент API генерируется из OpenAPI-контракта бэкенда. Какого — задаёт `BACKEND` в `.env`:
 * `task gen-api` передаёт путь `../../backend/${BACKEND}/schema/openapi/openapi.yaml` в `API_CONTRACT`.
 * Запуск: `task gen-api` (или `API_CONTRACT=… bun run api:gen`).
 *
 * Результат — `src/shared/api/generated`: типы схем и хуки TanStack Query
 * (GET → `useXxx`, остальное → `useXxx` мутации). Генерируемое КОММИТИТСЯ,
 * руками не правится и исключено из oxlint / oxfmt / steiger. Совпадение с контрактом
 * проверяет `task api-check`.
 */
export default defineConfig({
  api: {
    input: process.env.API_CONTRACT ?? "./contract/openapi.yaml",
    output: {
      mode: "tags-split",
      target: "src/shared/api/generated",
      schemas: "src/shared/api/generated/model",
      client: "react-query",
      httpClient: "fetch",
      baseUrl: "/api/v1",
      clean: true,
      indexFiles: true,
      mock: false,
      override: {
        mutator: { path: "./src/shared/api/http-client/httpClient.ts", name: "customFetch" },
        query: { signal: true, useInvalidate: true, shouldExportKeys: true },
        fetch: { includeHttpResponseReturnType: false },
      },
    },
  },
});
