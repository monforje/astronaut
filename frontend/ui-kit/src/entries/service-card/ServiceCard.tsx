/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { CSSProperties, ReactNode } from "react";
import { cx, Icon } from "../../ui/internal";
import { Badge, type BadgeTone } from "../badge";
import { Card, type CardProps } from "../card";
import { Progress } from "../progress";
import { Spinner } from "../spinner";
import { Switch } from "../switch";
import "./service-card.css";

export type ServiceStatus = "ok" | "syncing" | "err" | "off" | "unset";

export interface ServiceBrand {
  color: string;
  onColor?: string;
  shape?: string;
  glyph?: string;
  icon?: ReactNode;
}

export interface ServiceMetric {
  label: string;
  value: string;
}

export interface ServiceCardProps extends Omit<CardProps, "children" | "as" | "flush" | "title"> {
  name: string;
  category?: string;
  status: ServiceStatus;
  brand: ServiceBrand;
  lastSync?: string;
  metrics?: ServiceMetric[];
  activity?: number[];
  activityErrorFrom?: number;
  capabilities?: string[];
  error?: string;
  progress?: number;
  enabled?: boolean;
  onEnabledChange?: (enabled: boolean) => void;
  actions?: ReactNode;
  statusLabels?: Partial<Record<ServiceStatus, string>>;
}

const BADGE: Record<
  ServiceStatus,
  { tone: Extract<BadgeTone, "ok" | "info" | "err" | "idle">; text: string }
> = {
  ok: { tone: "ok", text: "Работает" },
  syncing: { tone: "info", text: "Синхронизация" },
  err: { tone: "err", text: "Ошибка" },
  off: { tone: "idle", text: "Выключено" },
  unset: { tone: "idle", text: "Не настроено" },
};

const NONE: ServiceMetric[] = [];
const NONE_NUMBERS: number[] = [];
const NONE_TEXT: string[] = [];

export function ServiceCard({
  name,
  category,
  status,
  brand,
  lastSync,
  metrics = NONE,
  activity = NONE_NUMBERS,
  activityErrorFrom,
  capabilities = NONE_TEXT,
  error,
  progress,
  enabled,
  onEnabledChange,
  actions,
  statusLabels,
  className,
  style,
  ...rest
}: ServiceCardProps) {
  const badge = BADGE[status];
  const statusText = statusLabels?.[status] ?? badge.text;
  const live = status !== "off" && status !== "unset";
  const dormant = !live;
  const note = status === "unset" ? "нет ключа доступа" : lastSync;
  const meta = [category, note].filter(Boolean).join(" · ");
  const vars = {
    "--ds-svc-c": brand.color,
    "--ds-svc-on": brand.onColor ?? "white",
    "--ds-svc-shape": brand.shape ?? "16px",
    ...style,
  } as CSSProperties;
  return (
    <Card
      {...rest}
      as="article"
      flush
      className={cx("ds-svc", `ds-svc--${status}`, className)}
      style={vars}
      aria-label={rest["aria-label"] ?? `${name}: ${statusText}`}
    >
      <div className="ds-svc__band">
        <span className="ds-svc__status">
          <Badge tone={badge.tone} form={status === "syncing" ? "plain" : "dot"}>
            {status === "syncing" ? <Spinner size="xs" /> : null}
            {statusText}
          </Badge>
        </span>
      </div>
      <div className="ds-svc__body">
        <div className="ds-svc__head">
          <span className="ds-svc__tile" aria-hidden="true">
            {brand.glyph ?? brand.icon ?? null}
          </span>
          <span className="ds-svc__nm">
            <b>{name}</b>
            {meta ? <small>{meta}</small> : null}
          </span>
          <Switch
            className="ds-svc__sw"
            checked={enabled ?? live}
            readOnly={!onEnabledChange}
            onCheckedChange={onEnabledChange}
            aria-label={name}
          />
        </div>
        {status === "err" && error ? (
          <div className="ds-svc__err" role="alert">
            <Icon name="alert" size="sm" />
            <span>{error}</span>
          </div>
        ) : null}
        {status === "syncing" ? (
          <div>
            <Progress
              bare
              size="sm"
              className="ds-svc__sync"
              label="Синхронизация"
              value={progress}
              indeterminate={progress === undefined}
            />
            <div className="ds-svc__cap">
              <span>Загружаем данные…</span>
              {progress === undefined ? null : <span>{progress}%</span>}
            </div>
          </div>
        ) : null}
        {metrics.length > 0 ? (
          <div className="ds-svc__metrics">
            {metrics.map((m) => (
              <div key={m.label}>
                <small>{m.label}</small>
                <b>{m.value}</b>
              </div>
            ))}
          </div>
        ) : null}
        {activity.length > 0 ? (
          <div>
            <div className="ds-svc__bars" role="img" aria-label="Активность за 24 часа">
              {activity.map((h, i) => (
                <i
                  key={`${i}-${h}`}
                  className={
                    dormant
                      ? "ds-svc__bar--z"
                      : status === "err" &&
                          activityErrorFrom !== undefined &&
                          i >= activityErrorFrom
                        ? "ds-svc__bar--e"
                        : undefined
                  }
                  style={{ height: `${dormant ? 8 : h}%` }}
                />
              ))}
            </div>
            <div className="ds-svc__cap">
              <span>24 ч назад</span>
              <span>сейчас</span>
            </div>
          </div>
        ) : null}
        {capabilities.length > 0 ? (
          <div className="ds-svc__caps">
            {capabilities.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
        ) : null}
        {actions ? <div className="ds-card__foot ds-card__foot--two">{actions}</div> : null}
      </div>
    </Card>
  );
}
