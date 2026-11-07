/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ReactNode } from "react";
import { Delta, Sparkline, type ChartColor, type DeltaTone } from "../chart";
import { Card, CardHeader, type CardProps } from "./Card";

export interface KpiCardProps extends Omit<CardProps, "children" | "kpi" | "size" | "variant"> {
  icon?: ReactNode;
  label: string;
  value: ReactNode;
  delta?: ReactNode;
  deltaTone?: DeltaTone;
  deltaDir?: "up" | "down";
  data?: number[];
  sparkColor?: ChartColor;
  note?: ReactNode;
}

export function KpiCard({
  icon,
  label,
  value,
  delta,
  deltaTone = "good",
  deltaDir,
  data,
  sparkColor = "teal",
  note,
  ...rest
}: KpiCardProps) {
  return (
    <Card {...rest} size="sm" kpi>
      <CardHeader
        icon={icon}
        muted
        action={
          delta ? (
            <Delta tone={deltaTone} dir={deltaDir}>
              {delta}
            </Delta>
          ) : undefined
        }
      >
        {label}
      </CardHeader>
      <div className="ds-card__kpi">
        <div className="ds-card__value">{value}</div>
        {data && data.length > 1 ? (
          <Sparkline data={data} color={sparkColor} label={`${label}: динамика`} />
        ) : null}
      </div>
      {note ? <div className="ds-card__muted">{note}</div> : null}
    </Card>
  );
}
