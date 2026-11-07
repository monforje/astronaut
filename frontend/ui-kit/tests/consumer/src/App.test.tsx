/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Button, Icon, toast } from "@astronaut/ui-kit";
import { App } from "./App";

afterEach(cleanup);

describe("потребитель пакета", () => {
  it("рисует Button, Select, DataTable, Avatar и Loader", () => {
    render(<App />);
    expect(screen.getByRole("button", { name: "Открыть окно" })).toBeTruthy();
    expect(document.querySelector('[aria-label="Грузы"]')).toBeTruthy();
    expect(screen.getByText("MSKU-2")).toBeTruthy();
    expect(document.querySelector(".ds-loader")?.textContent).toContain("Загружаем");
    expect(document.querySelector(".ds-avatar__mark")?.getAttribute("src")).toContain("ai-logo-1");
    expect(document.querySelector(".ds-loader__img")?.getAttribute("src")).toContain("loader");
  });

  it("открывает Dialog и показывает toast", async () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Открыть окно" }));
    expect(await screen.findByRole("dialog")).toBeTruthy();
    toast({ title: "Отправлено" });
    expect(await screen.findByText("Отправлено")).toBeTruthy();
  });

  it("Icon и Button вне App", () => {
    render(
      <Button icon={<Icon name="plus" />} size="sm">
        Добавить
      </Button>,
    );
    expect(screen.getByRole("button", { name: "Добавить" })).toBeTruthy();
  });
});
