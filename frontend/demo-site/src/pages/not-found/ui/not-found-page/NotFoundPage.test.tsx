import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderApp } from "@/shared/lib/test-utils";
import { NotFoundPage } from "./NotFoundPage";

describe("NotFoundPage", () => {
  it("сообщает об ошибке адреса и ведёт на главную", async () => {
    const { router } = renderApp(<NotFoundPage />, { route: "/missing" });

    expect(screen.getByRole("heading", { name: "Страница не найдена" })).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "На главную" }));
    expect(router.state.location.pathname).toBe("/");
  });
});
