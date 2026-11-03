# Тесты лендинга

Код-стайл тестов (имена, расположение) проверяет `codestyle.test.ts` рядом.

| Вид                 | Где лежит                                                                             | Чем запускается                                                               |
| ------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Юнит и компонентные | в папке модуля: `foo/Foo.astro` → `foo/Foo.test.ts`, `bar/bar.ts` → `bar/bar.test.ts` | `task test` (vitest по слоям), `task test-layer -- shared`, `task test-cover` |
| E2E (стенд целиком) | `testing/e2e/*.e2e.ts`, конфиг `testing/playwright.config.ts`                         | `task test-e2e`                                                               |

## Юнит и компонентные (vitest)

- Конфиг — `getViteConfig` из Astro: `.astro`, алиас `@/` и плагины работают как в сборке.
- Окружение — `node` (в «браузерном» плагин Astro подменяет `.astro` заглушкой). DOM даёт
  `renderAstro(Component, { props, slots, request })` из `@/shared/lib/test-utils`: рендер через Container API
  Astro и разбор в happy-dom `Document`. Дальше обычные запросы: `doc.querySelector`, `textContent`.
- Адрес страницы для `Astro.url` — `request: new Request("https://…/path/")`.
- Что проверять: что разметка отвечает пропсам и слотам, один `h1`, работающие якоря (`#contact` ведёт
  на существующий `id`), SEO-теги, `noindex` там, где нужен.
- Тестов на внешний вид (классы Tailwind ради классов) нет — проверяется поведение и доступность.
- Один файл: `task bun -- x vitest run path/to/file.test.ts`.

## E2E (Playwright)

- Против поднятого стенда (`task deploy`), запуск в контейнере Playwright: `task test-e2e`. Адрес —
  `E2E_BASE_URL`, по умолчанию `https://landing.astronaut.localhost`.
- Селекторы — по ролям и подписям (`getByRole`, `getByLabel`), как видит пользователь; не по классам.
- Сценарии — `testing/e2e/*.e2e.ts`, пример — `home.e2e.ts`.
- Проверить, что конфиг валиден и тесты находятся: `task bunx -- playwright test --list --config testing/playwright.config.ts`.
- Отчёты (`testing/e2e-results`, `e2e-report`) в git не попадают.
