/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useState } from "react";
import { TimeField, TimePanel, TimePicker } from "./TimePicker";
import "./time-picker.force.css";

export const STEP = 5;
export const NOW = { h: 10, m: 40 };

type FieldForce = "hover" | "focus";

export function DemoTimeField({
  h = 9,
  m = 30,
  label = "С",
  open,
  force,
  segFocus,
  invalid,
  disabled,
  loading,
  empty,
  error,
  onChange,
  onIcon,
}: {
  h?: number;
  m?: number;
  label?: string;
  open?: boolean;
  force?: FieldForce;
  segFocus?: "h" | "m";
  invalid?: boolean;
  disabled?: boolean;
  loading?: boolean;
  empty?: boolean;
  error?: string;
  onChange?: (h: number, m: number) => void;
  onIcon?: () => void;
}) {
  return (
    <TimeField
      label={label}
      error={error}
      value={empty ? null : { h, m }}
      step={STEP}
      invalid={invalid}
      disabled={disabled}
      loading={loading}
      open={open}
      boxProps={{ "data-force": force }}
      hoursProps={{ "data-force": segFocus === "h" ? "focus" : undefined }}
      minutesProps={{ "data-force": segFocus === "m" ? "focus" : undefined }}
      onValueChange={(t) => onChange?.(t.h, t.m)}
      onIconClick={onIcon}
    />
  );
}

export function DemoTimePanel({
  h,
  m,
  hoverH,
  hoverM,
  nowForce,
  onPick,
  onNow,
  onDone,
  isStatic,
}: {
  h: number;
  m: number;
  hoverH?: number;
  hoverM?: number;
  nowForce?: "hover";
  onPick?: (kind: "h" | "m", v: number) => void;
  onNow?: () => void;
  onDone?: () => void;
  isStatic?: boolean;
}) {
  return (
    <TimePanel
      value={{ h, m }}
      step={STEP}
      inline={isStatic}
      itemData={(kind, v) => ({
        "data-force": (kind === "h" ? hoverH : hoverM) === v ? "hover" : undefined,
      })}
      nowProps={{ "data-force": nowForce }}
      onPick={onPick}
      onNow={onNow}
      onDone={onDone}
    />
  );
}

export function TerminalWindowExample() {
  const [from, setFrom] = useState("09:00");
  const [to, setTo] = useState("19:00");
  return (
    <div className="ds-timepicker__pair">
      <TimePicker label="С" value={from} onChange={setFrom} step={5} />
      <TimePicker label="До" value={to} onChange={setTo} step={5} />
    </div>
  );
}

export function DemoTimePicker({
  label = "С",
  defaultOpen = false,
}: {
  label?: string;
  defaultOpen?: boolean;
}) {
  return (
    <TimePicker
      label={label}
      defaultValue="09:30"
      step={STEP}
      now={new Date(2026, 10, 12, NOW.h, NOW.m)}
      defaultOpen={defaultOpen}
      style={{ minHeight: defaultOpen ? 360 : undefined }}
    />
  );
}
