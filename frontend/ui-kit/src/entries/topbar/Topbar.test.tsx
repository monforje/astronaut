/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  Topbar,
  TopbarAction,
  TopbarProfile,
  TopbarSearch,
  type TopbarProfileProps,
} from "./index";

const CRUMBS = [
  { label: "Грузы", href: "/cargo" },
  { label: "Морской импорт", href: "/cargo/sea" },
  { label: "MSKU4821907" },
];

function Profile(props: Partial<TopbarProfileProps>) {
  return (
    <TopbarProfile
      avatar={<i data-testid="avatar" />}
      name="Иван Петров"
      subtitle="Оформление"
      items={[
        { label: "Профиль" },
        { label: "Настройки", href: "/settings" },
        { label: "Выйти", separatorBefore: true },
      ]}
      {...props}
    />
  );
}

describe("Topbar", () => {
  it("рендерит header с крошками, поиском и действиями", () => {
    render(
      <Topbar
        crumbs={CRUMBS}
        search={<TopbarSearch />}
        actions={<TopbarAction label="Уведомления" icon={<svg />} />}
      />,
    );
    expect(screen.getByRole("banner")).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "Навигация" })).toBeTruthy();
    expect(screen.getByRole("search")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Уведомления" })).toBeTruthy();
  });

  it("последняя крошка помечена aria-current, остальные ссылки", () => {
    render(<Topbar crumbs={CRUMBS} />);
    expect(screen.getAllByRole("link")).toHaveLength(2);
    expect(screen.getByText("MSKU4821907").getAttribute("aria-current")).toBe("page");
  });

  it("крошка без href рисуется кнопкой и вызывает onClick", () => {
    const onClick = vi.fn();
    render(<Topbar crumbs={[{ label: "Грузы", onClick }, { label: "Текущая" }]} />);
    fireEvent.click(screen.getByRole("button", { name: "Грузы" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("слот start заменяет крошки, crumbsLabel меняет подпись навигации", () => {
    const { rerender } = render(<Topbar start={<h1>Дашборд</h1>} crumbs={CRUMBS} />);
    expect(screen.getByRole("heading", { name: "Дашборд" })).toBeTruthy();
    expect(screen.queryByRole("navigation")).toBeNull();
    rerender(<Topbar crumbs={CRUMBS} crumbsLabel="Путь" />);
    expect(screen.getByRole("navigation", { name: "Путь" })).toBeTruthy();
  });

  it("без search центральной области нет", () => {
    const { container } = render(<Topbar crumbs={CRUMBS} />);
    expect(container.querySelector(".ds-top__center")).toBeNull();
  });

  it("Ctrl+K внутри шапки переводит фокус в поиск", () => {
    render(
      <Topbar
        crumbs={CRUMBS}
        search={<TopbarSearch />}
        actions={<TopbarAction label="Уведомления" icon={<svg />} />}
      />,
    );
    const bell = screen.getByRole("button", { name: "Уведомления" });
    bell.focus();
    fireEvent.keyDown(bell, { key: "k", ctrlKey: true });
    expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Глобальный поиск" }));
  });

  it("Meta+K тоже работает, searchHotkey=false отключает", () => {
    const { rerender } = render(
      <Topbar
        crumbs={CRUMBS}
        search={<TopbarSearch />}
        actions={<TopbarAction label="Д" icon={<svg />} />}
      />,
    );
    const action = screen.getByRole("button", { name: "Д" });
    fireEvent.keyDown(action, { key: "K", metaKey: true });
    expect(document.activeElement).toBe(screen.getByRole("textbox"));
    (document.activeElement as HTMLElement).blur();
    rerender(
      <Topbar
        searchHotkey={false}
        crumbs={CRUMBS}
        search={<TopbarSearch />}
        actions={<TopbarAction label="Д" icon={<svg />} />}
      />,
    );
    fireEvent.keyDown(screen.getByRole("button", { name: "Д" }), { key: "k", ctrlKey: true });
    expect(document.activeElement).not.toBe(screen.getByRole("textbox"));
  });

  it("searchHotkey=global ловит Ctrl+K на документе", () => {
    render(<Topbar searchHotkey="global" crumbs={CRUMBS} search={<TopbarSearch />} />);
    fireEvent.keyDown(document.body, { key: "k", ctrlKey: true });
    expect(document.activeElement).toBe(screen.getByRole("textbox"));
  });

  it("ref, className и атрибуты пробрасываются на header", () => {
    const ref = createRef<HTMLElement>();
    render(<Topbar ref={ref} className="custom" aria-label="Шапка" crumbs={CRUMBS} />);
    const header = screen.getByRole("banner");
    expect(ref.current).toBe(header);
    expect(header.classList.contains("custom")).toBe(true);
    expect(header.getAttribute("aria-label")).toBe("Шапка");
  });
});

describe("TopbarSearch", () => {
  it("поле с подписью, подсказкой клавиш и значком", () => {
    const { container } = render(<TopbarSearch placeholder="Поиск по грузам" />);
    const input = screen.getByRole("textbox", { name: "Глобальный поиск" });
    expect(input.getAttribute("placeholder")).toBe("Поиск по грузам");
    expect(input.getAttribute("aria-keyshortcuts")).toBe("Control+K Meta+K");
    expect(container.querySelector(".ds-top__kbd")?.textContent).toBe("Ctrl K");
    expect(container.querySelector(".ds-top__lead")).toBeTruthy();
  });

  it("shortcut=false убирает подсказку и aria-keyshortcuts", () => {
    const { container } = render(<TopbarSearch shortcut={false} />);
    expect(container.querySelector(".ds-top__kbd")).toBeNull();
    expect(screen.getByRole("textbox").hasAttribute("aria-keyshortcuts")).toBe(false);
  });

  it("loading заменяет значок спиннером и ставит aria-busy", () => {
    const { container } = render(<TopbarSearch loading />);
    expect(container.querySelector(".ds-top__spin")).toBeTruthy();
    expect(container.querySelector(".ds-top__lead")).toBeNull();
    expect(screen.getByRole("textbox").getAttribute("aria-busy")).toBe("true");
  });

  it("управляемое значение, ref и rootProps", () => {
    const ref = createRef<HTMLInputElement>();
    const onChange = vi.fn();
    const { container } = render(
      <TopbarSearch ref={ref} value="MSKU" onChange={onChange} rootProps={{ "data-x": "1" }} />,
    );
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(ref.current).toBe(input);
    expect(input.value).toBe("MSKU");
    fireEvent.change(input, { target: { value: "MSKU4" } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(container.querySelector("label")?.getAttribute("data-x")).toBe("1");
    expect(container.querySelector("[data-force]")).toBeNull();
  });
});

describe("TopbarAction", () => {
  it("кнопка с подписью, значок скрыт от скринридера", () => {
    const { container } = render(<TopbarAction label="Сменить тему" icon={<svg />} />);
    const button = screen.getByRole("button", { name: "Сменить тему" });
    expect(button.getAttribute("type")).toBe("button");
    expect(container.querySelector(".ds-top__ico")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("бейдж добавляет число в подпись и обрезается до 9+", () => {
    const { container, rerender } = render(
      <TopbarAction label="Уведомления" icon={<svg />} badge={3} />,
    );
    expect(screen.getByRole("button", { name: "Уведомления, 3 новых" })).toBeTruthy();
    expect(container.querySelector(".ds-top__badge")?.textContent).toBe("3");
    rerender(<TopbarAction label="Уведомления" icon={<svg />} badge={14} />);
    expect(container.querySelector(".ds-top__badge")?.textContent).toBe("9+");
  });

  it("без бейджа или с нулём его нет, onClick и ref работают", () => {
    const onClick = vi.fn();
    const ref = createRef<HTMLButtonElement>();
    const { container } = render(
      <TopbarAction ref={ref} label="Тема" icon={<svg />} badge={0} onClick={onClick} />,
    );
    expect(container.querySelector(".ds-top__badge")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Тема" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(ref.current).toBe(screen.getByRole("button"));
  });
});

describe("TopbarProfile", () => {
  it("кнопка с aria-haspopup, меню закрыто", () => {
    render(<Profile />);
    const button = screen.getByRole("button", { name: "Профиль" });
    expect(button.getAttribute("aria-haspopup")).toBe("menu");
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("клик открывает меню с шапкой пользователя и пунктами, фокус на первом пункте", () => {
    render(<Profile />);
    fireEvent.click(screen.getByRole("button", { name: "Профиль" }));
    expect(screen.getByRole("menu", { name: "Иван Петров" })).toBeTruthy();
    expect(screen.getAllByRole("menuitem").map((m) => m.textContent)).toEqual([
      "Профиль",
      "Настройки",
      "Выйти",
    ]);
    expect(screen.getByText("Оформление")).toBeTruthy();
    expect(document.activeElement).toBe(screen.getAllByRole("menuitem")[0]);
  });

  it("пункт с href рисуется ссылкой, перед «Выйти» есть разделитель", () => {
    render(<Profile defaultOpen />);
    expect(screen.getByRole("menuitem", { name: "Настройки" }).tagName).toBe("A");
    expect(document.querySelectorAll(".ds-top__msep")).toHaveLength(2);
  });

  it("выбор пункта вызывает onSelect и закрывает меню", () => {
    const onSelect = vi.fn();
    render(<Profile items={[{ label: "Выйти", onSelect }]} defaultOpen />);
    fireEvent.click(screen.getByRole("menuitem", { name: "Выйти" }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("стрелки, Home и End двигают фокус по пунктам", () => {
    render(<Profile />);
    fireEvent.click(screen.getByRole("button", { name: "Профиль" }));
    const [a, b, c] = screen.getAllByRole("menuitem");
    fireEvent.keyDown(a, { key: "ArrowDown" });
    expect(document.activeElement).toBe(b);
    fireEvent.keyDown(b, { key: "End" });
    expect(document.activeElement).toBe(c);
    fireEvent.keyDown(c, { key: "ArrowDown" });
    expect(document.activeElement).toBe(a);
    fireEvent.keyDown(a, { key: "ArrowUp" });
    expect(document.activeElement).toBe(c);
    fireEvent.keyDown(c, { key: "Home" });
    expect(document.activeElement).toBe(a);
  });

  it("Escape закрывает меню и возвращает фокус на кнопку", () => {
    render(<Profile />);
    const button = screen.getByRole("button", { name: "Профиль" });
    fireEvent.click(button);
    fireEvent.keyDown(screen.getAllByRole("menuitem")[0], { key: "Escape" });
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(button);
  });

  it("ArrowDown на кнопке открывает меню", () => {
    render(<Profile />);
    fireEvent.keyDown(screen.getByRole("button", { name: "Профиль" }), { key: "ArrowDown" });
    expect(screen.getByRole("menu")).toBeTruthy();
  });

  it("клик вне закрывает меню", () => {
    render(<Profile />);
    fireEvent.click(screen.getByRole("button", { name: "Профиль" }));
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("управляемый режим: open без переноса фокуса, onOpenChange при клике", () => {
    const onOpenChange = vi.fn();
    render(<Profile open onOpenChange={onOpenChange} />);
    expect(screen.getByRole("menu")).toBeTruthy();
    expect(document.activeElement).toBe(document.body);
    fireEvent.click(screen.getByRole("button", { name: "Профиль" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole("menu")).toBeTruthy();
  });

  it("аватар рисуется в кнопке и, если нет menuAvatar, в шапке меню", () => {
    render(<Profile defaultOpen />);
    expect(screen.getAllByTestId("avatar")).toHaveLength(2);
  });

  it("атрибуты и ref пробрасываются на кнопку, data-force по умолчанию нет", () => {
    const ref = createRef<HTMLButtonElement>();
    const { container } = render(<Profile ref={ref} className="custom" data-x="1" />);
    const button = screen.getByRole("button", { name: "Профиль" });
    expect(ref.current).toBe(button);
    expect(button.classList.contains("custom")).toBe(true);
    expect(button.getAttribute("data-x")).toBe("1");
    expect(container.querySelector("[data-force]")).toBeNull();
  });
});
