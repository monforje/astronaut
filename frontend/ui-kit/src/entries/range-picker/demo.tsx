/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useState } from "react";
import { TODAY, addD, dayKey, type CalendarViewProps } from "../calendar/demo";
import { formatRangeLabel } from "../calendar/dates";
import { DemoPop } from "../date-picker/demo";
import {
  DEFAULT_RANGE_PRESETS,
  RangePicker,
  type DatePair,
  RangePickerPanel,
  RangePickerTrigger,
} from "./RangePicker";
import "./range-picker.force.css";

export type Range = [Date, Date];

export const PRESETS: { label: string; range: () => Range }[] = DEFAULT_RANGE_PRESETS.map(
  (preset) => ({ label: preset.label, range: () => preset.range(TODAY) }),
);

export const DEFAULT_RANGE: Range = [addD(TODAY, -6), TODAY];

export function DemoRangeTrigger({
  value = DEFAULT_RANGE,
  open,
  force,
  invalid,
  disabled,
  loading,
  empty,
  onClick,
}: {
  value?: Range | null;
  open?: boolean;
  force?: "hover" | "focus";
  invalid?: boolean;
  disabled?: boolean;
  loading?: boolean;
  empty?: boolean;
  onClick?: () => void;
}) {
  const v = empty ? null : value;
  return (
    <RangePickerTrigger
      text={v ? formatRangeLabel(v[0], v[1]) : undefined}
      open={open}
      invalid={invalid}
      disabled={disabled}
      loading={loading}
      data-force={force}
      onClick={onClick}
    />
  );
}

export function DemoRangePanel({
  a,
  b,
  hover,
  view,
  presetForce,
  calendar,
}: {
  a: Date | null;
  b: Date | null;
  hover?: Date | null;
  view?: Date;
  preset?: number | null;
  presetForce?: { index: number; force: "hover" | "focus" };
  calendar?: Partial<CalendarViewProps>;
}) {
  const force = calendar?.force;
  return (
    <DemoPop isStatic>
      <RangePickerPanel
        draft={[a, b]}
        month={view ?? a ?? TODAY}
        today={TODAY}
        hover={hover}
        presets={DEFAULT_RANGE_PRESETS}
        presetData={(index) => ({
          "data-force": presetForce?.index === index ? presetForce.force : undefined,
        })}
        calendarProps={{
          events: calendar?.events,
          dayData: force ? (d) => ({ "data-force": force[dayKey(d)] }) : undefined,
        }}
      />
    </DemoPop>
  );
}

export function DemoRangePicker({ defaultOpen = false }: { defaultOpen?: boolean }) {
  return (
    <RangePicker
      label="Период"
      fieldWidth={280}
      presets
      today={TODAY}
      defaultValue={DEFAULT_RANGE}
      defaultOpen={defaultOpen}
    />
  );
}

export function ReportRangeExample() {
  const [range, setRange] = useState<DatePair | null>(DEFAULT_RANGE);
  return (
    <div className="ds-rangepicker__example">
      <RangePicker label="Период" value={range} onChange={setRange} presets today={TODAY} />
    </div>
  );
}
