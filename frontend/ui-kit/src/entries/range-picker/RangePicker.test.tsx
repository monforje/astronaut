/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { RangePicker } from "./index";

const TODAY = new Date(2026, 10, 12);
const at = (n: number, month = 10) => new Date(2026, month, n);

const trigger = () =>
  document.querySelector<HTMLButtonElement>(".ds-rangepicker__trigger") as HTMLButtonElement;

function popDay(n: number, month = 10): HTMLButtonElement {
  const el = screen
    .getByRole("dialog")
    .querySelector<HTMLButtonElement>(`[data-d="${at(n, month).getTime()}"]`);
  if (!el) throw new Error(`нет дня ${n}`);
  return el;
}

const apply = () => screen.getByRole("button", { name: "Применить" }) as HTMLButtonElement;

describe("RangePicker: рендер", () => {
  it("без значения показывает шаблон, со значением — период", () => {
    const { rerender } = render(<RangePicker today={TODAY} />);
    expect(trigger().textContent).toContain("Выберите период");
    expect(trigger().getAttribute("aria-label")).toBe("Период: не выбран");
    expect(trigger().getAttribute("aria-haspopup")).toBe("dialog");
    rerender(<RangePicker today={TODAY} value={[at(6), at(12)]} />);
    expect(trigger().textContent).toContain("6 ноября – 12 ноября 2026");
    expect(trigger().getAttribute("aria-label")).toBe("Период: 6 ноября – 12 ноября 2026");
  });

  it("подпись, подсказка и ошибка", () => {
    const { rerender } = render(
      <RangePicker today={TODAY} label="Рейсы" hint="Не больше 90 дней" />,
    );
    expect(screen.getByText("Рейсы")).toBeTruthy();
    expect(screen.getByText("Не больше 90 дней")).toBeTruthy();
    rerender(<RangePicker today={TODAY} label="Рейсы" error="Период длиннее 90 дней" />);
    expect(screen.getByRole("alert").textContent).toBe("Период длиннее 90 дней");
    expect(trigger().hasAttribute("data-invalid")).toBe(true);
  });

  it("disabled, loading, ref и атрибуты", () => {
    const ref = createRef<HTMLButtonElement>();
    const { container, rerender } = render(
      <RangePicker ref={ref} today={TODAY} disabled data-testid="rp" fieldClassName="own" />,
    );
    expect(ref.current).toBe(trigger());
    expect(trigger().disabled).toBe(true);
    expect(trigger().getAttribute("data-testid")).toBe("rp");
    expect(container.firstElementChild?.classList.contains("own")).toBe(true);
    expect(container.querySelector("[data-force]")).toBeNull();
    rerender(<RangePicker today={TODAY} loading />);
    expect(trigger().getAttribute("aria-busy")).toBe("true");
    expect(container.querySelector(".ds-rangepicker__skel")).not.toBeNull();
  });
});

describe("RangePicker: выбор периода", () => {
  it("клик открывает панель, aria-expanded обновляется, быстрых периодов по умолчанию нет", () => {
    render(<RangePicker today={TODAY} />);
    fireEvent.click(trigger());
    expect(screen.getByRole("dialog", { name: "Период" })).toBeTruthy();
    expect(trigger().getAttribute("aria-expanded")).toBe("true");
    expect(screen.queryByRole("group", { name: "Быстрый выбор" })).toBeNull();
  });

  it("по клику фокус уходит в календарь, а при defaultOpen фокус не отбирается", () => {
    const { unmount } = render(<RangePicker today={TODAY} />);
    fireEvent.click(trigger());
    expect(document.activeElement?.classList.contains("ds-cal__d")).toBe(true);
    unmount();
    render(<RangePicker today={TODAY} defaultOpen />);
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(document.activeElement).toBe(document.body);
  });

  it("«Применить» неактивна до конца периода, подпись просит выбрать конец", () => {
    render(<RangePicker today={TODAY} />);
    fireEvent.click(trigger());
    expect(apply().disabled).toBe(true);
    fireEvent.click(popDay(16));
    expect(apply().disabled).toBe(true);
    expect(screen.getByText("Выберите конец периода")).toBeTruthy();
    fireEvent.mouseEnter(popDay(19));
    expect(screen.getByText("16 ноября – 19 ноября")).toBeTruthy();
    fireEvent.click(popDay(19));
    expect(apply().disabled).toBe(false);
    expect(screen.getByText("16 ноября – 19 ноября 2026 · 4 дн.")).toBeTruthy();
  });

  it("«Применить» записывает период, закрывает панель и возвращает фокус на кнопку", () => {
    const onChange = vi.fn();
    render(<RangePicker today={TODAY} onChange={onChange} />);
    fireEvent.click(trigger());
    fireEvent.click(popDay(20));
    fireEvent.click(popDay(14));
    fireEvent.click(apply());
    const [from, to] = onChange.mock.calls[0][0] as [Date, Date];
    expect([from.getDate(), to.getDate()]).toEqual([14, 20]);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(trigger().textContent).toContain("14 ноября – 20 ноября 2026");
    expect(document.activeElement).toBe(trigger());
  });

  it("«Отмена» и Escape отбрасывают черновик", () => {
    const onChange = vi.fn();
    render(<RangePicker today={TODAY} defaultValue={[at(6), at(12)]} onChange={onChange} />);
    fireEvent.click(trigger());
    fireEvent.click(popDay(20));
    fireEvent.click(screen.getByRole("button", { name: "Отмена" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(trigger());
    fireEvent.click(popDay(25));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
    expect(trigger().textContent).toContain("6 ноября – 12 ноября 2026");
  });

  it("при повторном открытии черновик начинается со значения", () => {
    render(<RangePicker today={TODAY} defaultValue={[at(6), at(12)]} />);
    fireEvent.click(trigger());
    expect(popDay(6).dataset.sel).toBe("start");
    expect(popDay(12).dataset.sel).toBe("end");
    expect(popDay(9).dataset.in).toBe("true");
  });

  it("клик снаружи закрывает панель", () => {
    render(
      <div>
        <RangePicker today={TODAY} />
        <button type="button">снаружи</button>
      </div>,
    );
    fireEvent.click(trigger());
    fireEvent.mouseDown(screen.getByRole("button", { name: "снаружи" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("недоступные по min/max дни не выбираются", () => {
    render(<RangePicker today={TODAY} min={at(10)} max={at(20)} />);
    fireEvent.click(trigger());
    fireEvent.click(popDay(5));
    expect(screen.getByText("Выберите конец периода")).toBeTruthy();
    expect(popDay(5).dataset.sel).toBeUndefined();
  });
});

describe("RangePicker: быстрые периоды", () => {
  it("presets показывает пять готовых периодов от today", () => {
    render(<RangePicker today={TODAY} presets />);
    fireEvent.click(trigger());
    const group = screen.getByRole("group", { name: "Быстрый выбор" });
    expect(group.querySelectorAll("button")).toHaveLength(5);
    expect(screen.getByRole("button", { name: "Последние 7 дней" })).toBeTruthy();
  });

  it("клик по периоду заполняет черновик, кнопка нажата, «Применить» записывает", () => {
    const onChange = vi.fn();
    render(<RangePicker today={TODAY} presets onChange={onChange} />);
    fireEvent.click(trigger());
    const preset = screen.getByRole("button", { name: "Последние 7 дней" });
    fireEvent.click(preset);
    expect(preset.getAttribute("aria-pressed")).toBe("true");
    expect(apply().disabled).toBe(false);
    fireEvent.click(apply());
    const [from, to] = onChange.mock.calls[0][0] as [Date, Date];
    expect([from.getDate(), to.getDate()]).toEqual([6, 12]);
  });

  it("свой список периодов", () => {
    render(
      <RangePicker
        today={TODAY}
        presets={[{ label: "Неделя вперёд", range: (t) => [t, new Date(2026, 10, 19)] }]}
      />,
    );
    fireEvent.click(trigger());
    fireEvent.click(screen.getByRole("button", { name: "Неделя вперёд" }));
    expect(screen.getByText("12 ноября – 19 ноября 2026 · 8 дн.")).toBeTruthy();
  });

  it("клик по ручному выбору снимает нажатость периода", () => {
    render(<RangePicker today={TODAY} presets />);
    fireEvent.click(trigger());
    const preset = screen.getByRole("button", { name: "Сегодня" });
    fireEvent.click(preset);
    expect(preset.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(popDay(20));
    expect(preset.getAttribute("aria-pressed")).toBe("false");
  });
});

describe("RangePicker: контролируемость", () => {
  it("value обновляет кнопку, onChange не меняет её без нового пропса", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <RangePicker today={TODAY} value={[at(6), at(12)]} onChange={onChange} />,
    );
    fireEvent.click(trigger());
    fireEvent.click(popDay(20));
    fireEvent.click(popDay(25));
    fireEvent.click(apply());
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(trigger().textContent).toContain("6 ноября – 12 ноября 2026");
    rerender(<RangePicker today={TODAY} value={[at(20), at(25)]} onChange={onChange} />);
    expect(trigger().textContent).toContain("20 ноября – 25 ноября 2026");
  });

  it("open управляет панелью снаружи", () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <RangePicker today={TODAY} open={false} onOpenChange={onOpenChange} />,
    );
    fireEvent.click(trigger());
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole("dialog")).toBeNull();
    rerender(<RangePicker today={TODAY} open onOpenChange={onOpenChange} />);
    expect(screen.getByRole("dialog")).toBeTruthy();
  });
});
