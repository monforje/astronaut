import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { SYSTEM_INFO, mockApi, renderApp } from "@/shared/lib/test-utils";
import { HomePage } from "./HomePage";
import { APP_NAME } from "@/shared/config";

afterEach(() => vi.unstubAllGlobals());

describe("HomePage", () => {
  it("заголовок и ответ бэкенда", async () => {
    mockApi([{ path: "/api/v1/system/info", reply: SYSTEM_INFO }]);
    renderApp(<HomePage />);

    expect(screen.getByRole("heading", { level: 1, name: APP_NAME })).toBeTruthy();
    expect(await screen.findByText(SYSTEM_INFO.service)).toBeTruthy();
    expect(document.title).toBe(APP_NAME);
  });
});
