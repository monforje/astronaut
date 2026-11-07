/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  Dropdown,
  DropdownHeader,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
  type DropdownProps,
} from "./index";

function Actions(props: Partial<DropdownProps> & { onArchive?: () => void; onOpen?: () => void }) {
  const { onArchive, onOpen, ...rest } = props;
  return (
    <Dropdown label="Действия" {...rest}>
      <DropdownItem onSelect={onOpen}>Открыть карточку</DropdownItem>
      <DropdownItem shortcut="Ctrl C">Копировать номер</DropdownItem>
      <DropdownItem disabled hint="Расхождений нет">
        Исправить в 1С
      </DropdownItem>
      <DropdownSeparator />
      <DropdownItem danger onSelect={onArchive}>
        В архив
      </DropdownItem>
    </Dropdown>
  );
}

const trigger = () => screen.getByRole("button", { name: /Действия|Ещё/ });
const menu = () => screen.getByRole("menu");
const items = () => screen.getAllByRole("menuitem");
const openMenu = () => fireEvent.click(trigger());

describe("Dropdown", () => {
  it("закрытое меню: кнопка с aria-haspopup=menu и aria-expanded=false, меню нет", () => {
    render(<Actions />);
    expect(trigger().getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
    expect(trigger().hasAttribute("aria-controls")).toBe(false);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("клик открывает меню с подписью, aria-controls ведёт на него", () => {
    render(<Actions />);
    openMenu();
    expect(menu().getAttribute("aria-label")).toBe("Действия");
    expect(trigger().getAttribute("aria-expanded")).toBe("true");
    expect(trigger().getAttribute("aria-controls")).toBe(menu().id);
    expect(items()).toHaveLength(4);
  });

  it("при открытии фокус сразу на первом доступном пункте", () => {
    render(<Actions />);
    openMenu();
    expect(document.activeElement).toBe(items()[0]);
  });

  it("пункты не входят в порядок Tab", () => {
    render(<Actions />);
    openMenu();
    for (const item of items()) expect(item.tabIndex).toBe(-1);
  });

  it("недоступный пункт — disabled, пояснение рисуется", () => {
    render(<Actions />);
    openMenu();
    const off = screen.getByRole("menuitem", { name: /Исправить в 1С/ }) as HTMLButtonElement;
    expect(off.disabled).toBe(true);
    expect(off.querySelector("small")?.textContent).toBe("Расхождений нет");
  });

  it("стрелка вниз идёт по доступным по кругу, недоступный пропускается", () => {
    render(<Actions />);
    openMenu();
    fireEvent.keyDown(menu(), { key: "ArrowDown" });
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: /Копировать/ }));
    fireEvent.keyDown(menu(), { key: "ArrowDown" });
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "В архив" }));
    fireEvent.keyDown(menu(), { key: "ArrowDown" });
    expect(document.activeElement).toBe(items()[0]);
  });

  it("стрелка вверх с первого уходит на последний, Home и End", () => {
    render(<Actions />);
    openMenu();
    fireEvent.keyDown(menu(), { key: "ArrowUp" });
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "В архив" }));
    fireEvent.keyDown(menu(), { key: "Home" });
    expect(document.activeElement).toBe(items()[0]);
    fireEvent.keyDown(menu(), { key: "End" });
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "В архив" }));
  });

  it("Esc закрывает меню и возвращает фокус на кнопку", () => {
    render(<Actions />);
    openMenu();
    fireEvent.keyDown(menu(), { key: "Escape" });
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it("Tab закрывает меню", () => {
    render(<Actions />);
    openMenu();
    fireEvent.keyDown(menu(), { key: "Tab" });
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("выбор пункта вызывает onSelect, закрывает меню и возвращает фокус на кнопку", () => {
    const onArchive = vi.fn();
    render(<Actions onArchive={onArchive} />);
    openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: "В архив" }));
    expect(onArchive).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it("клик по недоступному пункту ничего не делает", () => {
    render(<Actions />);
    openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: /Исправить в 1С/ }));
    expect(screen.getByRole("menu")).toBeTruthy();
  });

  it("стрелка вниз на кнопке открывает меню, вверх открывает и ставит фокус на последний", () => {
    const { unmount } = render(<Actions />);
    fireEvent.keyDown(trigger(), { key: "ArrowDown" });
    expect(document.activeElement).toBe(items()[0]);
    unmount();
    render(<Actions />);
    fireEvent.keyDown(trigger(), { key: "ArrowUp" });
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "В архив" }));
  });

  it("повторный клик по кнопке закрывает меню", () => {
    render(<Actions />);
    openMenu();
    openMenu();
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("клик вне меню закрывает его, прокрутка страницы тоже", () => {
    render(
      <>
        <button type="button">Снаружи</button>
        <Actions />
      </>,
    );
    openMenu();
    fireEvent.mouseDown(screen.getByRole("button", { name: "Снаружи" }));
    expect(screen.queryByRole("menu")).toBeNull();
    openMenu();
    fireEvent.scroll(document);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("одновременно открыто одно меню", () => {
    render(
      <>
        <Dropdown label="Первое" triggerLabel="Первое">
          <DropdownItem>А</DropdownItem>
        </Dropdown>
        <Dropdown label="Второе" triggerLabel="Второе">
          <DropdownItem>Б</DropdownItem>
        </Dropdown>
      </>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Первое" }));
    fireEvent.click(screen.getByRole("button", { name: "Второе" }));
    expect(screen.getAllByRole("menu")).toHaveLength(1);
    expect(screen.getByRole("menu").getAttribute("aria-label")).toBe("Второе");
  });

  it("kind=icon рисует квадратную кнопку с именем «Ещё» без подписи", () => {
    render(<Actions kind="icon" />);
    const button = screen.getByRole("button", { name: "Ещё" });
    expect(button.classList.contains("ds-btn--sq")).toBe(true);
    expect(button.querySelector(".ds-btn__label")).toBeNull();
  });

  it("triggerLabel задаёт подпись кнопки", () => {
    render(<Actions triggerLabel="Колонки" />);
    expect(screen.getByRole("button", { name: "Колонки" })).toBeTruthy();
  });

  it("управляемое open: onOpenChange получает причину, состояние снаружи", () => {
    const onOpenChange = vi.fn();
    render(<Actions open={false} onOpenChange={onOpenChange} />);
    openMenu();
    expect(onOpenChange).toHaveBeenCalledWith(true, "trigger");
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("defaultOpen открывает меню сразу и не уводит фокус", () => {
    render(<Actions defaultOpen />);
    expect(menu()).toBeTruthy();
    expect(document.activeElement).toBe(document.body);
  });

  it("если снизу нет места, меню открывается вверх", () => {
    const original = HTMLElement.prototype.getBoundingClientRect;
    const offset = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetHeight");
    HTMLElement.prototype.getBoundingClientRect = function () {
      return {
        top: 700,
        bottom: 730,
        left: 10,
        right: 120,
        width: 110,
        height: 30,
        x: 10,
        y: 700,
      } as DOMRect;
    };
    Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
      configurable: true,
      value: 220,
    });
    try {
      render(<Actions />);
      openMenu();
      expect(menu().parentElement?.getAttribute("data-side")).toBe("top");
    } finally {
      HTMLElement.prototype.getBoundingClientRect = original;
      if (offset) Object.defineProperty(HTMLElement.prototype, "offsetHeight", offset);
    }
  });

  it("end выравнивает меню по правому краю кнопки", () => {
    const original = HTMLElement.prototype.getBoundingClientRect;
    const width = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetWidth");
    HTMLElement.prototype.getBoundingClientRect = function () {
      return {
        top: 10,
        bottom: 40,
        left: 600,
        right: 640,
        width: 40,
        height: 30,
        x: 600,
        y: 10,
      } as DOMRect;
    };
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", { configurable: true, value: 240 });
    try {
      render(<Actions end kind="icon" />);
      openMenu();
      expect(menu().parentElement?.getAttribute("data-align")).toBe("end");
      expect(menu().parentElement?.style.left).toBe("400px");
    } finally {
      HTMLElement.prototype.getBoundingClientRect = original;
      if (width) Object.defineProperty(HTMLElement.prototype, "offsetWidth", width);
    }
  });

  it("className и ref относятся к корню, data-атрибуты пробрасываются", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Actions ref={ref} className="custom" data-testid="d" />);
    expect(ref.current).toBe(screen.getByTestId("d"));
    expect(ref.current?.classList.contains("ds-menu__host")).toBe(true);
    expect(ref.current?.classList.contains("custom")).toBe(true);
  });

  it("сам по себе не ставит data-force", () => {
    render(<Actions defaultOpen />);
    expect(document.querySelector("[data-force]")).toBeNull();
  });
});

describe("DropdownItem", () => {
  it("значок скрыт от скринридера, подсказка клавиш рисуется", () => {
    render(
      <Dropdown label="Меню" defaultOpen>
        <DropdownItem icon={<svg data-testid="ico" />} shortcut="Ctrl ,">
          Настройки
        </DropdownItem>
      </Dropdown>,
    );
    expect(screen.getByTestId("ico").parentElement?.getAttribute("aria-hidden")).toBe("true");
    expect(screen.getByText("Ctrl ,").className).toBe("ds-menu__end");
  });

  it("danger добавляет класс", () => {
    render(
      <Dropdown label="Меню" defaultOpen>
        <DropdownItem danger>Выйти</DropdownItem>
      </Dropdown>,
    );
    expect(screen.getByRole("menuitem").classList.contains("ds-menu__item--danger")).toBe(true);
  });

  it("пункт-флажок: menuitemcheckbox, клик меняет aria-checked и не закрывает меню", () => {
    const onCheckedChange = vi.fn();
    render(
      <Dropdown label="Колонки" defaultOpen>
        <DropdownItem defaultChecked onCheckedChange={onCheckedChange}>
          Клиент
        </DropdownItem>
      </Dropdown>,
    );
    const item = screen.getByRole("menuitemcheckbox", { name: "Клиент" });
    expect(item.getAttribute("aria-checked")).toBe("true");
    fireEvent.click(item);
    expect(item.getAttribute("aria-checked")).toBe("false");
    expect(onCheckedChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole("menu")).toBeTruthy();
  });

  it("управляемый флажок берёт значение из checked", () => {
    render(
      <Dropdown label="Колонки" defaultOpen>
        <DropdownItem checked={false}>Вес</DropdownItem>
      </Dropdown>,
    );
    const item = screen.getByRole("menuitemcheckbox");
    fireEvent.click(item);
    expect(item.getAttribute("aria-checked")).toBe("false");
  });

  it("onClick с preventDefault отменяет закрытие и onSelect", () => {
    const onSelect = vi.fn();
    render(
      <Dropdown label="Меню" defaultOpen>
        <DropdownItem onClick={(event) => event.preventDefault()} onSelect={onSelect}>
          Один
        </DropdownItem>
      </Dropdown>,
    );
    fireEvent.click(screen.getByRole("menuitem"));
    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getByRole("menu")).toBeTruthy();
  });
});

describe("Заголовок, метка и разделитель", () => {
  it("рисуют заголовок с аватаром, метку группы и разделитель", () => {
    render(
      <Dropdown label="Пользователь" defaultOpen>
        <DropdownHeader
          title="Ирина Петрова"
          subtitle="Оформление"
          avatar={<i data-testid="av" />}
        />
        <DropdownLabel>Группа</DropdownLabel>
        <DropdownSeparator />
        <DropdownItem>Профиль</DropdownItem>
      </Dropdown>,
    );
    expect(screen.getByText("Ирина Петрова").tagName).toBe("B");
    expect(screen.getByText("Оформление").tagName).toBe("SMALL");
    expect(screen.getByTestId("av")).toBeTruthy();
    expect(screen.getByText("Группа").getAttribute("role")).toBe("presentation");
    expect(screen.getAllByRole("separator").length).toBeGreaterThan(0);
  });
});
