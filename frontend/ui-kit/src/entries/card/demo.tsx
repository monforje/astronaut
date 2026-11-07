/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/engine/Icon";
import { DemoButton } from "../button/demo";
import type { DeltaTone } from "../chart";
import {
  Card,
  CardBar,
  CardFooter,
  CardHeader,
  KpiCard as KitKpiCard,
  type CardTone,
  type CardVariant,
} from "./index";
import "./card.force.css";

export type { CardTone, CardVariant } from "./index";
export type CardForce = "hover" | "active" | "focus";

export function DemoCard({
  variant,
  size,
  flush,
  link,
  selected,
  disabled,
  kpi,
  tone,
  force,
  label,
  children,
  className,
}: {
  variant?: CardVariant;
  size?: "sm";
  flush?: boolean;
  link?: boolean;
  selected?: boolean;
  disabled?: boolean;
  kpi?: boolean;
  tone?: CardTone;
  force?: CardForce;
  label?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card
      variant={variant}
      size={size}
      flush={flush}
      interactive={link}
      selected={selected}
      disabled={disabled}
      kpi={kpi}
      tone={tone}
      aria-label={label}
      className={className}
      data-force={force}
    >
      {children}
    </Card>
  );
}

export function CardHead({
  icon,
  muted,
  action,
  children,
}: {
  icon?: IconName;
  muted?: boolean;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <CardHeader icon={icon ? <Icon name={icon} /> : undefined} muted={muted} action={action}>
      {children}
    </CardHeader>
  );
}

export function CardFoot({ two, children }: { two?: boolean; children: ReactNode }) {
  return <CardFooter two={two}>{children}</CardFooter>;
}

export function CardH({ sub, children }: { sub?: string; children: ReactNode }) {
  return <CardBar sub={sub}>{children}</CardBar>;
}

export function KpiCard({
  icon,
  label,
  value,
  delta,
  deltaTone = "good",
  deltaDir = "up",
  data,
  sparkColor = "teal",
  note,
  tone,
  force,
}: {
  icon: IconName;
  label: string;
  value: string;
  delta: string;
  deltaTone?: DeltaTone;
  deltaDir?: "up" | "down";
  data: number[];
  sparkColor?: "teal" | "danger" | "orange";
  note: string;
  tone?: CardTone;
  force?: CardForce;
}) {
  return (
    <KitKpiCard
      icon={<Icon name={icon} />}
      label={label}
      value={value}
      delta={delta}
      deltaTone={deltaTone}
      deltaDir={deltaDir}
      data={data}
      sparkColor={sparkColor}
      note={note}
      tone={tone}
      data-force={force}
    />
  );
}

export function TwoButtonCard({ force }: { force?: "hover" | "active" | "focus" }) {
  return (
    <DemoCard size="sm" tone="err">
      <CardHead icon="warn">Расхождение по весу</CardHead>
      <div className="ds-card__muted">Вес в декларации меньше веса по накладной на 180 кг.</div>
      <CardFoot two>
        <DemoButton variant="primary" size="sm" force={force}>
          Исправить
        </DemoButton>
        <DemoButton variant="outline" size="sm">
          Позже
        </DemoButton>
      </CardFoot>
    </DemoCard>
  );
}
