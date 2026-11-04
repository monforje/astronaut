import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("показывает заголовок, текст и действие", () => {
    render(<EmptyState title="Пусто" text="Ничего нет" action={<button>Создать</button>} />);
    expect(screen.getByRole("heading", { name: "Пусто" })).toBeTruthy();
    expect(screen.getByText("Ничего нет")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Создать" })).toBeTruthy();
  });
});
