import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { APP_NAME } from "@/shared/config";
import { SYSTEM_INFO, mockApi } from "@/shared/lib/test-utils";
import { App } from "./App";

afterEach(() => {
  vi.unstubAllGlobals();
  window.history.pushState({}, "", "/");
});

describe("App", () => {
  it("собирает приложение: раскладка и главная страница с ответом бэкенда", async () => {
    mockApi([{ path: "/api/v1/system/info", reply: SYSTEM_INFO }]);
    render(<App />);

    expect(screen.getByRole("main")).toBeTruthy();
    expect(screen.getByRole("heading", { level: 1, name: APP_NAME })).toBeTruthy();
    expect(await screen.findByText(SYSTEM_INFO.version)).toBeTruthy();
  });

  it("неизвестный адрес — страница 404", () => {
    window.history.pushState({}, "", "/missing");
    render(<App />);
    expect(screen.getByRole("heading", { name: "Страница не найдена" })).toBeTruthy();
  });
});
