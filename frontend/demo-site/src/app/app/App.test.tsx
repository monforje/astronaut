import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SYSTEM_INFO, mockApi } from "@/shared/lib/test-utils";
import { App } from "./App";

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
  window.history.pushState({}, "", "/");
});

describe("App", () => {
  it("собирает приложение: оболочка кита, крошки вместо заголовка и главная страница с ответом бэкенда", async () => {
    mockApi([{ path: "/api/v1/system/info", reply: SYSTEM_INFO }]);
    render(<App />);

    expect(screen.getByRole("main")).toBeTruthy();
    expect(screen.getAllByRole("navigation", { name: "Разделы" }).length).toBeGreaterThan(0);
    const crumbs = screen.getByRole("navigation", { name: "Навигация" });
    expect(within(crumbs).getByText("Главная").getAttribute("aria-current")).toBe("page");
    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
    expect(await screen.findByText(SYSTEM_INFO.version)).toBeTruthy();
  });

  it("неизвестный адрес — страница 404 с крошками «Главная › Страница не найдена»", async () => {
    window.history.pushState({}, "", "/missing");
    render(<App />);

    expect(screen.getByRole("heading", { name: "Страница не найдена" })).toBeTruthy();
    const crumbs = screen.getByRole("navigation", { name: "Навигация" });
    expect(within(crumbs).getByRole("link", { name: "Главная" })).toBeTruthy();
    expect(within(crumbs).getByText("Страница не найдена").getAttribute("aria-current")).toBe(
      "page",
    );

    mockApi([{ path: "/api/v1/system/info", reply: SYSTEM_INFO }]);
    await userEvent.click(screen.getByRole("button", { name: "На главную" }));
    expect(window.location.pathname).toBe("/");
    expect(await screen.findByText(SYSTEM_INFO.version)).toBeTruthy();
  });

  it("переключатель темы меняет data-theme на html", async () => {
    mockApi([{ path: "/api/v1/system/info", reply: SYSTEM_INFO }]);
    render(<App />);
    const before = document.documentElement.dataset.theme;

    await userEvent.click(screen.getByRole("button", { name: /Включить (тёмную|светлую) тему/ }));
    expect(document.documentElement.dataset.theme).not.toBe(before);
    expect(localStorage.getItem("astronaut:theme")).toBe(document.documentElement.dataset.theme);
  });

  it("пункт «Главная» в сайдбаре отмечен текущей страницей", () => {
    mockApi([{ path: "/api/v1/system/info", reply: SYSTEM_INFO }]);
    render(<App />);
    const side = screen.getAllByRole("navigation", { name: "Разделы" })[0]!;
    expect(
      within(side)
        .getByRole("link", { name: /Главная/ })
        .getAttribute("aria-current"),
    ).toBe("page");
  });

  it("сайдбар сворачивается в rail и запоминает это", async () => {
    mockApi([{ path: "/api/v1/system/info", reply: SYSTEM_INFO }]);
    render(<App />);

    await userEvent.click(screen.getByRole("button", { name: "Свернуть панель" }));
    expect(screen.getAllByRole("button", { name: "Развернуть панель" }).length).toBeGreaterThan(0);
    expect(localStorage.getItem("astronaut:sidebar-rail")).toBe("1");
  });
});
