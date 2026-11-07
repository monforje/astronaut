/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Sidebar, type SidebarGroup, type SidebarProps } from "./index";

const GROUPS: SidebarGroup[] = [
  {
    id: "screen",
    title: "Экран",
    icon: <svg data-testid="g-screen" />,
    items: [{ id: "cargo", label: "Грузы", icon: <svg />, count: 128 }],
  },
  {
    id: "layouts",
    title: "Макеты",
    icon: <svg />,
    items: [
      { id: "dash", label: "Дашборд", icon: <svg />, href: "/dash" },
      { id: "inbox", label: "Расхождения", icon: <svg />, count: 8, tone: "err" },
      { id: "wait", label: "Загрузка", count: "loading" },
      { id: "alert", label: "Внимание", dot: true },
      { id: "off", label: "Закрыто", disabled: true },
    ],
  },
];

function Panel(props: Partial<SidebarProps>) {
  return (
    <Sidebar
      groups={GROUPS}
      brand="Astronaut"
      brandMark={<i data-testid="mark" />}
      footerItems={[{ id: "help", label: "Справка" }]}
      defaultActive="cargo"
      {...props}
    />
  );
}

const edge = () =>
  screen.getAllByRole("button", { name: "Развернуть панель", hidden: true }).at(-1) as HTMLElement;

afterEach(() => localStorage.clear());

describe("Sidebar", () => {
  it("рендерит aside с навигацией «Разделы», группами и пунктами", () => {
    render(<Panel />);
    expect(screen.getByRole("navigation", { name: "Разделы" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Экран" })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Грузы/ })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Справка/ })).toBeTruthy();
  });

  it("подпись навигации меняется через navLabel", () => {
    render(<Panel navLabel="Меню" />);
    expect(screen.getByRole("navigation", { name: "Меню" })).toBeTruthy();
  });

  it("активный пункт помечен aria-current=page, остальные нет", () => {
    const { container } = render(<Panel />);
    const marked = container.querySelectorAll('[aria-current="page"]');
    expect(marked).toHaveLength(1);
    expect(marked[0].textContent).toContain("Грузы");
  });

  it("клик по пункту делает его активным и вызывает onActiveChange", () => {
    const onActiveChange = vi.fn();
    render(<Panel onActiveChange={onActiveChange} />);
    fireEvent.click(screen.getByRole("link", { name: /Расхождения/ }));
    expect(onActiveChange).toHaveBeenCalledWith("inbox");
    expect(screen.getByRole("link", { name: /Расхождения/ }).getAttribute("aria-current")).toBe(
      "page",
    );
    expect(screen.getByRole("link", { name: /Грузы/ }).hasAttribute("aria-current")).toBe(false);
  });

  it("пункт без href получает якорь по id и не уводит страницу, пункт с href сохраняет адрес", () => {
    render(<Panel />);
    expect(screen.getByRole("link", { name: /Дашборд/ }).getAttribute("href")).toBe("/dash");
    const link = screen.getByRole("link", { name: /Расхождения/ });
    expect(link.getAttribute("href")).toBe("#inbox");
    expect(fireEvent.click(link)).toBe(false);
  });

  it("onClick пункта вызывается до смены активного", () => {
    const onClick = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    render(
      <Panel
        groups={[
          {
            id: "g",
            title: "Группа",
            icon: <svg />,
            items: [{ id: "a", label: "Роутер", href: "/a", onClick }],
          },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("link", { name: /Роутер/ }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("link", { name: /Роутер/ }).getAttribute("aria-current")).toBe("page");
  });

  it("управляемый active: значение из пропса, без обработчика не меняется", () => {
    render(<Panel active="dash" />);
    fireEvent.click(screen.getByRole("link", { name: /Грузы/ }));
    expect(screen.getByRole("link", { name: /Дашборд/ }).getAttribute("aria-current")).toBe("page");
  });

  it("disabled-пункт не активируется, выпадает из порядка Tab и помечен aria-disabled", () => {
    const onActiveChange = vi.fn();
    render(<Panel onActiveChange={onActiveChange} />);
    const off = screen.getByRole("link", { name: /Закрыто/ });
    expect(off.getAttribute("aria-disabled")).toBe("true");
    expect(off.tabIndex).toBe(-1);
    fireEvent.click(off);
    expect(onActiveChange).not.toHaveBeenCalled();
  });

  it("счётчик: число с тоном, загрузка и точка с подписями", () => {
    const { container } = render(<Panel />);
    const counts = container.querySelectorAll(".ds-side__cnt");
    expect(counts[0].textContent).toBe("128");
    expect(counts[1].getAttribute("data-tone")).toBe("err");
    expect(screen.getByLabelText("загрузка")).toBeTruthy();
    expect(screen.getByLabelText("требует внимания")).toBeTruthy();
  });

  it("клик по группе сворачивает её: aria-expanded и inert, повторный возвращает", () => {
    const onClosedGroupsChange = vi.fn();
    const { container } = render(<Panel onClosedGroupsChange={onClosedGroupsChange} />);
    const group = screen.getByRole("button", { name: "Макеты" });
    expect(group.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(group);
    expect(group.getAttribute("aria-expanded")).toBe("false");
    expect(onClosedGroupsChange).toHaveBeenLastCalledWith(["layouts"]);
    expect(container.querySelectorAll(".ds-side__list")[1].hasAttribute("inert")).toBe(true);
    fireEvent.click(group);
    expect(group.getAttribute("aria-expanded")).toBe("true");
    expect(onClosedGroupsChange).toHaveBeenLastCalledWith([]);
  });

  it("defaultClosedGroups и closedGroups задают свёрнутые группы", () => {
    const { rerender } = render(<Panel defaultClosedGroups={["screen"]} />);
    expect(screen.getByRole("button", { name: "Экран" }).getAttribute("aria-expanded")).toBe(
      "false",
    );
    rerender(<Panel closedGroups={["layouts"]} />);
    expect(screen.getByRole("button", { name: "Макеты" }).getAttribute("aria-expanded")).toBe(
      "false",
    );
  });

  it("кнопка в шапке переключает rail, меняет подпись и вызывает onRailChange", () => {
    const onRailChange = vi.fn();
    const { container } = render(<Panel onRailChange={onRailChange} />);
    expect(container.querySelector(".ds-side")?.hasAttribute("data-rail")).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Свернуть панель" }));
    expect(onRailChange).toHaveBeenLastCalledWith(true);
    expect(container.querySelector(".ds-side")?.hasAttribute("data-rail")).toBe(true);
    fireEvent.click(screen.getAllByRole("button", { name: "Развернуть панель" })[0]);
    expect(onRailChange).toHaveBeenLastCalledWith(false);
  });

  it("Ctrl+\\ в панели переключает rail", () => {
    const { container } = render(<Panel />);
    fireEvent.keyDown(screen.getByRole("link", { name: /Грузы/ }), { key: "\\", ctrlKey: true });
    expect(container.querySelector(".ds-side")?.hasAttribute("data-rail")).toBe(true);
  });

  it("управляемый rail: значение из пропса", () => {
    const { container } = render(<Panel rail />);
    fireEvent.click(screen.getAllByRole("button", { name: "Развернуть панель", hidden: true })[0]);
    expect(container.querySelector(".ds-side")?.hasAttribute("data-rail")).toBe(true);
  });

  it("в rail группы свёрнуты (inert), клик по группе разворачивает панель", () => {
    const onRailChange = vi.fn();
    const { container } = render(<Panel defaultRail onRailChange={onRailChange} />);
    expect(container.querySelectorAll(".ds-side__list")[0].hasAttribute("inert")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Экран" }));
    expect(onRailChange).toHaveBeenLastCalledWith(false);
  });

  it("в rail кромка доступна с клавиатуры, в развёрнутом виде нет", () => {
    const { rerender } = render(<Panel />);
    expect(edge().tabIndex).toBe(-1);
    rerender(<Panel defaultRail rail />);
    expect(edge().tabIndex).toBe(0);
  });

  it("в rail наведение на группу показывает подсказку, уход мыши убирает", () => {
    render(<Panel defaultRail />);
    fireEvent.mouseEnter(screen.getByRole("button", { name: "Макеты" }));
    expect(screen.getByRole("tooltip").textContent).toBe("Макеты");
    fireEvent.mouseLeave(screen.getByRole("button", { name: "Макеты" }));
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("подсказка у кнопки сворачивания показывает сочетание клавиш", () => {
    render(<Panel defaultRail />);
    fireEvent.mouseEnter(
      screen.getAllByRole("button", { name: "Развернуть панель", hidden: true })[0],
    );
    expect(screen.getByRole("tooltip").textContent).toBe("РазвернутьCtrl+\\");
  });

  it("в развёрнутом виде подсказок нет", () => {
    render(<Panel />);
    fireEvent.mouseEnter(screen.getByRole("button", { name: "Макеты" }));
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("при разворачивании панели подсказка исчезает", () => {
    render(<Panel defaultRail />);
    const group = screen.getByRole("button", { name: "Макеты" });
    fireEvent.mouseEnter(group);
    fireEvent.click(group);
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("бренд и знак рисуются, если переданы", () => {
    const { container } = render(<Panel />);
    expect(container.querySelector(".ds-side__logo")?.textContent).toBe("Astronaut");
    expect(screen.getByTestId("mark")).toBeTruthy();
  });

  it("storageKey: состояние читается из localStorage и записывается при изменении", () => {
    localStorage.setItem("side", JSON.stringify({ rail: true, closed: ["screen"] }));
    const { container } = render(<Panel storageKey="side" />);
    expect(container.querySelector(".ds-side")?.hasAttribute("data-rail")).toBe(true);
    fireEvent.click(screen.getAllByRole("button", { name: "Развернуть панель", hidden: true })[0]);
    expect(JSON.parse(localStorage.getItem("side") ?? "{}")).toEqual({
      rail: false,
      closed: ["screen"],
    });
  });

  it("битое значение в localStorage игнорируется", () => {
    localStorage.setItem("side", "{не json");
    const { container } = render(<Panel storageKey="side" defaultRail />);
    expect(container.querySelector(".ds-side")?.hasAttribute("data-rail")).toBe(true);
  });

  it("ref, className, атрибуты и toggleProps пробрасываются, data-force по умолчанию нет", () => {
    const ref = createRef<HTMLElement>();
    const { container } = render(
      <Panel
        ref={ref}
        className="custom"
        aria-label="Боковая панель"
        toggleProps={{ title: "Пер" }}
      />,
    );
    const aside = container.querySelector("aside") as HTMLElement;
    expect(ref.current).toBe(aside);
    expect(aside.classList.contains("custom")).toBe(true);
    expect(aside.getAttribute("aria-label")).toBe("Боковая панель");
    expect(screen.getByRole("button", { name: "Свернуть панель" }).getAttribute("title")).toBe(
      "Пер",
    );
    expect(container.querySelector("[data-force]")).toBeNull();
  });

  it("значки скрыты от скринридера", () => {
    const { container } = render(<Panel />);
    expect(container.querySelector(".ds-side__glyph")?.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelector(".ds-side__ic")?.getAttribute("aria-hidden")).toBe("true");
  });
});
