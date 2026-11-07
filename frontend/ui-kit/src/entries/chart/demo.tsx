/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ReactNode } from "react";
import { DemoBadge, type BadgeTone } from "../badge/demo";
import {
  Donut as KitDonut,
  HBar as KitHBar,
  LineChart as KitLineChart,
  type ChartSeries,
  type DonutPart,
} from "./index";
import "./chart.force.css";

export { Delta, Sparkline } from "./index";
export type { ChartColor as SeriesColor, DeltaTone } from "./index";

export const WEEKS = Array.from({ length: 12 }, (_, i) => `Н${i + 1}`);
export const SERIES: ChartSeries[] = [
  {
    name: "Все грузы",
    color: "teal",
    data: [22, 25, 24, 29, 27, 33, 31, 28, 34, 36, 33, 38],
  },
  {
    name: "С расхождениями",
    color: "orange",
    data: [4, 6, 3, 7, 5, 8, 4, 5, 6, 3, 5, 4],
  },
];

export const DONUT_PARTS: DonutPart[] = [
  { name: "Сверено", value: 67, color: "teal" },
  { name: "Ждут документов", value: 36, color: "orange" },
  { name: "Расхождения", value: 10, color: "danger" },
  { name: "Черновики", value: 15, color: "muted" },
];

export const TOP_CLIENTS: [string, number][] = [
  ["ООО «Дальснаб»", 312],
  ["АО «Приморье-Опт»", 268],
  ["ООО «Порт-Трейд»", 241],
  ["ИП Кравец", 174],
  ["ООО «Восток-Карго»", 129],
];

export function SlaChip({
  tone,
  children,
}: {
  tone: Extract<BadgeTone, "ok" | "warn" | "err">;
  children: ReactNode;
}) {
  return (
    <DemoBadge tone={tone} form="plain" icon="clock">
      {children}
    </DemoBadge>
  );
}

export function LineChart({
  labels = WEEKS,
  series = SERIES,
  hoverIndex,
  hidden,
  animate,
  empty,
  forceFocus,
  className,
}: {
  forceFocus?: boolean;
  labels?: string[];
  series?: ChartSeries[];
  hoverIndex?: number;
  hidden?: string[];
  animate?: boolean;
  empty?: boolean;
  className?: string;
}) {
  return (
    <KitLineChart
      labels={labels}
      series={series}
      label="График по неделям"
      hint="Стрелки влево и вправо переключают неделю."
      activeIndex={hoverIndex}
      hiddenSeries={hidden}
      animate={animate}
      empty={empty}
      className={className}
      data-force={forceFocus ? "focus" : undefined}
    />
  );
}

export function Donut({
  parts = DONUT_PARTS,
  total = 128,
  centerLabel = "в работе",
  active,
  animate,
  empty,
}: {
  parts?: DonutPart[];
  total?: number;
  centerLabel?: string;
  active?: number | null;
  animate?: boolean;
  empty?: boolean;
}) {
  return (
    <KitDonut
      parts={parts}
      total={total}
      centerLabel={centerLabel}
      label="Статусы"
      activeIndex={active}
      animate={animate}
      empty={empty}
    />
  );
}

export function HBar({
  rows = TOP_CLIENTS,
  grown = true,
  hover,
}: {
  rows?: [string, number][];
  grown?: boolean;
  hover?: number;
}) {
  return (
    <KitHBar
      rows={rows.map(([label, value]) => ({ label, value }))}
      grown={grown}
      data-force={hover === undefined ? undefined : `row-${hover}`}
    />
  );
}
