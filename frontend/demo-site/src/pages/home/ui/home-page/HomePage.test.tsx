import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { SYSTEM_INFO, mockApi, renderApp } from "@/shared/lib/test-utils";
import { APP_NAME } from "@/shared/config";
import { HomePage } from "./HomePage";

afterEach(() => vi.unstubAllGlobals());

describe("HomePage", () => {
  it("показывает ответ бэкенда без заголовка страницы и ставит заголовок вкладки", async () => {
    mockApi([{ path: "/api/v1/system/info", reply: SYSTEM_INFO }]);
    renderApp(<HomePage />);

    expect(await screen.findByText(SYSTEM_INFO.service)).toBeTruthy();
    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
    expect(document.title).toBe(APP_NAME);
  });
});
