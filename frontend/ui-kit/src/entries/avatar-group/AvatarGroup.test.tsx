/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { AvatarGroup } from "./index";

const PEOPLE = [
  { name: "Ирина Петрова", role: "Оформление" },
  { name: "Алексей Крылов", role: "Брокер" },
  { name: "Мария Новикова", role: "Оформление" },
  { name: "Денис Попов", role: "Руководитель" },
  { name: "Ольга Ким", role: "Бухгалтерия" },
];

describe("AvatarGroup", () => {
  it("группа с подписью, три аватара и «ещё N» по умолчанию", () => {
    render(<AvatarGroup people={PEOPLE} />);
    const group = screen.getByRole("group", { name: "Участники" });
    expect(group.querySelectorAll(".ds-avgroup__item").length).toBe(4);
    expect(screen.getByRole("img", { name: "ещё 2" }).textContent).toBe("+2");
  });

  it("«+N» не рисуется, если все поместились", () => {
    render(<AvatarGroup people={PEOPLE.slice(0, 3)} max={4} />);
    expect(screen.queryByRole("img", { name: /ещё/ })).toBeNull();
  });

  it("max и размер: класс размера и число скрытых", () => {
    render(<AvatarGroup people={PEOPLE} max={4} size="md" label="Участники обсуждения" />);
    const group = screen.getByRole("group", { name: "Участники обсуждения" });
    expect(group.classList.contains("ds-avgroup--md")).toBe(true);
    expect(screen.getByRole("img", { name: "ещё 1" })).toBeTruthy();
    expect(group.querySelector(".ds-avatar--md")).not.toBeNull();
  });

  it("порядок наложения: левый аватар выше соседей", () => {
    const { container } = render(<AvatarGroup people={PEOPLE} />);
    const items = [...container.querySelectorAll<HTMLElement>(".ds-avgroup__item")];
    expect(items.map((i) => i.style.zIndex)).toEqual(["3", "2", "1", "0"]);
  });

  it("подсказка с именем есть у каждого аватара и скрыта от скринридера", () => {
    const { container } = render(<AvatarGroup people={PEOPLE} />);
    const tips = container.querySelectorAll(".ds-avgroup__tip");
    expect(tips.length).toBe(3);
    expect(tips[1].textContent).toBe("Алексей Крылов");
    expect(tips[1].getAttribute("aria-hidden")).toBe("true");
  });

  it("неинтерактивная группа не пускает в Tab", () => {
    render(<AvatarGroup people={PEOPLE} />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("новый участник получает data-enter, первая отрисовка без анимации", () => {
    const { container, rerender } = render(<AvatarGroup people={PEOPLE.slice(0, 2)} max={3} />);
    expect(container.querySelector("[data-enter]")).toBeNull();
    rerender(<AvatarGroup people={PEOPLE.slice(0, 3)} max={3} />);
    const entered = container.querySelectorAll("[data-enter]");
    expect(entered.length).toBe(1);
    expect(entered[0].querySelector(".ds-avatar")?.getAttribute("aria-label")).toBe(
      "Мария Новикова",
    );
  });

  it("интерактивный «+N»: кнопка с aria-expanded и aria-haspopup", () => {
    render(<AvatarGroup people={PEOPLE} interactive />);
    const more = screen.getByRole("button", { name: "Ещё 2: показать всех участников" });
    expect(more.getAttribute("aria-expanded")).toBe("false");
    expect(more.getAttribute("aria-haspopup")).toBe("true");
  });

  it("клик открывает список с ролями и переводит фокус на первую строку", () => {
    render(<AvatarGroup people={PEOPLE} interactive />);
    const more = screen.getByRole("button", { name: /Ещё 2/ });
    fireEvent.click(more);
    expect(more.getAttribute("aria-expanded")).toBe("true");
    const list = screen.getByRole("list", { name: "Все участники" });
    const rows = list.querySelectorAll('[role="listitem"]');
    expect(rows.length).toBe(5);
    expect(rows[0].textContent).toContain("Оформление");
    expect(document.activeElement).toBe(rows[0]);
    expect(more.getAttribute("aria-controls")).toBe(list.id);
  });

  it("Esc закрывает список и возвращает фокус на «+N»", () => {
    render(<AvatarGroup people={PEOPLE} interactive />);
    const more = screen.getByRole("button", { name: /Ещё 2/ });
    fireEvent.click(more);
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: "Escape" });
    expect(screen.queryByRole("list")).toBeNull();
    expect(more.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(more);
  });

  it("клик снаружи закрывает список", () => {
    render(
      <div>
        <button type="button">снаружи</button>
        <AvatarGroup people={PEOPLE} interactive />
      </div>,
    );
    fireEvent.click(screen.getByRole("button", { name: /Ещё 2/ }));
    expect(screen.getByRole("list")).toBeTruthy();
    fireEvent.pointerDown(screen.getByRole("button", { name: "снаружи" }));
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("управляемый режим: expanded и onExpandedChange", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <AvatarGroup people={PEOPLE} interactive expanded={false} onExpandedChange={onChange} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Ещё 2/ }));
    expect(onChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole("list")).toBeNull();
    rerender(<AvatarGroup people={PEOPLE} interactive expanded onExpandedChange={onChange} />);
    expect(screen.getByRole("list")).toBeTruthy();
  });

  it("загрузка: заглушки того же числа и aria-busy", () => {
    const { container } = render(<AvatarGroup people={[]} loading loadingCount={4} />);
    const group = screen.getByRole("group", { name: "Участники загружаются" });
    expect(group.getAttribute("aria-busy")).toBe("true");
    expect(container.querySelectorAll(".ds-skel").length).toBe(4);
  });

  it("пусто: текст и кнопка «Добавить участника», если можно добавлять", () => {
    const onAdd = vi.fn();
    const { rerender } = render(<AvatarGroup people={[]} />);
    expect(screen.getByText("Участников нет")).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
    rerender(<AvatarGroup people={[]} onAdd={onAdd} />);
    fireEvent.click(screen.getByRole("button", { name: "Добавить участника" }));
    expect(onAdd).toHaveBeenCalledTimes(1);
    rerender(<AvatarGroup people={[]} onAdd={onAdd} addDisabled />);
    expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true);
  });

  it("className, атрибуты и ref пробрасываются, data-force по умолчанию нет", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<AvatarGroup ref={ref} people={PEOPLE} className="custom" data-testid="g" />);
    const group = screen.getByTestId("g");
    expect(ref.current).toBe(group);
    expect(group.classList.contains("custom")).toBe(true);
    expect(group.hasAttribute("data-force")).toBe(false);
  });
});
