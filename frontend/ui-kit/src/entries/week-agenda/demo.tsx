/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { TODAY, addD } from "../calendar/demo";
import {
  WeekAgenda,
  WeekAgendaDay,
  WeekAgendaEvent,
  type AgendaEvent,
  type AgendaTone,
} from "./WeekAgenda";
import "./week-agenda.force.css";

interface DemoEvent {
  from: string;
  to: string;
  title: string;
  who: string;
  tone: AgendaTone;
}

export const WEEK_EVENTS: DemoEvent[][] = [
  [{ from: "10:00", to: "10:30", title: "Планёрка", who: "Все", tone: "gray" }],
  [
    { from: "12:00", to: "13:00", title: "Выгрузка контейнеров", who: "Терминал", tone: "info" },
    { from: "14:00", to: "14:30", title: "Сверка деклараций", who: "Оформление", tone: "teal" },
  ],
  [],
  [
    { from: "09:00", to: "09:30", title: "Сверка по Дальснабу", who: "Оформление", tone: "teal" },
    { from: "11:00", to: "12:00", title: "Приёмка MSC Aurora", who: "Терминал", tone: "info" },
    {
      from: "15:30",
      to: "16:00",
      title: "Звонок с брокером",
      who: "Алексей Крылов",
      tone: "orange",
    },
  ],
  [
    { from: "09:30", to: "10:30", title: "Отчёт за неделю", who: "Руководитель", tone: "teal" },
    { from: "16:00", to: "17:00", title: "Таможенный досмотр", who: "Порт", tone: "orange" },
  ],
  [],
  [],
];

export const MONDAY = addD(TODAY, -((TODAY.getDay() + 6) % 7));
export const NOW = new Date(2026, 10, 12, 10, 15);
export const NOW_MIN = 10 * 60 + 15;

const at = (day: number, time: string) =>
  new Date(
    MONDAY.getFullYear(),
    MONDAY.getMonth(),
    MONDAY.getDate() + day,
    +time.slice(0, 2),
    +time.slice(3),
  );

const toEvents = (week: DemoEvent[][]): AgendaEvent[] =>
  week.flatMap((day, i) =>
    day.map((e) => ({
      id: `${i}-${e.from}`,
      start: at(i, e.from),
      end: at(i, e.to),
      title: e.title,
      who: e.who,
      tone: e.tone,
    })),
  );

type Force = "hover" | "active" | "focus";

export function DemoWeekAgenda({
  sel = 3,
  events = WEEK_EVENTS,
  state = "ready",
  dayForce,
  evForce,
  onSel,
}: {
  sel?: number;
  events?: DemoEvent[][];
  state?: "ready" | "loading" | "error";
  dayForce?: { index: number; force: Force };
  evForce?: { index: number; force: "hover" | "focus" };
  onSel?: (i: number) => void;
}) {
  const flat = toEvents(events);
  const forced = evForce ? `${sel}-${events[sel]?.[evForce.index]?.from}` : null;
  return (
    <WeekAgenda
      events={flat}
      week={MONDAY}
      now={NOW}
      value={addD(MONDAY, sel)}
      loading={state === "loading"}
      error={state === "error"}
      onChange={(d) => onSel?.((d.getDay() + 6) % 7)}
      dayData={(d) => ({
        "data-force": dayForce?.index === (d.getDay() + 6) % 7 ? dayForce.force : undefined,
      })}
      eventData={(e) => ({ "data-force": e.id === forced ? evForce?.force : undefined })}
    />
  );
}

export function DemoWeekAgendaLive() {
  return (
    <WeekAgenda
      events={toEvents(WEEK_EVENTS)}
      week={MONDAY}
      now={NOW}
      defaultValue={addD(MONDAY, 3)}
    />
  );
}

export function DemoAgendaEvent({
  force,
  index = 1,
  day = 3,
}: {
  force?: "hover" | "focus";
  index?: number;
  day?: number;
}) {
  const event = toEvents(WEEK_EVENTS).filter((e) => e.id.startsWith(`${day}-`))[index];
  return (
    <div style={{ width: 300 }}>
      <WeekAgendaEvent event={event} data-force={force} />
    </div>
  );
}

export function DemoAgendaDay({
  i = 3,
  pressed,
  force,
  empty,
}: {
  i?: number;
  pressed?: boolean;
  force?: Force;
  empty?: boolean;
}) {
  const date = addD(MONDAY, i);
  return (
    <WeekAgendaDay
      date={date}
      count={empty ? 0 : WEEK_EVENTS[i].length}
      today={i === 3}
      selected={pressed}
      style={{ width: 56 }}
      data-force={force}
    />
  );
}
