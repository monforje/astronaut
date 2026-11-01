import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithTheme } from "@/shared/lib/test-utils";
import { ErrorBoundary } from "./ErrorBoundary";

function Boom(): never {
  throw new Error("boom");
}

describe("ErrorBoundary", () => {
  it("вместо белого экрана показывает понятную страницу с перезагрузкой", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    renderWithTheme(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByRole("alert").textContent).toContain("Что-то пошло не так");
    expect(screen.getByRole("button", { name: "Обновить страницу" })).toBeTruthy();
    spy.mockRestore();
  });

  it("без ошибки отдаёт содержимое как есть", () => {
    renderWithTheme(
      <ErrorBoundary>
        <p>ok</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText("ok")).toBeTruthy();
  });
});
