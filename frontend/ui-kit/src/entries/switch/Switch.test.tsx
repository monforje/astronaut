/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { SettingRow, Switch } from "./index";

describe("Switch", () => {
  it("рисует нативный checkbox с role=switch и классом md по умолчанию", () => {
    render(<Switch aria-label="Автосверка" />);
    const control = screen.getByRole("switch", { name: "Автосверка" }) as HTMLInputElement;
    expect(control.type).toBe("checkbox");
    expect(control.className).toBe("ds-switch");
    expect(control.checked).toBe(false);
    expect(control.getAttribute("aria-checked")).toBe("false");
  });

  it("size=sm добавляет класс компактного размера", () => {
    render(<Switch size="sm" aria-label="Режим" />);
    expect(screen.getByRole("switch").classList.contains("ds-switch--sm")).toBe(true);
  });

  it("неуправляемый режим: клик переключает checked и aria-checked", () => {
    render(<Switch aria-label="Автосверка" />);
    const control = screen.getByRole("switch") as HTMLInputElement;
    fireEvent.click(control);
    expect(control.checked).toBe(true);
    expect(control.getAttribute("aria-checked")).toBe("true");
  });

  it("defaultChecked задаёт начальное положение", () => {
    render(<Switch aria-label="Автосверка" defaultChecked />);
    expect((screen.getByRole("switch") as HTMLInputElement).checked).toBe(true);
  });

  it("управляемый режим: значение из checked, onCheckedChange получает новое", () => {
    const onCheckedChange = vi.fn();
    render(<Switch aria-label="Автосверка" checked={false} onCheckedChange={onCheckedChange} />);
    const control = screen.getByRole("switch") as HTMLInputElement;
    fireEvent.click(control);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(control.checked).toBe(false);
  });

  it("onChange нативный тоже вызывается", () => {
    const onChange = vi.fn();
    render(<Switch aria-label="Автосверка" onChange={onChange} />);
    fireEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("disabled блокирует переключение", () => {
    const onCheckedChange = vi.fn();
    render(<Switch aria-label="Экспорт" disabled onCheckedChange={onCheckedChange} />);
    const control = screen.getByRole("switch") as HTMLInputElement;
    expect(control.disabled).toBe(true);
    fireEvent.click(control);
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it("label оборачивает переключатель в label, имя берётся из подписи", () => {
    render(<Switch label="Автосверка" className="custom" />);
    const control = screen.getByRole("switch", { name: "Автосверка" });
    const wrapper = control.closest("label");
    expect(wrapper?.classList.contains("ds-switch__label")).toBe(true);
    expect(wrapper?.classList.contains("custom")).toBe(true);
  });

  it("без label className попадает на сам input", () => {
    render(<Switch aria-label="Режим" className="custom" />);
    const control = screen.getByRole("switch");
    expect(control.classList.contains("custom")).toBe(true);
    expect(control.classList.contains("ds-switch")).toBe(true);
  });

  it("name, value, data-атрибуты и ref пробрасываются на input", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Switch ref={ref} aria-label="Режим" name="auto" value="1" data-testid="s" />);
    const control = screen.getByTestId("s") as HTMLInputElement;
    expect(control.name).toBe("auto");
    expect(control.value).toBe("1");
    expect(ref.current).toBe(control);
  });

  it("сам по себе не ставит data-force", () => {
    render(<Switch aria-label="Режим" />);
    expect(screen.getByRole("switch").hasAttribute("data-force")).toBe(false);
  });
});

describe("SettingRow", () => {
  it("рисует заголовок и пояснение, переключатель внутри label", () => {
    render(
      <SettingRow title="Автосверка при загрузке" hint="Сразу после загрузки">
        <Switch />
      </SettingRow>,
    );
    const row = screen.getByText("Автосверка при загрузке").closest("label");
    expect(row?.classList.contains("ds-switch__row")).toBe(true);
    expect(row?.querySelector("small")?.textContent).toBe("Сразу после загрузки");
    expect(screen.getByRole("switch", { name: /Автосверка при загрузке/ })).toBeTruthy();
  });

  it("без hint пояснение не рисуется", () => {
    render(
      <SettingRow title="Экспорт">
        <Switch />
      </SettingRow>,
    );
    expect(document.querySelector(".ds-switch__text small")).toBeNull();
  });
});
