import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorState } from "./ErrorState";

describe("ErrorState", () => {
  it("объявляет ошибку и предлагает повтор", async () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Сервис недоступен" onRetry={onRetry} />);
    expect(screen.getByRole("alert").textContent).toContain("Сервис недоступен");
    await userEvent.click(screen.getByRole("button", { name: "Повторить" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("без onRetry кнопки повтора нет", () => {
    render(<ErrorState message="Сервис недоступен" />);
    expect(screen.queryByRole("button")).toBeNull();
  });
});
