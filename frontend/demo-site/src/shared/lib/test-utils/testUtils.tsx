import { vi } from "vitest";
import type { ReactElement, ReactNode } from "react";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { RouterProvider, createMemoryRouter } from "react-router";
import { theme } from "@/shared/ui";

/** Свежий `QueryClient` без повторов запросов: тест видит ошибку сразу. */
function testClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

/** Тема приложения; `env="test"` выключает анимации и порталы Mantine — тест видит результат сразу. */
function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <MantineProvider theme={theme} env="test">
      {children}
    </MantineProvider>
  );
}

/** Рендер компонента без запросов: только тема Mantine. */
export function renderWithTheme(ui: ReactElement) {
  return render(ui, { wrapper: ThemeProvider });
}

/** Рендер в свежем `QueryClient` без повторов запросов — для тестов хуков TanStack Query. */
export function renderWithClient(ui: ReactElement) {
  const client = testClient();
  return {
    client,
    ...render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>, {
      wrapper: ThemeProvider,
    }),
  };
}

interface Req {
  url: string;
  method: string;
  body: unknown;
  headers: Headers;
}

interface Route {
  method?: string;
  /** Путь API без query, например `/api/v1/system/info`; `*` в конце — любой хвост. */
  path: string;
  status?: number;
  /** Готовый ответ. */
  reply?: unknown;
  /** Ответ от запроса: удобно менять состояние «сервера» между вызовами. */
  handle?: (req: Req) => unknown;
  headers?: Record<string, string>;
}

/**
 * Подменяет `fetch` по таблице маршрутов (граница мутатора `customFetch`): ответ — JSON с заданным статусом.
 * Незнакомый запрос роняет тест ответом 599, а не молчаливой пустотой. Возвращает мок для проверки вызовов.
 */
export function mockApi(routes: Route[]) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input), "http://localhost");
    const method = (init?.method ?? "GET").toUpperCase();
    const route = routes.find(
      (r) =>
        (r.method ?? "GET") === method &&
        (r.path.endsWith("*")
          ? url.pathname.startsWith(r.path.slice(0, -1))
          : url.pathname === r.path),
    );
    if (!route)
      return new Response(
        JSON.stringify({ code: "unmocked", title: `${method} ${url.pathname}` }),
        { status: 599 },
      );
    const headers = new Headers(init?.headers);
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;
    const data = route.handle
      ? await route.handle({ url: url.pathname, method, body, headers })
      : route.reply;
    return new Response(data === undefined ? null : JSON.stringify(data), {
      status: route.status ?? 200,
      headers: { "Content-Type": "application/json", ...route.headers },
    });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

/** Подменяет `fetch`: на любой запрос отвечает JSON-ом с указанным статусом. */
export function mockFetch(status: number, body: unknown) {
  return mockApi(
    ["GET", "POST", "PUT", "DELETE"].map((method) => ({ method, path: "*", status, reply: body })),
  );
}

/**
 * Рендер страницы или фичи так, как её видит приложение: роутер в памяти и свежий `QueryClient`.
 * `path` — шаблон маршрута с параметрами (`/items/:id`); `routes` — дополнительные маршруты для проверки перехода.
 */
export function renderApp(
  ui: ReactElement,
  {
    route = "/",
    path,
    routes = [] as { path: string; element: ReactElement }[],
  }: { route?: string; path?: string; routes?: { path: string; element: ReactElement }[] } = {},
) {
  const client = testClient();
  const router = createMemoryRouter(
    [
      { path: path ?? route.split("?")[0], element: ui },
      ...routes,
      { path: "*", element: <span>other</span> },
    ],
    { initialEntries: [route] },
  );
  const view = render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
    { wrapper: ThemeProvider },
  );
  return { client, router, ...view };
}

/** Ответ `GET /system/info` по умолчанию. */
export const SYSTEM_INFO = { service: "astronaut-http", version: "dev" };
