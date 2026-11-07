/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Select, type SelectOption } from "./index";

const OPTIONS: SelectOption[] = [
  { value: "ok", label: "Сверено", hint: "Документы совпадают" },
  { value: "err", label: "Расхождение" },
  { value: "arch", label: "Архив", disabled: true },
  { value: "wait", label: "Ждём документ" },
];

const search = () => screen.getByRole("combobox");
const trigger = () => screen.getByRole("button");
const optionLabels = () => screen.queryAllByRole("option").map((o) => o.textContent);
const activeOf = (host: HTMLElement) =>
  [
    ...(document
      .getElementById(host.getAttribute("aria-activedescendant") ?? "")
      ?.querySelector(".ds-select__tx")?.childNodes ?? []),
  ]
    .filter((node) => !(node as Element).classList?.contains("ds-select__hint"))
    .map((node) => node.textContent)
    .join("");

function openList(element: HTMLElement = trigger()) {
  fireEvent.click(element);
  return screen.getByRole("listbox");
}

describe("Select", () => {
  it("закрытый: кнопка с placeholder, aria-haspopup, aria-expanded=false, списка нет", () => {
    render(<Select options={OPTIONS} placeholder="Все статусы" />);
    expect(trigger().textContent).toBe("Все статусы");
    expect(trigger().getAttribute("aria-haspopup")).toBe("listbox");
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
    expect(trigger().hasAttribute("aria-controls")).toBe(false);
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(trigger().className).toBe("ds-select__trigger");
  });

  it("клик открывает список: aria-expanded=true и aria-controls на listbox", () => {
    render(<Select options={OPTIONS} />);
    const list = openList();
    expect(trigger().getAttribute("aria-expanded")).toBe("true");
    expect(trigger().getAttribute("aria-controls")).toBe(list.id);
    expect(optionLabels()).toHaveLength(4);
  });

  it("повторный клик по кнопке закрывает список", () => {
    render(<Select options={OPTIONS} />);
    openList();
    fireEvent.click(trigger());
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("defaultValue показывает выбранное и помечает его aria-selected", () => {
    render(<Select options={OPTIONS} defaultValue="err" />);
    expect(trigger().textContent).toBe("Расхождение");
    openList();
    expect(screen.getByRole("option", { name: "Расхождение" }).getAttribute("aria-selected")).toBe(
      "true",
    );
    expect(screen.getByRole("option", { name: /Сверено/ }).getAttribute("aria-selected")).toBe(
      "false",
    );
  });

  it("при открытии фокус уходит в список, активен выбранный пункт", () => {
    render(<Select options={OPTIONS} defaultValue="err" />);
    const list = openList();
    expect(document.activeElement).toBe(list);
    expect(activeOf(list)).toBe("Расхождение");
  });

  it("клик по пункту выбирает значение, закрывает список и возвращает фокус на кнопку", () => {
    const onValueChange = vi.fn();
    render(<Select options={OPTIONS} onValueChange={onValueChange} />);
    openList();
    fireEvent.click(screen.getByRole("option", { name: "Расхождение" }));
    expect(onValueChange).toHaveBeenCalledWith("err");
    expect(trigger().textContent).toBe("Расхождение");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it("управляемый режим: значение из value, выбор только сообщает", () => {
    const onValueChange = vi.fn();
    render(<Select options={OPTIONS} value="ok" onValueChange={onValueChange} />);
    openList();
    fireEvent.click(screen.getByRole("option", { name: "Расхождение" }));
    expect(onValueChange).toHaveBeenCalledWith("err");
    expect(trigger().textContent).toBe("Сверено");
  });

  it("недоступный пункт помечен aria-disabled и не выбирается", () => {
    const onValueChange = vi.fn();
    render(<Select options={OPTIONS} onValueChange={onValueChange} />);
    openList();
    const disabled = screen.getByRole("option", { name: "Архив" });
    expect(disabled.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(disabled);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole("listbox")).toBeTruthy();
  });

  it("стрелки двигают активный пункт по кругу и пропускают недоступные", () => {
    render(<Select options={OPTIONS} defaultValue="err" />);
    const list = openList();
    fireEvent.keyDown(list, { key: "ArrowDown" });
    expect(activeOf(list)).toBe("Ждём документ");
    fireEvent.keyDown(list, { key: "ArrowDown" });
    expect(activeOf(list)).toBe("Сверено");
    fireEvent.keyDown(list, { key: "ArrowUp" });
    expect(activeOf(list)).toBe("Ждём документ");
  });

  it("Home и End идут к первому и последнему доступным", () => {
    render(<Select options={OPTIONS} defaultValue="err" />);
    const list = openList();
    fireEvent.keyDown(list, { key: "End" });
    expect(activeOf(list)).toBe("Ждём документ");
    fireEvent.keyDown(list, { key: "Home" });
    expect(activeOf(list)).toBe("Сверено");
  });

  it("Enter выбирает активный пункт", () => {
    const onValueChange = vi.fn();
    render(<Select options={OPTIONS} onValueChange={onValueChange} />);
    const list = openList();
    fireEvent.keyDown(list, { key: "ArrowDown" });
    fireEvent.keyDown(list, { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith("err");
    expect(document.activeElement).toBe(trigger());
  });

  it("Esc закрывает список без выбора и возвращает фокус на кнопку", () => {
    const onValueChange = vi.fn();
    render(<Select options={OPTIONS} onValueChange={onValueChange} />);
    const list = openList();
    fireEvent.keyDown(list, { key: "Escape" });
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(onValueChange).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(trigger());
  });

  it("Tab закрывает список", () => {
    render(<Select options={OPTIONS} />);
    const list = openList();
    fireEvent.keyDown(list, { key: "Tab" });
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("стрелка вниз на кнопке открывает список", () => {
    render(<Select options={OPTIONS} />);
    fireEvent.keyDown(trigger(), { key: "ArrowDown" });
    expect(screen.getByRole("listbox")).toBeTruthy();
  });

  it("после первой стрелки включается клавиатурный режим, мышь его гасит", () => {
    render(<Select options={OPTIONS} />);
    const list = openList();
    const panel = list.parentElement as HTMLElement;
    expect(panel.hasAttribute("data-kb")).toBe(false);
    fireEvent.keyDown(list, { key: "ArrowDown" });
    expect(panel.hasAttribute("data-kb")).toBe(true);
    fireEvent.mouseMove(screen.getByRole("option", { name: "Расхождение" }));
    expect(panel.hasAttribute("data-kb")).toBe(false);
  });

  it("клик мимо списка закрывает его без возврата фокуса", () => {
    render(
      <>
        <button type="button">Другое</button>
        <Select options={OPTIONS} />
      </>,
    );
    openList(screen.getByRole("button", { name: "Выберите" }));
    fireEvent.mouseDown(screen.getByRole("button", { name: "Другое" }));
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("открытие другого списка закрывает этот", () => {
    render(
      <>
        <Select options={OPTIONS} aria-label="Первый" />
        <Select options={OPTIONS} aria-label="Второй" />
      </>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Первый" }));
    expect(screen.getAllByRole("listbox")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Второй" }));
    expect(screen.getAllByRole("listbox")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Первый" }).getAttribute("aria-expanded")).toBe(
      "false",
    );
  });

  it("прокрутка страницы закрывает список, прокрутка внутри списка нет", () => {
    render(<Select options={OPTIONS} />);
    const list = openList();
    fireEvent.scroll(list);
    expect(screen.getByRole("listbox")).toBeTruthy();
    fireEvent.scroll(document);
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("если снизу нет места, список открывается вверх", () => {
    const original = HTMLElement.prototype.getBoundingClientRect;
    const offset = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetHeight");
    HTMLElement.prototype.getBoundingClientRect = function () {
      return {
        top: 700,
        bottom: 730,
        left: 10,
        right: 250,
        width: 240,
        height: 30,
        x: 10,
        y: 700,
      } as DOMRect;
    };
    Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
      configurable: true,
      value: 200,
    });
    try {
      render(<Select options={OPTIONS} />);
      const list = openList();
      expect(list.parentElement?.parentElement?.getAttribute("data-side")).toBe("top");
    } finally {
      HTMLElement.prototype.getBoundingClientRect = original;
      if (offset) Object.defineProperty(HTMLElement.prototype, "offsetHeight", offset);
    }
  });

  it("disabled не даёт открыть список", () => {
    render(<Select options={OPTIONS} disabled />);
    fireEvent.click(trigger());
    expect(screen.queryByRole("listbox")).toBeNull();
    expect((trigger() as HTMLButtonElement).disabled).toBe(true);
  });

  it("подпись связана с кнопкой, значение входит в имя", () => {
    render(<Select options={OPTIONS} label="Статус" defaultValue="ok" />);
    expect(screen.getByRole("button", { name: "Статус Сверено" })).toBeTruthy();
  });

  it("ошибка: data-invalid и aria-describedby на текст", () => {
    render(<Select options={OPTIONS} error="Выберите статус" />);
    expect(trigger().hasAttribute("data-invalid")).toBe(true);
    expect(trigger().getAttribute("aria-describedby")).toBe(screen.getByText("Выберите статус").id);
  });

  it("variant=control рисует компактную кнопку с подписью и значением", () => {
    render(
      <Select options={OPTIONS} variant="control" controlLabel="Сортировка" defaultValue="ok" />,
    );
    expect(trigger().className).toBe("ds-select__control");
    expect(trigger().textContent).toBe("Сортировка: Сверено");
  });

  it("name добавляет скрытое поле формы со значением", () => {
    const { container } = render(<Select options={OPTIONS} name="status" defaultValue="err" />);
    const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement;
    expect(hidden.name).toBe("status");
    expect(hidden.value).toBe("err");
  });

  it("управляемое open: onOpenChange получает причину", () => {
    const onOpenChange = vi.fn();
    render(<Select options={OPTIONS} open={false} onOpenChange={onOpenChange} />);
    fireEvent.click(trigger());
    expect(onOpenChange).toHaveBeenCalledWith(true, "trigger");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("defaultOpen открывает список сразу и не уводит фокус", () => {
    render(<Select options={OPTIONS} defaultOpen />);
    expect(screen.getByRole("listbox")).toBeTruthy();
    expect(document.activeElement).toBe(document.body);
  });

  it("className и ref относятся к кнопке, fieldClassName к обёртке", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Select
        options={OPTIONS}
        ref={ref}
        className="custom"
        fieldClassName="wrap"
        data-testid="t"
      />,
    );
    expect(ref.current).toBe(trigger());
    expect(trigger().classList.contains("custom")).toBe(true);
    expect(trigger().closest(".ds-select__field")?.classList.contains("wrap")).toBe(true);
  });

  it("сам по себе не ставит data-force", () => {
    render(<Select options={OPTIONS} defaultOpen />);
    expect(document.querySelector("[data-force]")).toBeNull();
  });
});

describe("Select с поиском", () => {
  it("при открытии фокус в поле поиска, список вне Tab", () => {
    render(<Select options={OPTIONS} searchable />);
    const list = openList();
    expect(document.activeElement).toBe(search());
    expect(list.tabIndex).toBe(-1);
    expect(search().getAttribute("aria-controls")).toBe(list.id);
    expect(search().getAttribute("aria-autocomplete")).toBe("list");
  });

  it("ввод фильтрует пункты без учёта регистра и подсвечивает совпадение", () => {
    render(<Select options={OPTIONS} searchable />);
    openList();
    fireEvent.change(search(), { target: { value: "РАСХ" } });
    expect(optionLabels()).toEqual(["Расхождение"]);
    expect(document.querySelector("mark")?.textContent).toBe("Расх");
  });

  it("первый найденный пункт становится активным, стрелки идут по найденным", () => {
    render(<Select options={OPTIONS} searchable />);
    openList();
    fireEvent.change(search(), { target: { value: "о" } });
    const first = activeOf(search());
    expect(first).toBe("Сверено");
    fireEvent.keyDown(search(), { key: "ArrowDown" });
    expect(activeOf(search())).toBe("Расхождение");
  });

  it("пустой результат объявляется через status, Enter ничего не выбирает", () => {
    const onValueChange = vi.fn();
    render(<Select options={OPTIONS} searchable onValueChange={onValueChange} />);
    openList();
    fireEvent.change(search(), { target: { value: "ззз" } });
    expect(screen.getByRole("status").textContent).toBe("Ничего не нашлось");
    fireEvent.keyDown(search(), { key: "Enter" });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("Enter выбирает активный найденный пункт, поиск очищается при следующем открытии", () => {
    const onValueChange = vi.fn();
    render(<Select options={OPTIONS} searchable onValueChange={onValueChange} />);
    openList();
    fireEvent.change(search(), { target: { value: "ждём" } });
    fireEvent.keyDown(search(), { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith("wait");
    openList();
    expect((search() as HTMLInputElement).value).toBe("");
    expect(optionLabels()).toHaveLength(4);
  });

  it("выбранный ранее пункт остаётся с галочкой в полном списке", () => {
    render(<Select options={OPTIONS} searchable defaultValue="ok" />);
    openList();
    expect(screen.getByRole("option", { name: /Сверено/ }).querySelector("svg")).toBeTruthy();
  });
});
