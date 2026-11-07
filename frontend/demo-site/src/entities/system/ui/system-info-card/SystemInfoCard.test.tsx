import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toaster } from "@astronaut/ui-kit";
import { SYSTEM_INFO, mockApi, renderWithClient } from "@/shared/lib/test-utils";
import { SystemInfoCard } from "./SystemInfoCard";

afterEach(() => vi.unstubAllGlobals());

describe("SystemInfoCard", () => {
  it("пока ответа нет, показывает заготовку формы с aria-busy", () => {
    mockApi([{ path: "/api/v1/system/info", handle: () => new Promise(() => undefined) }]);
    renderWithClient(<SystemInfoCard />);

    expect(screen.getByLabelText("Статус системы").getAttribute("aria-busy")).toBe("true");
    expect(screen.getByText("Загрузка…")).toBeTruthy();
  });

  it("показывает имя и версию сервиса и бейдж «На связи»", async () => {
    mockApi([{ path: "/api/v1/system/info", reply: SYSTEM_INFO }]);
    renderWithClient(<SystemInfoCard />);

    expect(await screen.findByText("astronaut-http")).toBeTruthy();
    expect(screen.getByText("dev")).toBeTruthy();
    expect(screen.getByText("На связи")).toBeTruthy();
  });

  it("ошибку бэкенда показывает текстом по коду, даёт повторить и сообщает тостом об успехе", async () => {
    let down = true;
    mockApi([
      {
        path: "/api/v1/system/info",
        handle: () => (down ? { code: "service_unavailable", title: "x" } : SYSTEM_INFO),
        status: 503,
      },
    ]);
    renderWithClient(
      <>
        <SystemInfoCard />
        <Toaster />
      </>,
    );

    expect((await screen.findByRole("alert")).textContent).toContain("Сервис временно недоступен");

    down = false;
    mockApi([{ path: "/api/v1/system/info", reply: SYSTEM_INFO }]);
    await userEvent.click(screen.getByRole("button", { name: "Повторить" }));
    expect(await screen.findByText("astronaut-http")).toBeTruthy();
    expect(await screen.findByText("Статус обновлён")).toBeTruthy();
  });

  it("если сервис ответил пустотой, предлагает обновить статус", async () => {
    mockApi([{ path: "/api/v1/system/info", reply: { service: "", version: "" } }]);
    renderWithClient(<SystemInfoCard />);

    expect(await screen.findByRole("heading", { name: "Бэкенд не назвал себя" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Обновить" })).toBeTruthy();
  });
});
