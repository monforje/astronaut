/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { SlaChip, type SlaChipSize } from "./index";
import "./sla-chip.force.css";

export { slaText, slaTone } from "./SlaChip";

export function DemoSla({
  min = 380,
  state = "ready",
  tip,
  force,
  paused,
  size,
  label,
  deadline = "сегодня, 18:00",
}: {
  min?: number;
  state?: "ready" | "loading" | "empty" | "error";
  tip?: boolean;
  force?: "focus";
  paused?: boolean;
  size?: SlaChipSize;
  label?: string;
  deadline?: string;
}) {
  return (
    <SlaChip
      minutes={state === "empty" ? null : min}
      loading={state === "loading"}
      error={state === "error"}
      paused={paused}
      size={size}
      label={label}
      deadline={deadline}
      data-force={[tip && "tip", force].filter(Boolean).join(" ") || undefined}
    />
  );
}

export function DemoSlaRow({ name, min }: { name: string; min: number }) {
  return (
    <div className="ds-sla-row">
      <b>{name}</b>
      <DemoSla min={min} />
    </div>
  );
}
