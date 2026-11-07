/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { DatePicker } from "./index";

const TODAY = new Date(2026, 10, 12);
const at = (n: number, month = 10) => new Date(2026, month, n);

const input = () => screen.getByRole("textbox") as HTMLInputElement;

function popDay(n: number, month = 10): HTMLButtonElement {
  const el = screen
    .getByRole("dialog")
    .querySelector<HTMLButtonElement>(`[data-d="${at(n, month).getTime()}"]`);
  if (!el) throw new Error(`нет дня ${n}`);
  return el;
}

describe("DatePicker: рендер", () => {
  it("рисует подпись, подсказку и пустое поле с шаблоном", () => {
    render(<DatePicker label="Дата прибытия" hint="Можно вписать: 14.11.2026" today={TODAY} />);
    expect(screen.getByText("Дата прибытия")).toBeTruthy();
    expect(screen.getByText("Можно вписать: 14.11.2026")).toBeTruthy();
    expect(input().value).toBe("");
    expect(input().placeholder).toBe("дд.мм.гггг");
    expect(input().getAttribute("aria-label")).toBe("Дата прибытия");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.queryByRole("button", { name: "Очистить" })).toBeNull();
  });

  it("defaultValue показывается в формате дд.мм.гггг, появляется кнопка очистки", () => {
    render(<DatePicker today={TODAY} defaultValue={at(14)} />);
    expect(input().value).toBe("14.11.2026");
    expect(screen.getByRole("button", { name: "Очистить" })).toBeTruthy();
  });

  it("ref идёт на input, className — на поле, атрибуты — на input", () => {
    const ref = createRef<HTMLInputElement>();
    const { container } = render(
      <DatePicker ref={ref} fieldClassName="own" name="arrival" data-testid="d" today={TODAY} />,
    );
    expect(ref.current).toBe(input());
    expect(container.firstElementChild?.classList.contains("own")).toBe(true);
    expect(input().name).toBe("arrival");
    expect(input().getAttribute("data-testid")).toBe("d");
    expect(container.querySelector("[data-force]")).toBeNull();
  });

  it("disabled блокирует поле и иконку", () => {
    render(<DatePicker today={TODAY} defaultValue={at(14)} disabled />);
    expect(input().disabled).toBe(true);
    expect(
      (screen.getByRole("button", { name: "Открыть календарь" }) as HTMLButtonElement).disabled,
    ).toBe(true);
    expect(screen.queryByRole("button", { name: "Очистить" })).toBeNull();
  });

  it("loading заменяет поле скелетоном", () => {
    const { container } = render(<DatePicker today={TODAY} loading />);
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(container.querySelector(".ds-datepicker__skel")).not.toBeNull();
  });
});

describe("DatePicker: панель", () => {
  it("фокус в поле открывает календарь на месяце значения", () => {
    render(<DatePicker today={TODAY} defaultValue={new Date(2026, 11, 3)} />);
    fireEvent.focus(input());
    expect(screen.getByRole("dialog", { name: "Выбор даты" })).toBeTruthy();
    expect(screen.getByText("Декабрь 2026")).toBeTruthy();
  });

  it("иконка переключает панель и aria-expanded", () => {
    render(<DatePicker today={TODAY} />);
    const lead = screen.getByRole("button", { name: "Открыть календарь" });
    expect(lead.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(lead);
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(lead.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(lead);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("выбор дня пишет дату, закрывает панель и вызывает onChange", () => {
    const onChange = vi.fn();
    render(<DatePicker today={TODAY} onChange={onChange} />);
    fireEvent.focus(input());
    fireEvent.click(popDay(18));
    expect(input().value).toBe("18.11.2026");
    expect((onChange.mock.calls[0][0] as Date).getDate()).toBe(18);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("Escape закрывает панель, клик снаружи тоже", () => {
    render(
      <div>
        <DatePicker today={TODAY} />
        <button type="button">снаружи</button>
      </div>,
    );
    fireEvent.focus(input());
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.focus(input());
    fireEvent.mouseDown(screen.getByRole("button", { name: "снаружи" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("кнопки «Сегодня» и «Очистить»", () => {
    const onChange = vi.fn();
    render(<DatePicker today={TODAY} defaultValue={at(20)} onChange={onChange} />);
    fireEvent.focus(input());
    fireEvent.click(screen.getByRole("button", { name: "Сегодня" }));
    expect(input().value).toBe("12.11.2026");
    fireEvent.focus(input());
    fireEvent.click(screen.getByText("Очистить"));
    expect(input().value).toBe("");
    expect(onChange.mock.calls.map((c) => (c[0] as Date | null)?.getDate() ?? null)).toEqual([
      12,
      null,
    ]);
  });

  it("«Сегодня» недоступна, если сегодня вне границ", () => {
    render(<DatePicker today={TODAY} min={at(15)} />);
    fireEvent.focus(input());
    expect((screen.getByRole("button", { name: "Сегодня" }) as HTMLButtonElement).disabled).toBe(
      true,
    );
  });

  it("стрелка вниз переводит фокус в календарь", () => {
    render(<DatePicker today={TODAY} />);
    fireEvent.focus(input());
    fireEvent.keyDown(input(), { key: "ArrowDown" });
    expect(document.activeElement?.classList.contains("ds-cal__d")).toBe(true);
  });

  it("недоступные по min дни в панели не выбираются", () => {
    const onChange = vi.fn();
    render(<DatePicker today={TODAY} min={TODAY} onChange={onChange} />);
    fireEvent.focus(input());
    fireEvent.click(popDay(5));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeTruthy();
  });
});

describe("DatePicker: ввод руками", () => {
  it("Enter разбирает дату, записывает её и закрывает панель", () => {
    const onChange = vi.fn();
    render(<DatePicker today={TODAY} onChange={onChange} />);
    fireEvent.focus(input());
    fireEvent.change(input(), { target: { value: "17.11.2026" } });
    fireEvent.keyDown(input(), { key: "Enter" });
    expect((onChange.mock.calls[0][0] as Date).getDate()).toBe(17);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(input().getAttribute("aria-invalid")).toBeNull();
  });

  it("уход из поля тоже записывает дату и нормализует запись", () => {
    const onChange = vi.fn();
    render(<DatePicker today={TODAY} onChange={onChange} />);
    fireEvent.change(input(), { target: { value: "4.12.2026" } });
    fireEvent.blur(input());
    expect(input().value).toBe("04.12.2026");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("неверный формат даёт ошибку с aria-invalid и role=alert", () => {
    const onChange = vi.fn();
    render(<DatePicker today={TODAY} onChange={onChange} />);
    fireEvent.change(input(), { target: { value: "31.02.2026" } });
    fireEvent.blur(input());
    expect(screen.getByRole("alert").textContent).toBe("Формат: дд.мм.гггг");
    expect(input().getAttribute("aria-invalid")).toBe("true");
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.change(input(), { target: { value: "1" } });
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("дата раньше min отклоняется с причиной", () => {
    render(<DatePicker today={TODAY} min={TODAY} />);
    fireEvent.change(input(), { target: { value: "09.11.2026" } });
    fireEvent.blur(input());
    expect(screen.getByRole("alert").textContent).toBe("Дата раньше сегодняшней");
  });

  it("дата позже max отклоняется с причиной", () => {
    render(<DatePicker today={TODAY} max={at(20)} />);
    fireEvent.change(input(), { target: { value: "25.11.2026" } });
    fireEvent.blur(input());
    expect(screen.getByRole("alert").textContent).toBe("Дата позже 20.11.2026");
  });

  it("пустая строка очищает значение", () => {
    const onChange = vi.fn();
    render(<DatePicker today={TODAY} defaultValue={at(14)} onChange={onChange} />);
    fireEvent.change(input(), { target: { value: "" } });
    fireEvent.blur(input());
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("внешняя error показывается вместо подсказки", () => {
    render(<DatePicker today={TODAY} hint="Подсказка" error="Нужна дата" />);
    expect(screen.queryByText("Подсказка")).toBeNull();
    expect(screen.getByRole("alert").textContent).toBe("Нужна дата");
    expect(input().getAttribute("aria-invalid")).toBe("true");
    expect(input().getAttribute("aria-describedby")).toContain("-error");
  });
});

describe("DatePicker: контролируемость", () => {
  it("value управляет полем: обновление пропса меняет текст", () => {
    const { rerender } = render(<DatePicker today={TODAY} value={at(14)} />);
    expect(input().value).toBe("14.11.2026");
    rerender(<DatePicker today={TODAY} value={at(20)} />);
    expect(input().value).toBe("20.11.2026");
    rerender(<DatePicker today={TODAY} value={null} />);
    expect(input().value).toBe("");
  });

  it("при value без обновления пропса клик по дню лишь сообщает onChange", () => {
    const onChange = vi.fn();
    render(<DatePicker today={TODAY} value={at(14)} onChange={onChange} />);
    fireEvent.focus(input());
    fireEvent.click(popDay(18));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("open и onOpenChange управляют панелью снаружи", () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <DatePicker today={TODAY} open={false} onOpenChange={onOpenChange} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Открыть календарь" }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole("dialog")).toBeNull();
    rerender(<DatePicker today={TODAY} open onOpenChange={onOpenChange} />);
    expect(screen.getByRole("dialog")).toBeTruthy();
  });
});

describe("DatePicker: плавающая панель", () => {
  it("панель выносится в body и ставится position: fixed", () => {
    const { container } = render(<DatePicker today={TODAY} />);
    fireEvent.focus(input());
    const pop = screen.getByRole("dialog");
    expect(container.contains(pop)).toBe(false);
    expect(pop.parentElement).toBe(document.body);
    expect(pop.style.position).toBe("fixed");
  });

  it("клик мимо закрывает панель, клик по панели нет", () => {
    render(<DatePicker today={TODAY} />);
    fireEvent.focus(input());
    fireEvent.mouseDown(screen.getByRole("dialog"));
    expect(screen.queryByRole("dialog")).not.toBeNull();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("Esc закрывает панель, фокус остаётся на поле", () => {
    render(<DatePicker today={TODAY} />);
    act(() => input().focus());
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(input());
  });

  it("уход фокуса за панель и поле закрывает панель", () => {
    render(
      <>
        <DatePicker today={TODAY} />
        <button type="button">Другое</button>
      </>,
    );
    act(() => input().focus());
    expect(screen.queryByRole("dialog")).not.toBeNull();
    act(() => screen.getByRole("button", { name: "Другое" }).focus());
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("Tab с последнего элемента поля уходит в панель, Shift+Tab из неё возвращает", () => {
    render(<DatePicker today={TODAY} defaultValue={at(14)} />);
    act(() => input().focus());
    const clear = screen.getAllByRole("button", { name: "Очистить" })[0];
    act(() => clear.focus());
    fireEvent.keyDown(clear, { key: "Tab" });
    const pop = screen.getByRole("dialog");
    expect(pop.contains(document.activeElement)).toBe(true);
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(clear);
  });
});
