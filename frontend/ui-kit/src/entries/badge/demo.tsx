/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/engine/Icon";
import { Badge, type BadgeProps, type BadgeTone } from "./index";

export type { BadgeForm, BadgeTone } from "./index";

export interface DemoBadgeProps extends Omit<BadgeProps, "icon" | "ref"> {
  icon?: IconName;
}

export function DemoBadge({ icon, ...rest }: DemoBadgeProps) {
  return <Badge {...rest} icon={icon ? <Icon name={icon} /> : undefined} />;
}

export const TONE_LABEL: Record<BadgeTone, string> = {
  ok: "Сверено",
  warn: "Ждём",
  err: "Расхождение",
  info: "В пути",
  idle: "Черновик",
};

export function ToneRow({ children }: { children: (t: BadgeTone) => ReactNode }) {
  return <>{(["ok", "warn", "err", "info", "idle"] as BadgeTone[]).map((t) => children(t))}</>;
}
