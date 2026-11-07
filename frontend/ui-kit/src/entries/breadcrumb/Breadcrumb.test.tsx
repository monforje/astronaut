/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Breadcrumb, type BreadcrumbItem } from "./index";

const CARGO: BreadcrumbItem[] = [
  { label: "Грузы", href: "/cargo" },
  { label: "Морской импорт", href: "/cargo/sea" },
  { label: "MSKU4821907" },
];
const LONG: BreadcrumbItem[] = [
  { label: "Главная", href: "/" },
  { label: "Клиенты", href: "/c" },
  { label: "Дальснаб", href: "/c/1" },
  { label: "Договоры", href: "/c/1/d" },
  { label: "Договор 14", href: "/c/1/d/14" },
  { label: "Приложение 3" },
];

describe("Breadcrumb", () => {
  it("рендерит nav с подписью по умолчанию и список крошек", () => {
    render(<Breadcrumb items={CARGO} />);
    expect(screen.getByRole("navigation", { name: "Хлебные крошки" })).toBeTruthy();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("последняя крошка помечена aria-current и не является ссылкой", () => {
    render(<Breadcrumb items={CARGO} />);
    const current = screen.getByText("MSKU4821907").parentElement as HTMLElement;
    expect(current.getAttribute("aria-current")).toBe("page");
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });

  it("разделители скрыты от скринридера", () => {
    const { container } = render(<Breadcrumb items={CARGO} />);
    const seps = container.querySelectorAll(".ds-bc__sep");
    expect(seps).toHaveLength(2);
    expect(seps[0].getAttribute("aria-hidden")).toBe("true");
  });

  it("крошка без href рисуется кнопкой и вызывает onClick", () => {
    const onClick = vi.fn();
    render(<Breadcrumb items={[{ label: "Грузы", onClick }, { label: "Текущая" }]} />);
    fireEvent.click(screen.getByRole("button", { name: "Грузы" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("disabled-крошка не ссылка и с aria-disabled", () => {
    render(<Breadcrumb items={[{ label: "Закрыто", disabled: true }, { label: "Текущая" }]} />);
    expect(screen.getByText("Закрыто").parentElement?.getAttribute("aria-disabled")).toBe("true");
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("loading заменяет текст заглушкой с подписью", () => {
    render(
      <Breadcrumb
        items={[
          { label: "Грузы", href: "/" },
          { label: "Груз", loading: true },
        ]}
      />,
    );
    expect(screen.getByLabelText("загрузка")).toBeTruthy();
    expect(screen.queryByText("Груз")).toBeNull();
  });

  it("размер sm добавляет класс, className и ref пробрасываются", () => {
    const ref = createRef<HTMLElement>();
    render(<Breadcrumb ref={ref} className="custom" size="sm" items={CARGO} aria-label="Путь" />);
    const nav = screen.getByRole("navigation", { name: "Путь" });
    expect(ref.current).toBe(nav);
    expect(nav.classList.contains("custom")).toBe(true);
    expect(nav.querySelector(".ds-bc--sm")).toBeTruthy();
  });

  it("длинная цепочка усекается: первая, многоточие и хвост", () => {
    render(<Breadcrumb items={LONG} max={4} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
    expect(screen.getByRole("button", { name: "Скрытые разделы" })).toBeTruthy();
    expect(screen.queryByText("Клиенты")).toBeNull();
    expect(screen.getByText("Приложение 3")).toBeTruthy();
  });

  it("цепочка не длиннее max не усекается", () => {
    render(<Breadcrumb items={CARGO} max={3} />);
    expect(screen.queryByRole("button", { name: "Скрытые разделы" })).toBeNull();
  });

  it("меню многоточия открывается кликом, показывает скрытые разделы и закрывается по выбору", () => {
    const onClick = vi.fn();
    const items = LONG.map((item, i) => (i === 1 ? { ...item, onClick } : item));
    render(<Breadcrumb items={items} max={4} />);
    const trigger = screen.getByRole("button", { name: "Скрытые разделы" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getAllByRole("menuitem").map((m) => m.textContent)).toEqual([
      "Клиенты",
      "Дальснаб",
      "Договоры",
    ]);
    fireEvent.click(screen.getByRole("menuitem", { name: "Клиенты" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("при открытии кликом фокус уходит на первый пункт меню", () => {
    render(<Breadcrumb items={LONG} max={4} />);
    fireEvent.click(screen.getByRole("button", { name: "Скрытые разделы" }));
    expect(document.activeElement).toBe(screen.getAllByRole("menuitem")[0]);
  });

  it("стрелки двигают фокус по пунктам, Escape закрывает меню и возвращает фокус", () => {
    render(<Breadcrumb items={LONG} max={4} />);
    const trigger = screen.getByRole("button", { name: "Скрытые разделы" });
    fireEvent.click(trigger);
    const [first, second, third] = screen.getAllByRole("menuitem");
    fireEvent.keyDown(first, { key: "ArrowDown" });
    expect(document.activeElement).toBe(second);
    fireEvent.keyDown(second, { key: "ArrowDown" });
    fireEvent.keyDown(third, { key: "ArrowDown" });
    expect(document.activeElement).toBe(first);
    fireEvent.keyDown(first, { key: "End" });
    expect(document.activeElement).toBe(third);
    fireEvent.keyDown(third, { key: "Escape" });
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("ArrowDown на кнопке открывает меню", () => {
    render(<Breadcrumb items={LONG} max={4} />);
    fireEvent.keyDown(screen.getByRole("button", { name: "Скрытые разделы" }), {
      key: "ArrowDown",
    });
    expect(screen.getByRole("menu")).toBeTruthy();
  });

  it("клик вне меню закрывает его", () => {
    render(
      <div>
        <button type="button">вне</button>
        <Breadcrumb items={LONG} max={4} />
      </div>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Скрытые разделы" }));
    fireEvent.mouseDown(screen.getByRole("button", { name: "вне" }));
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("крошка с переключателем: пункт меняет подпись, отмечен галочкой и вызывает onSelect", () => {
    const onSelect = vi.fn();
    render(
      <Breadcrumb
        items={[
          { label: "Подключения", href: "/" },
          { label: "1С", menu: ["1С", "Битрикс24"], onSelect },
          { label: "Журнал" },
        ]}
      />,
    );
    const trigger = screen.getByRole("button", { name: "1С" });
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("menuitem", { name: "Битрикс24" }));
    expect(onSelect).toHaveBeenCalledWith("Битрикс24");
    expect(screen.getByRole("button", { name: "Битрикс24" })).toBeTruthy();
  });

  it("управляемое меню: openMenu открывает без переноса фокуса, onOpenMenuChange сообщает о закрытии", () => {
    const onOpenMenuChange = vi.fn();
    render(
      <Breadcrumb items={LONG} max={4} openMenu="ellipsis" onOpenMenuChange={onOpenMenuChange} />,
    );
    expect(screen.getByRole("menu")).toBeTruthy();
    expect(document.activeElement).toBe(document.body);
    fireEvent.mouseDown(document.body);
    expect(onOpenMenuChange).toHaveBeenCalledWith(null);
  });

  it("нативные data-атрибуты крошки ставятся на её элемент, data-force по умолчанию нет", () => {
    const { container } = render(
      <Breadcrumb items={[{ label: "Грузы", href: "/", "data-x": "1" }, { label: "Текущая" }]} />,
    );
    expect(screen.getByRole("link").getAttribute("data-x")).toBe("1");
    expect(container.querySelector("[data-force]")).toBeNull();
  });
});
