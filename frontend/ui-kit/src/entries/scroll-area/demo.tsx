/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ReactNode } from "react";
import { ScrollArea } from "./index";
import "./scroll-area.force.css";

export type ScrollDir = "v" | "h" | "b";
export type ScrollForce = "hover" | "focus";

const ROWS = [
  ["MSKU4821907", "ООО «Дальснаб»", "Сверено"],
  ["TCLU7712045", "АО «Приморье-Опт»", "Ждём"],
  ["CMAU3390218", "ООО «Порт-Трейд»", "Расхождение"],
  ["ONEU5521390", "ИП Кравец", "В пути"],
  ["MSCU9981204", "ООО «Восток-Карго»", "Сверено"],
  ["EGHU4410972", "ООО «Дальснаб»", "Ждём"],
  ["COSU8820143", "АО «Приморье-Опт»", "Сверено"],
  ["HLXU1203985", "ООО «Порт-Трейд»", "В пути"],
  ["TGHU6609317", "ИП Кравец", "Сверено"],
  ["APZU3341025", "ООО «Восток-Карго»", "Черновик"],
  ["SEGU2218406", "ООО «Дальснаб»", "Сверено"],
  ["BMOU9034612", "АО «Приморье-Опт»", "Ждём"],
];
const CHIPS = [
  "Все",
  "С расхождениями",
  "Ждут документов",
  "Черновики",
  "Архив",
  "Мои",
  "Срочные",
  "Нинбо",
  "Шанхай",
  "Циндао",
  "Далянь",
  "Владивосток",
];

export function Rows({ count = ROWS.length }: { count?: number }) {
  return (
    <div className="ds-scroll__rows">
      {ROWS.slice(0, count).map(([id, client, st]) => (
        <div key={id}>
          <span className="ds-scroll__tx">
            <b>{id}</b>
            <small>{client}</small>
          </span>
          <em>{st}</em>
        </div>
      ))}
    </div>
  );
}

export function Chips() {
  return (
    <div className="ds-scroll__chips">
      {CHIPS.map((c, i) => (
        <button key={c} type="button" className="ds-scroll__chip" aria-pressed={i === 0}>
          {c}
        </button>
      ))}
    </div>
  );
}

export function WideTable() {
  return (
    <table className="ds-scroll__table">
      <thead>
        <tr>
          {["Контейнер", "Клиент", "Судно", "Порт", "Вес", "Статус"].map((h) => (
            <th key={h}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {ROWS.slice(0, 10).map(([id, client, st], i) => (
          <tr key={id}>
            <td>{id}</td>
            <td>{client}</td>
            <td>MSC Aurora</td>
            <td>Владивосток</td>
            <td>{(18420 - i * 310).toLocaleString("ru-RU")}</td>
            <td>{st}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function DemoScrollArea({
  dir = "v",
  height = 200,
  start = "top",
  force,
  children,
  label = "Список грузов",
}: {
  dir?: ScrollDir;
  height?: number;
  start?: "top" | "mid" | "end";
  force?: ScrollForce;
  children?: ReactNode;
  label?: string;
}) {
  return (
    <ScrollArea
      direction={dir === "h" ? "horizontal" : dir === "b" ? "both" : "vertical"}
      maxHeight={height}
      initialScroll={start === "mid" ? "middle" : start}
      aria-label={label}
      data-force={force}
    >
      {children ?? (dir === "h" ? <Chips /> : dir === "b" ? <WideTable /> : <Rows />)}
    </ScrollArea>
  );
}
