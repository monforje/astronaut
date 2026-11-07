/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { WeekAgenda, type AgendaEvent } from "./index";

const NOW = new Date(2026, 10, 12, 10, 15);
const at = (day: number, hh: number, mm = 0) => new Date(2026, 10, day, hh, mm);

const EVENTS: AgendaEvent[] = [
  {
    id: "c",
    start: at(12, 15, 30),
    end: at(12, 16),
    title: "Звонок с брокером",
    who: "Алексей Крылов",
    tone: "orange",
  },
  {
    id: "a",
    start: at(12, 9),
    end: at(12, 9, 30),
    title: "Сверка по Дальснабу",
    who: "Оформление",
  },
  { id: "b", start: at(12, 11), end: at(12, 12), title: "Приёмка MSC Aurora", tone: "info" },
  { id: "d", start: at(10, 12), end: at(10, 13), title: "Выгрузка контейнеров" },
];

const days = () =>
  screen.getAllByRole("button").filter((b) => b.classList.contains("ds-agenda__day"));
const titles = () =>
  Array.from(document.querySelectorAll(".ds-agenda__tx b")).map((b) => b.textContent);

describe("WeekAgenda: неделя", () => {
  it("семь дней с понедельника, неделя берётся из любой даты", () => {
    render(<WeekAgenda events={[]} week={at(12, 0)} now={NOW} />);
    expect(days()).toHaveLength(7);
    expect(days()[0].textContent).toContain("Пн");
    expect(days()[0].textContent).toContain("9");
    expect(days()[6].textContent).toContain("Вс");
    expect(days()[6].textContent).toContain("15");
  });

  it("по умолчанию неделя и выбор — по now, сегодня помечено", () => {
    render(<WeekAgenda events={EVENTS} now={NOW} />);
    const today = days()[3];
    expect(today.getAttribute("aria-pressed")).toBe("true");
    expect(today.hasAttribute("data-today")).toBe(true);
    expect(today.getAttribute("aria-label")).toBe("Чт, 12 ноября, событий: 3, сегодня");
    expect(days()[0].getAttribute("aria-pressed")).toBe("false");
  });

  it("точки по числу событий, у пустого дня подпись «событий нет»", () => {
    render(<WeekAgenda events={EVENTS} now={NOW} />);
    expect(days()[3].querySelectorAll(".ds-agenda__dots u")).toHaveLength(3);
    expect(days()[1].getAttribute("aria-label")).toContain("событий: 1");
    expect(days()[2].getAttribute("aria-label")).toContain("событий нет");
  });

  it("подпись секции, ref и className", () => {
    const ref = createRef<HTMLElement>();
    render(<WeekAgenda ref={ref} events={[]} now={NOW} label="Повестка" className="own" />);
    expect(screen.getByRole("region", { name: "Повестка" })).toBe(ref.current);
    expect(ref.current?.classList.contains("own")).toBe(true);
    expect(ref.current?.querySelector("[data-force]")).toBeNull();
  });
});

describe("WeekAgenda: список дня", () => {
  it("события отсортированы по началу, у каждого время и длительность", () => {
    render(<WeekAgenda events={EVENTS} now={NOW} />);
    expect(titles()).toEqual(["Сверка по Дальснабу", "Приёмка MSC Aurora", "Звонок с брокером"]);
    expect(screen.getByText("60 мин")).toBeTruthy();
    expect(screen.getAllByText("30 мин")).toHaveLength(2);
  });

  it("метка «Сейчас» стоит перед первым будущим событием", () => {
    render(<WeekAgenda events={EVENTS} now={NOW} />);
    const list = document.querySelector(".ds-agenda__list") as HTMLElement;
    const children = Array.from(list.children);
    expect(children[1].textContent).toBe("Сейчас 10:15");
    expect(children[2].textContent).toContain("Приёмка MSC Aurora");
  });

  it("если все события прошли, метка стоит в конце; в другие дни её нет", () => {
    const { rerender } = render(<WeekAgenda events={EVENTS} now={at(12, 18)} />);
    const list = document.querySelector(".ds-agenda__list") as HTMLElement;
    expect(list.lastElementChild?.textContent).toBe("Сейчас 18:00");
    rerender(<WeekAgenda events={EVENTS} now={NOW} value={at(10, 0)} />);
    expect(screen.queryByText(/Сейчас/)).toBeNull();
  });

  it("день без событий — «Свободный день»", () => {
    render(<WeekAgenda events={EVENTS} now={NOW} defaultValue={at(11, 0)} />);
    expect(screen.getByText("Свободный день")).toBeTruthy();
    expect(screen.getByText("Ср, 11 ноября — событий нет")).toBeTruthy();
  });

  it("клик по событию вызывает onEventClick с самим событием", () => {
    const onEventClick = vi.fn();
    render(<WeekAgenda events={EVENTS} now={NOW} onEventClick={onEventClick} />);
    fireEvent.click(screen.getByText("Приёмка MSC Aurora"));
    expect(onEventClick).toHaveBeenCalledWith(EVENTS[2]);
  });
});

describe("WeekAgenda: выбор дня", () => {
  it("клик по дню переключает список и сообщает onChange", () => {
    const onChange = vi.fn();
    render(<WeekAgenda events={EVENTS} now={NOW} onChange={onChange} />);
    fireEvent.click(days()[1]);
    expect(titles()).toEqual(["Выгрузка контейнеров"]);
    expect(days()[1].getAttribute("aria-pressed")).toBe("true");
    expect(days()[3].getAttribute("aria-pressed")).toBe("false");
    const picked = onChange.mock.calls[0][0] as Date;
    expect([picked.getDate(), picked.getHours()]).toEqual([10, 0]);
  });

  it("value управляет выбором: без нового пропса день не переключается", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <WeekAgenda events={EVENTS} now={NOW} value={at(12, 0)} onChange={onChange} />,
    );
    fireEvent.click(days()[1]);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(days()[3].getAttribute("aria-pressed")).toBe("true");
    rerender(<WeekAgenda events={EVENTS} now={NOW} value={at(10, 0)} onChange={onChange} />);
    expect(days()[1].getAttribute("aria-pressed")).toBe("true");
  });

  it("dayData и eventData добавляют атрибуты", () => {
    render(
      <WeekAgenda
        events={EVENTS}
        now={NOW}
        dayData={(d) => (d.getDate() === 13 ? { "data-mark": "d" } : undefined)}
        eventData={(e) => (e.id === "b" ? { "data-mark": "e" } : undefined)}
      />,
    );
    expect(days()[4].getAttribute("data-mark")).toBe("d");
    expect(
      screen.getByText("Приёмка MSC Aurora").closest("button")?.getAttribute("data-mark"),
    ).toBe("e");
  });
});

describe("WeekAgenda: состояния", () => {
  it("loading: aria-busy, заглушки, дни без точек", () => {
    const { container } = render(<WeekAgenda events={EVENTS} now={NOW} loading />);
    expect(screen.getByRole("region").getAttribute("aria-busy")).toBe("true");
    expect(container.querySelectorAll(".ds-agenda__skel")).toHaveLength(2);
    expect(container.querySelector(".ds-agenda__dots u")).toBeNull();
    expect(days()[0].hasAttribute("data-loading")).toBe(true);
  });

  it("error: alert с причиной, список событий не показывается", () => {
    render(<WeekAgenda events={EVENTS} now={NOW} error errorText="Нет связи" />);
    expect(screen.getByRole("alert").textContent).toContain("Нет связи");
    expect(titles()).toEqual([]);
  });
});
