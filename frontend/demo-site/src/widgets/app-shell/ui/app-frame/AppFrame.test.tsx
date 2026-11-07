import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toaster } from "@astronaut/ui-kit";
import { RouterProvider, createMemoryRouter } from "react-router";
import { AppFrame } from "./AppFrame";

function renderFrame(route: string) {
  const router = createMemoryRouter(
    [
      { path: "/", element: <AppFrame>главная</AppFrame> },
      {
        path: "/missing",
        element: <AppFrame>пусто</AppFrame>,
        handle: { crumb: "Страница не найдена" },
      },
    ],
    { initialEntries: [route] },
  );
  return {
    router,
    ...render(
      <>
        <RouterProvider router={router} />
        <Toaster />
      </>,
    ),
  };
}

beforeEach(() => localStorage.clear());

describe("AppFrame", () => {
  it("кладёт страницу в main, а название страницы показывает крошками, не заголовком", () => {
    renderFrame("/missing");

    expect(within(screen.getByRole("main")).getByText("пусто")).toBeTruthy();
    const crumbs = screen.getByRole("navigation", { name: "Навигация" });
    expect(within(crumbs).getByRole("link", { name: "Главная" })).toBeTruthy();
    expect(within(crumbs).getByText("Страница не найдена")).toBeTruthy();
    expect(screen.queryByRole("heading")).toBeNull();
  });

  it("ссылка «К содержимому» ведёт на область страницы", () => {
    renderFrame("/");
    const skip = screen.getByRole("link", { name: "К содержимому" });
    expect(skip.getAttribute("href")).toBe("#content");
    expect(screen.getByRole("main").id).toBe("content");
  });

  it("крошка «Главная» ведёт через роутер", async () => {
    const { router } = renderFrame("/missing");
    const crumbs = screen.getByRole("navigation", { name: "Навигация" });

    await userEvent.click(within(crumbs).getByRole("link", { name: "Главная" }));
    expect(router.state.location.pathname).toBe("/");
  });

  it("меню для узкого вида открывается панелью, пункт ведёт на страницу и закрывает её, Esc тоже закрывает", async () => {
    const { router } = renderFrame("/missing");

    await userEvent.click(screen.getByRole("button", { name: "Открыть меню" }));
    const drawer = screen.getByRole("dialog", { name: "Меню" });
    await userEvent.click(within(drawer).getByRole("link", { name: /Главная/ }));
    expect(router.state.location.pathname).toBe("/");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    await userEvent.click(screen.getByRole("button", { name: "Открыть меню" }));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("поиск пока заглушка: Enter сообщает об этом тостом", async () => {
    renderFrame("/");
    await userEvent.type(screen.getByLabelText("Глобальный поиск"), "груз{Enter}");
    expect(await screen.findByText("Поиск пока недоступен")).toBeTruthy();
  });
});
