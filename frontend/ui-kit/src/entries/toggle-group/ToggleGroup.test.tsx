/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { ToggleGroup } from "./index";

function Group(props: Partial<React.ComponentProps<typeof ToggleGroup>> = {}) {
  return (
    <ToggleGroup aria-label="Вид" {...props}>
      <ToggleGroup.Item value="list">Список</ToggleGroup.Item>
      <ToggleGroup.Item value="table">Таблица</ToggleGroup.Item>
      <ToggleGroup.Item value="map" disabled>
        Карта
      </ToggleGroup.Item>
      <ToggleGroup.Item value="tree">Дерево</ToggleGroup.Item>
    </ToggleGroup>
  );
}

const radio = (name: string) => screen.getByRole("radio", { name });

describe("ToggleGroup", () => {
  it("рисует radiogroup с подписью и пунктами radio", () => {
    render(<Group />);
    const group = screen.getByRole("radiogroup", { name: "Вид" });
    expect(group.className).toBe("ds-tgroup");
    expect(screen.getAllByRole("radio")).toHaveLength(4);
  });

  it("без defaultValue выбран первый доступный пункт", () => {
    render(<Group />);
    expect(radio("Список").getAttribute("aria-checked")).toBe("true");
    expect(radio("Таблица").getAttribute("aria-checked")).toBe("false");
  });

  it("defaultValue задаёт начальный выбор, клик меняет его", () => {
    render(<Group defaultValue="table" />);
    expect(radio("Таблица").getAttribute("aria-checked")).toBe("true");
    fireEvent.click(radio("Дерево"));
    expect(radio("Дерево").getAttribute("aria-checked")).toBe("true");
    expect(radio("Таблица").getAttribute("aria-checked")).toBe("false");
  });

  it("управляемый режим: выбор берётся из value, клик только сообщает", () => {
    const onValueChange = vi.fn();
    render(<Group value="list" onValueChange={onValueChange} />);
    fireEvent.click(radio("Таблица"));
    expect(onValueChange).toHaveBeenCalledWith("table");
    expect(radio("Список").getAttribute("aria-checked")).toBe("true");
  });

  it("клик по уже выбранному не вызывает onValueChange", () => {
    const onValueChange = vi.fn();
    render(<Group onValueChange={onValueChange} />);
    fireEvent.click(radio("Список"));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("roving tabindex: в Tab входит только выбранный пункт", () => {
    render(<Group defaultValue="table" />);
    expect(radio("Таблица").tabIndex).toBe(0);
    expect(radio("Список").tabIndex).toBe(-1);
    expect(radio("Дерево").tabIndex).toBe(-1);
  });

  it("стрелка вправо выбирает следующий и переносит фокус, недоступный пропускается", () => {
    render(<Group defaultValue="table" />);
    radio("Таблица").focus();
    fireEvent.keyDown(radio("Таблица"), { key: "ArrowRight" });
    expect(radio("Дерево").getAttribute("aria-checked")).toBe("true");
    expect(document.activeElement).toBe(radio("Дерево"));
  });

  it("на краях выбор замыкается: вправо с последнего на первый, влево с первого на последний", () => {
    render(<Group defaultValue="tree" />);
    radio("Дерево").focus();
    fireEvent.keyDown(radio("Дерево"), { key: "ArrowDown" });
    expect(radio("Список").getAttribute("aria-checked")).toBe("true");
    fireEvent.keyDown(radio("Список"), { key: "ArrowLeft" });
    expect(radio("Дерево").getAttribute("aria-checked")).toBe("true");
  });

  it("Home и End выбирают первый и последний доступные", () => {
    render(<Group defaultValue="table" />);
    radio("Таблица").focus();
    fireEvent.keyDown(radio("Таблица"), { key: "End" });
    expect(radio("Дерево").getAttribute("aria-checked")).toBe("true");
    fireEvent.keyDown(radio("Дерево"), { key: "Home" });
    expect(radio("Список").getAttribute("aria-checked")).toBe("true");
  });

  it("недоступный пункт нельзя выбрать кликом", () => {
    const onValueChange = vi.fn();
    render(<Group onValueChange={onValueChange} />);
    expect((radio("Карта") as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(radio("Карта"));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("size и block выражены классами", () => {
    render(<Group size="sm" block />);
    const group = screen.getByRole("radiogroup");
    expect(group.classList.contains("ds-tgroup--sm")).toBe(true);
    expect(group.classList.contains("ds-tgroup--block")).toBe(true);
  });

  it("значок пункта скрыт от скринридера", () => {
    render(
      <ToggleGroup aria-label="Показ" defaultValue="a">
        <ToggleGroup.Item value="a" icon={<svg data-testid="ico" />}>
          Список
        </ToggleGroup.Item>
      </ToggleGroup>,
    );
    expect(screen.getByTestId("ico").parentElement?.getAttribute("aria-hidden")).toBe("true");
  });

  it("className, data-атрибуты и ref пробрасываются на группу", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Group ref={ref} className="custom" data-testid="g" />);
    const group = screen.getByTestId("g");
    expect(group.classList.contains("custom")).toBe(true);
    expect(ref.current).toBe(group);
  });

  it("сам по себе не ставит data-force", () => {
    render(<Group />);
    expect(document.querySelector("[data-force]")).toBeNull();
  });
});
