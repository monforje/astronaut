/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Icon } from "@/engine/Icon";
import type { ReactNode } from "react";
import {
  Progress,
  ProgressButton,
  ProgressCircle,
  ProgressSegments,
  type ProgressSize,
  type ProgressTone,
} from "./index";
import "./progress.force.css";

export type { ProgressSize, ProgressTone } from "./index";
export type Force = "hover" | "active" | "focus";

export function DemoProgress({
  value = 0,
  label,
  valueText,
  tone = "primary",
  size = "md",
  mode,
}: {
  value?: number;
  label: string;
  valueText?: string;
  tone?: ProgressTone;
  size?: ProgressSize;
  mode?: "ind" | "str";
}) {
  return (
    <Progress
      value={value}
      label={label}
      valueText={valueText}
      tone={tone}
      size={size}
      indeterminate={mode === "ind"}
      striped={mode === "str"}
    />
  );
}

export function DemoProgressCircle({
  value,
  label,
  tone = "primary",
}: {
  value: number;
  label: string;
  tone?: "primary" | "info" | "warn";
}) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <ProgressCircle value={value} label={label} tone={tone} />
      <span style={{ display: "grid" }}>
        <b style={{ fontWeight: 600 }}>{label}</b>
        <small style={{ color: "var(--text-3)" }}>{value}% выполнено</small>
      </span>
    </span>
  );
}

export function DemoSegments({
  total,
  on,
  err,
  label,
}: {
  total: number;
  on: number;
  err?: number;
  label: string;
}) {
  return <ProgressSegments total={total} value={on} error={err} label={label} />;
}

export function DemoFile({
  name,
  ext,
  value,
  status,
}: {
  name: string;
  ext: string;
  value: number;
  status?: "ok" | "err";
}) {
  const st = status === "ok" ? "Готово" : status === "err" ? "Ошибка" : `${Math.round(value)}%`;
  return (
    <div className="ds-progress-file" data-status={status}>
      <span className="ds-progress-file__ext">{ext}</span>
      <span className="ds-progress-file__name">{name}</span>
      <span className="ds-progress-file__st">
        {status ? <Icon name={status === "ok" ? "ok" : "alert"} size="sm" /> : null}
        {st}
      </span>
      <Progress
        bare
        size="sm"
        tone={status === "err" ? "err" : "primary"}
        label={name}
        value={status === "err" ? 100 : value}
        valueText={st}
      />
    </div>
  );
}

export function DemoProgressButton({
  value = 0,
  status,
  force,
  children,
}: {
  value?: number;
  status?: "running" | "done" | "err";
  force?: Force;
  children?: ReactNode;
}) {
  const running = status === "running";
  const label =
    children ??
    (running
      ? `Сверяем · ${Math.round(value)}%`
      : status === "done"
        ? "Сверено"
        : status === "err"
          ? "Ошибка, повторить"
          : "Сверить документы");
  return (
    <ProgressButton
      value={value}
      status={status}
      data-force={force}
      aria-label={running ? `Сверка, ${Math.round(value)} %` : undefined}
    >
      {status === "done" ? <Icon name="ok" size="sm" /> : null}
      {label}
    </ProgressButton>
  );
}
