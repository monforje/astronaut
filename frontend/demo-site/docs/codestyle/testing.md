# Тесты фронтенда

Код-стайл тестов (имена, расположение) проверяет `codestyle.test.ts` рядом.

| Вид                 | Где лежит                                                                            | Чем запускается                                                               |
| ------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| Юнит и компонентные | в папке модуля: `foo/Foo.tsx` → `foo/Foo.test.tsx`, `bar/bar.ts` → `bar/bar.test.ts` | `task test` (vitest по слоям), `task test-layer -- shared`, `task test-cover` |
| E2E (весь стенд)    | `testing/e2e/*.e2e.ts`, конфиг `testing/playwright.config.ts`                        | `task test-e2e`                                                               |

## Юнит и компонентные (vitest)

- Окружение — happy-dom, API Testing Library; запускаются из `src/` (`testing/` vitest не трогает).
- Запросы мокаются на границе мутатора — подменой `fetch`: `mockApi([{path, reply}])` или `mockFetch(status, body)`
  из `@/shared/lib/test-utils`; компонент без запросов — обычный `render(ui)` из Testing Library; страницы целиком — `renderApp(ui, {route, path})`; сессия — `signIn()` / `signOut()`. Сгенерированный код orval и хуки TanStack Query при этом работают настоящие.
- Компоненты, которые ходят в API, рендерятся через `renderWithClient(<Comp />)` — свежий `QueryClient`
  без повторов запросов; после теста `vi.unstubAllGlobals()`.
- Мок-бэкенд `mocks/` в компонентных тестах не участвует: граница — `fetch`. Логику самих моков проверяют
  через `setupServer` из `msw/node` (`mocks/README.md`).
- Что проверять: состояния (загрузка / ошибка / пусто), сообщение об ошибке по `code` бэкенда,
  инвалидацию кэша после мутации. Сгенерированное (`shared/api/generated`) не тестируется.
- Пример — `entities/system/ui/system-info-card/SystemInfoCard.test.tsx` (загрузка, ошибка с повтором, данные).
- Один файл: `task bun -- x vitest run path/to/file.test.tsx`.

## E2E (Playwright)

- Против поднятого стенда (`task deploy` бэкенда и фронта), запуск в контейнере Playwright:
  `task test-e2e`. Адрес — `E2E_BASE_URL`, по умолчанию — хост бэкенда (`testing/playwright.config.ts`).
- Селекторы — по ролям и подписям (`getByRole`, `getByLabel`), как видит пользователь; не по классам.
- Данные уникальны на запуск (`e2e-${Date.now()}`), чтобы не зависеть от состояния базы.
- Сценарии — `testing/e2e/*.e2e.ts`, пример — `home.e2e.ts`. Данные, без которых сценарию нечего
  показать, — в `build/local/seed.sql` бэкенда.
- Проверить, что конфиг валиден и тесты находятся: `task bunx -- playwright test --list --config testing/playwright.config.ts`.
- Отчёты (`testing/e2e-results`, `e2e-report`) в git не попадают.
