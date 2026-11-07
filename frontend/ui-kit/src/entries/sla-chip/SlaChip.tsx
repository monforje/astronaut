/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useState, type ComponentPropsWithRef, type KeyboardEvent } from "react";
import { cx, Icon, useStableId } from "../../ui/internal";
import { Badge, type BadgeTone } from "../badge";
import { Skeleton } from "../skeleton";
import "./sla-chip.css";

export type SlaChipSize = "md" | "sm";

export interface SlaChipProps extends Omit<ComponentPropsWithRef<"button">, "children"> {
  minutes?: number | null;
  deadline?: string;
  paused?: boolean;
  loading?: boolean;
  error?: boolean;
  size?: SlaChipSize;
  label?: string;
  warnBelow?: number;
}

const pad2 = (n: number) => String(n).padStart(2, "0");

export function slaText(minutes: number): string {
  const abs = Math.abs(minutes);
  const d = Math.floor(abs / 1440);
  const h = Math.floor((abs % 1440) / 60);
  const m = abs % 60;
  const body = d > 0 ? `${d} д ${h} ч` : h > 0 ? `${h} ч ${pad2(m)} м` : `${m} м`;
  return minutes < 0 ? `−${body}` : body;
}

export function slaTone(minutes: number, warnBelow = 120): BadgeTone {
  return minutes <= 0 ? "err" : minutes < warnBelow ? "warn" : "ok";
}

export function SlaChip({
  minutes,
  deadline,
  paused,
  loading,
  error,
  size = "md",
  label,
  warnBelow = 120,
  className,
  onKeyDown,
  onMouseEnter,
  onBlur,
  ...rest
}: SlaChipProps) {
  const tipId = useStableId();
  const [dismissed, setDismissed] = useState(false);
  const badgeSize = size === "sm" ? "sm" : undefined;

  if (loading) {
    return (
      <span
        className="ds-sla__skel"
        data-anim="pulse"
        role="status"
        aria-busy="true"
        aria-label="Срок загружается"
      >
        <Skeleton width={size === "sm" ? 52 : 64} height={size === "sm" ? 16 : 20} />
      </span>
    );
  }
  if (error) {
    return (
      <Badge tone="idle" form="plain" size={badgeSize} icon={<Icon name="alert" />}>
        Нет срока
      </Badge>
    );
  }
  if (minutes == null && !paused) {
    return (
      <span className="ds-sla__none" role="img" aria-label="Срока нет">
        —
      </span>
    );
  }

  const left = minutes ?? 0;
  const tone: BadgeTone = paused ? "idle" : slaTone(left, warnBelow);
  const text = paused ? "Пауза" : slaText(left);
  const spoken = paused
    ? "SLA на паузе"
    : left < 0
      ? `SLA просрочен на ${slaText(-left)}`
      : `До срока SLA осталось ${slaText(left)}`;
  const hint = paused ? "Ждём ответа клиента" : left < 0 ? "Срок прошёл" : "Осталось до срока";

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);
    if (event.key === "Escape") setDismissed(true);
  };

  return (
    <button
      type="button"
      aria-describedby={deadline ? tipId : undefined}
      {...rest}
      className={cx("ds-sla", className)}
      data-dismissed={dismissed || undefined}
      onKeyDown={handleKeyDown}
      onMouseEnter={(event) => {
        onMouseEnter?.(event);
        setDismissed(false);
      }}
      onBlur={(event) => {
        onBlur?.(event);
        setDismissed(false);
      }}
    >
      <span className="ds-sla__sr">{spoken}</span>
      <span className="ds-sla__badge" aria-hidden="true">
        <Badge tone={tone} form="plain" size={badgeSize} icon={<Icon name="clock" />}>
          {label ? `${label} ${text}` : text}
        </Badge>
      </span>
      {deadline ? (
        <span id={tipId} className="ds-sla__tip" role="tooltip">
          Срок: {deadline}
          <small>{hint}</small>
        </span>
      ) : null}
    </button>
  );
}
