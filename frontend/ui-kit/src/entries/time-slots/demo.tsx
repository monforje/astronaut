/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useState } from "react";
import { pad2 } from "../calendar/demo";
import { TimeSlot, TimeSlots } from "./TimeSlots";
import "./time-slots.force.css";

export const TAKEN = ["10:00", "10:30", "13:00", "15:30"];
export const ALL: string[] = [];
for (let h = 9; h < 17; h++) for (const m of [0, 30]) ALL.push(`${pad2(h)}:${pad2(m)}`);

type SlotForce = "hover" | "active" | "focus";
const NO_FORCE: Record<string, SlotForce> = {};

export function DemoSlots({
  slots = ALL,
  selected = "11:30",
  taken = TAKEN,
  force = NO_FORCE,
  state = "ready",
  cols = 4,
  enter,
  label = "Время приёмки",
  onPick,
  onRetry,
}: {
  slots?: string[];
  selected?: string | null;
  taken?: string[];
  force?: Record<string, SlotForce>;
  state?: "ready" | "loading" | "empty" | "error";
  cols?: 3 | 4;
  enter?: boolean;
  label?: string;
  onPick?: (t: string) => void;
  onRetry?: () => void;
}) {
  return (
    <TimeSlots
      slots={state === "empty" ? [] : slots}
      taken={taken}
      value={selected}
      onChange={onPick}
      cols={cols}
      label={label}
      loading={state === "loading"}
      error={state === "error"}
      errorText="Терминал не ответил"
      staggered={enter}
      slotData={(time) => ({ "data-force": force[time] })}
      onRetry={onRetry}
    />
  );
}

export function DemoSlotsLive({ cols = 4 }: { cols?: 3 | 4 }) {
  const [sel, setSel] = useState<string | null>("11:30");
  return <DemoSlots selected={sel} cols={cols} onPick={setSel} />;
}

export function DemoSlot({
  time = "11:00",
  force,
  selected,
  disabled,
}: {
  time?: string;
  force?: SlotForce;
  selected?: boolean;
  disabled?: boolean;
}) {
  return (
    <TimeSlot
      time={time}
      style={{ width: 72 }}
      selected={selected}
      disabled={disabled}
      data-force={force}
    />
  );
}
