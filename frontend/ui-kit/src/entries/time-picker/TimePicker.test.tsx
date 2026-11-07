/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { fireEvent, render, screen, within } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { TimePicker } from "./index";

const hours = () => screen.getByRole("textbox", { name: "С, часы" }) as HTMLInputElement;
const minutes = () => screen.getByRole("textbox", { name: "С, минуты" }) as HTMLInputElement;
const icon = () => screen.getByRole("button", { name: "Открыть список времени" });
const NOW = new Date(2026, 10, 12, 10, 42);

describe("TimePicker: рендер", () => {
  it("пустое поле показывает шаблон ––, подпись и подсказку", () => {
    render(<TimePicker label="С" hint="Местное время" />);
    expect(screen.getByText("Местное время")).toBeTruthy();
    expect(hours().value).toBe("");
    expect(hours().placeholder).toBe("––");
    expect(minutes().value).toBe("");
    expect(screen.getByRole("group", { name: "С" })).toBeTruthy();
  });

  it("значение раскладывается по сегментам с нулями", () => {
    render(<TimePicker label="С" defaultValue="09:05" />);
    expect(hours().value).toBe("09");
    expect(minutes().value).toBe("05");
  });

  it("ref, className, атрибуты и скрытое поле формы", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <TimePicker
        ref={ref}
        label="С"
        className="own"
        data-testid="tp"
        name="from"
        defaultValue="09:30"
      />,
    );
    expect(ref.current?.classList.contains("own")).toBe(true);
    expect(ref.current?.getAttribute("data-testid")).toBe("tp");
    expect(container.querySelector<HTMLInputElement>('input[type="hidden"]')?.value).toBe("09:30");
    expect(container.querySelector("[data-force]")).toBeNull();
  });

  it("disabled блокирует сегменты и иконку, loading скрывает сегменты", () => {
    const { container, rerender } = render(<TimePicker label="С" disabled defaultValue="09:30" />);
    expect(hours().disabled).toBe(true);
    expect((icon() as HTMLButtonElement).disabled).toBe(true);
    rerender(<TimePicker label="С" loading />);
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(container.querySelector(".ds-timepicker__skel")).not.toBeNull();
  });

  it("error показывает alert и aria-invalid на сегментах", () => {
    render(<TimePicker label="С" defaultValue="08:00" error="Конец раньше начала" />);
    expect(screen.getByRole("alert").textContent).toBe("Конец раньше начала");
    expect(hours().getAttribute("aria-invalid")).toBe("true");
  });
});

describe("TimePicker: поле", () => {
  it("стрелки в часах меняют на 1 по кругу, в минутах на step", () => {
    const onChange = vi.fn();
    render(<TimePicker label="С" defaultValue="23:55" step={5} onChange={onChange} />);
    fireEvent.keyDown(hours(), { key: "ArrowUp" });
    expect(onChange).toHaveBeenLastCalledWith("00:55");
    fireEvent.keyDown(minutes(), { key: "ArrowUp" });
    expect(onChange).toHaveBeenLastCalledWith("00:00");
    fireEvent.keyDown(minutes(), { key: "ArrowDown" });
    expect(onChange).toHaveBeenLastCalledWith("00:55");
    expect(minutes().value).toBe("55");
  });

  it("шаг минут берётся из step", () => {
    const onChange = vi.fn();
    render(<TimePicker label="С" defaultValue="09:00" step={15} onChange={onChange} />);
    fireEvent.keyDown(minutes(), { key: "ArrowUp" });
    expect(onChange).toHaveBeenLastCalledWith("09:15");
  });

  it("ввод цифр в часы: значение с нулевыми минутами, число ограничивается 23", () => {
    const onChange = vi.fn();
    render(<TimePicker label="С" onChange={onChange} />);
    fireEvent.change(hours(), { target: { value: "7" } });
    expect(onChange).toHaveBeenLastCalledWith("07:00");
    fireEvent.change(hours(), { target: { value: "75" } });
    expect(onChange).toHaveBeenLastCalledWith("23:00");
    expect(hours().value).toBe("23");
  });

  it("две цифры в часах переводят фокус в минуты", () => {
    render(<TimePicker label="С" defaultValue="09:00" />);
    fireEvent.change(hours(), { target: { value: "14" } });
    expect(document.activeElement).toBe(minutes());
  });

  it("минуты ограничиваются 59, а при уходе из поля запись дополняется нулём", () => {
    const onChange = vi.fn();
    render(<TimePicker label="С" defaultValue="09:00" onChange={onChange} />);
    fireEvent.change(minutes(), { target: { value: "8" } });
    expect(onChange).toHaveBeenLastCalledWith("09:08");
    expect(minutes().value).toBe("8");
    fireEvent.blur(minutes());
    expect(minutes().value).toBe("08");
    fireEvent.change(minutes(), { target: { value: "99" } });
    expect(onChange).toHaveBeenLastCalledWith("09:59");
  });
});

describe("TimePicker: панель", () => {
  it("иконка открывает панель с 24 часами и минутами по шагу", () => {
    render(<TimePicker label="С" defaultValue="09:30" step={5} />);
    expect(icon().getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(icon());
    const dialog = screen.getByRole("dialog", { name: "Выбор времени" });
    expect(icon().getAttribute("aria-expanded")).toBe("true");
    expect(
      within(screen.getByRole("listbox", { name: "Часы" })).getAllByRole("option"),
    ).toHaveLength(24);
    expect(
      within(screen.getByRole("listbox", { name: "Минуты" })).getAllByRole("option"),
    ).toHaveLength(12);
    const picked = within(dialog).getAllByRole("option", { selected: true });
    expect(picked.map((o) => o.textContent)).toEqual(["09", "30"]);
  });

  it("по клику фокус уходит в выбранный пункт, а при defaultOpen фокус не отбирается", () => {
    const { unmount } = render(<TimePicker label="С" defaultValue="09:30" />);
    fireEvent.click(icon());
    expect(document.activeElement?.getAttribute("role")).toBe("option");
    unmount();
    render(<TimePicker label="С" defaultValue="09:30" defaultOpen />);
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(document.activeElement).toBe(document.body);
  });

  it("выбор в столбце сразу пишет значение, панель остаётся открытой", () => {
    const onChange = vi.fn();
    render(<TimePicker label="С" defaultValue="09:30" onChange={onChange} />);
    fireEvent.click(icon());
    fireEvent.click(within(screen.getByRole("listbox", { name: "Часы" })).getByText("14"));
    expect(onChange).toHaveBeenLastCalledWith("14:30");
    fireEvent.click(within(screen.getByRole("listbox", { name: "Минуты" })).getByText("45"));
    expect(onChange).toHaveBeenLastCalledWith("14:45");
    expect(hours().value).toBe("14");
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("«Готово» закрывает панель и возвращает фокус на иконку", () => {
    render(<TimePicker label="С" defaultValue="09:30" />);
    fireEvent.click(icon());
    fireEvent.click(screen.getByRole("button", { name: "Готово" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(icon());
  });

  it("«Сейчас» ставит ближайшее по шагу время и закрывает панель", () => {
    const onChange = vi.fn();
    render(<TimePicker label="С" defaultValue="09:30" now={NOW} step={5} onChange={onChange} />);
    fireEvent.click(icon());
    fireEvent.click(screen.getByRole("button", { name: "Сейчас" }));
    expect(onChange).toHaveBeenLastCalledWith("10:40");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("Escape закрывает панель, клик снаружи тоже", () => {
    render(
      <div>
        <TimePicker label="С" defaultValue="09:30" />
        <button type="button">снаружи</button>
      </div>,
    );
    fireEvent.click(icon());
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(icon());
    fireEvent.mouseDown(screen.getByRole("button", { name: "снаружи" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("стрелки в столбце двигают выбор и фокус, в табличном порядке один пункт", () => {
    const onChange = vi.fn();
    render(<TimePicker label="С" defaultValue="09:30" onChange={onChange} />);
    fireEvent.click(icon());
    const column = screen.getByRole("listbox", { name: "Часы" });
    expect(column.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
    fireEvent.keyDown(column, { key: "ArrowDown" });
    expect(onChange).toHaveBeenLastCalledWith("10:30");
    expect(document.activeElement?.textContent).toBe("10");
    fireEvent.keyDown(column, { key: "End" });
    expect(onChange).toHaveBeenLastCalledWith("23:30");
    fireEvent.keyDown(column, { key: "Home" });
    expect(onChange).toHaveBeenLastCalledWith("00:30");
  });
});

describe("TimePicker: контролируемость", () => {
  it("value управляет полем, onChange не меняет его без нового пропса", () => {
    const onChange = vi.fn();
    const { rerender } = render(<TimePicker label="С" value="09:00" onChange={onChange} />);
    fireEvent.keyDown(hours(), { key: "ArrowUp" });
    expect(onChange).toHaveBeenCalledWith("10:00");
    expect(hours().value).toBe("09");
    rerender(<TimePicker label="С" value="10:00" onChange={onChange} />);
    expect(hours().value).toBe("10");
  });

  it("open управляет панелью снаружи", () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(<TimePicker label="С" open={false} onOpenChange={onOpenChange} />);
    fireEvent.click(icon());
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole("dialog")).toBeNull();
    rerender(<TimePicker label="С" open onOpenChange={onOpenChange} />);
    expect(screen.getByRole("dialog")).toBeTruthy();
  });
});
