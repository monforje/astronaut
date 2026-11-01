import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SYSTEM_INFO, mockApi, renderWithClient } from "@/shared/lib/test-utils";
import { SystemInfoCard } from "./SystemInfoCard";

afterEach(() => vi.unstubAllGlobals());

describe("SystemInfoCard", () => {
  it("показывает имя и версию сервиса", async () => {
    mockApi([{ path: "/api/v1/system/info", reply: SYSTEM_INFO }]);
    renderWithClient(<SystemInfoCard />);

    expect(screen.getByLabelText("Загрузка")).toBeTruthy();
    expect(await screen.findByText("astronaut-http")).toBeTruthy();
    expect(screen.getByText("dev")).toBeTruthy();
  });

  it("ошибку бэкенда показывает текстом по коду и даёт повторить", async () => {
    let down = true;
    mockApi([
      {
        path: "/api/v1/system/info",
        handle: () => (down ? { code: "service_unavailable", title: "x" } : SYSTEM_INFO),
        status: 503,
      },
    ]);
    renderWithClient(<SystemInfoCard />);

    expect((await screen.findByRole("alert")).textContent).toContain("Сервис временно недоступен");

    down = false;
    mockApi([{ path: "/api/v1/system/info", reply: SYSTEM_INFO }]);
    await userEvent.click(screen.getByRole("button", { name: "Повторить" }));
    expect(await screen.findByText("astronaut-http")).toBeTruthy();
  });
});
