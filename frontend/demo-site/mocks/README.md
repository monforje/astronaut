# mocks — мок-бэкенд

Бэкенда пока нет: API отвечает [MSW](https://mswjs.io) прямо в браузере. Service worker перехватывает
`fetch` к `/api/v1`, поэтому сгенерированный клиент, `customFetch`, `ApiError` и TanStack Query работают
так же, как с настоящим бэкендом. Код приложения про моки не знает: появится бэкенд — `VITE_API_MOCK=false`,
и те же запросы уйдут на сервер.

```
mocks/
  browser.ts          запуск в браузере (main.tsx, если env.apiMock)
  db.ts               хранилище: таблицы в памяти + копия в localStorage
  seed.ts             начальные данные — что видно на чистом стенде
  http.ts             API (префикс путей), latency, problem / notFound, parseBody (valibot)
  handlers/
    index.ts          список всех обработчиков
    system.ts         GET /system/info — пример обработчика
```

## Как это включено

- `VITE_API_MOCK` (`.env.example`): по умолчанию моки **включены**, `false` — выключены.
- `src/main.tsx` до рендера вызывает `startMockApi()` из `browser.ts`.
- Воркер `/mockServiceWorker.js` отдаёт плагин `msw/vite` (`vite.config.ts`) — и в dev, и в сборке, так что
  демо можно выложить статикой без бэкенда.
- Данные живут в `localStorage` (ключ `astronaut:mock-db:v1`) и переживают перезагрузку. Сбросить к сиду —
  в консоли браузера `mockDb.reset()`.

## Порядок: сначала контракт, потом мок

Типы API во фронте берутся только из контракта (`docs/codestyle/codestyle.md`), поэтому новый эндпоинт —
это всегда три шага:

1. **Контракт.** Описать путь и схемы в `contract/openapi.yaml`.
2. **Клиент.** `task gen-api` (локально — `bun run api:gen`): в `src/shared/api/generated` появятся функции,
   хуки и типы; новый тег — строка `export * from "./generated/<тег>/<тег>"` в `src/shared/api/index.ts`.
3. **Мок.** Обработчик в `mocks/handlers/<тег>.ts` по тому же контракту — ниже.

## Как написать мок

### 1. Таблица и начальные данные

Добавьте поле в `seed()` — тип `Tables` в `db.ts` выведется из него сам. Типы строк — из `@/shared/api`:

```ts
// seed.ts
import type { Shipment } from "@/shared/api";

export function seed() {
  const shipments: Shipment[] = [
    { id: "…", number: "AST-001", status: "in_transit", createdAt: "2026-10-01T09:00:00Z" },
  ];
  return { shipments };
}
```

Поменяли форму существующей таблицы — увеличьте версию в ключе `KEY` (`db.ts`), иначе у тех, кто уже
открывал демо, останутся старые данные.

### 2. Обработчик

Один файл на тег контракта, массив `<тег>Handlers`:

```ts
// handlers/shipments.ts
import { HttpResponse, http } from "msw";
import * as v from "valibot";
import type { Shipment } from "@/shared/api";
import { db } from "../db";
import { API, latency, notFound, parseBody } from "../http";

/** Ограничения — те же, что в контракте. */
const Create = v.object({
  number: v.pipe(v.string(), v.trim(), v.minLength(3, "Номер — от 3 символов")),
});

export const shipmentHandlers = [
  http.get(`${API}/shipments`, async () => {
    await latency();
    return HttpResponse.json<Shipment[]>(db.read("shipments"));
  }),

  http.post(`${API}/shipments`, async ({ request }) => {
    await latency();
    const body = await parseBody(request, Create);
    if (!body.ok) return body.response; // 400 validation_failed с errors по полям
    const shipment: Shipment = {
      id: crypto.randomUUID(),
      ...body.data,
      status: "created",
      createdAt: new Date().toISOString(),
    };
    db.update("shipments", (rows) => [shipment, ...rows]);
    return HttpResponse.json(shipment, { status: 201 });
  }),

  http.delete(`${API}/shipments/:id`, async ({ params }) => {
    await latency();
    if (!db.read("shipments").some((s) => s.id === params.id)) return notFound("Отправление");
    db.update("shipments", (rows) => rows.filter((s) => s.id !== params.id));
    return new HttpResponse(null, { status: 204 });
  }),
];
```

И строка в `handlers/index.ts`:

```ts
export const handlers = [...systemHandlers, ...shipmentHandlers];
```

### Правила

- **Пути — через `API`** (`*/api/v1`): так мок ловит запрос с любого origin, в том числе с `VITE_API_BASE_URL`.
- **Каждый обработчик начинается с `await latency()`** — в демо видно скелетоны и состояния загрузки
  (в тестах задержки нет).
- **Ошибки — только через `problem()` / `notFound()`**: формат `Problem` и коды `ErrorCode` из контракта.
  Фронт ветвится по `code`, поэтому код в моке должен быть тем же, что отдаст бэкенд.
- **Тело запроса — через `parseBody(request, схема)`**: valibot-схема повторяет ограничения контракта, ошибки
  полей приходят как `validation_failed` с `errors` — `fieldError(e, "number")` во фронте работает как с бэкендом.
- **Данные — только через `db.read` / `db.update`**: `read` отдаёт копию, `update` сразу сохраняет.
- **Мок не умнее бэкенда.** Он повторяет контракт, а не придумывает поведение: если правила нет в
  контракте, его нет и в моке.

## Тесты

Компонентные тесты моки не используют: запросы подменяются на границе `fetch` (`mockApi` из
`@/shared/lib/test-utils`, `docs/codestyle/testing.md`). Логику самих моков можно проверить через
`setupServer` из `msw/node` и сгенерированные функции клиента — тест кладите рядом,
`handlers/<тег>.test.ts`.
