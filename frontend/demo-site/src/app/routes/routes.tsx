import { createBrowserRouter, createMemoryRouter, type RouteObject } from "react-router";
import { HomePage } from "@/pages/home";
import { NotFoundPage } from "@/pages/not-found";
import type { RouteHandle } from "@/widgets/app-shell";
import { Layout } from "../layout";

/** `handle.crumb` — название страницы для крошек в топбаре; у главной его нет: она и есть первая крошка. */
const crumb = (label: string): RouteHandle => ({ crumb: label });

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "*", element: <NotFoundPage />, handle: crumb("Страница не найдена") },
    ],
  },
];

export const createRouter = () => createBrowserRouter(routes);

/** Роутер без браузера: для тестов страниц (стартовый адрес задаёт тест). */
export const createTestRouter = (initialEntries: string[]) =>
  createMemoryRouter(routes, { initialEntries });
