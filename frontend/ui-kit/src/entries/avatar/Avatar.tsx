/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ComponentPropsWithRef } from "react";
import { cx } from "../../ui/internal";
import agentLogo from "../../ui/assets/ai-logo-1.png";
import "./avatar.css";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
export type AvatarKind = "person" | "you" | "agent" | "more" | "muted";
export type AvatarPresence = "on" | "away" | "busy" | "off";

export interface AvatarProps extends Omit<ComponentPropsWithRef<"span">, "children"> {
  name?: string;
  kind?: AvatarKind;
  size?: AvatarSize;
  square?: boolean;
  status?: AvatarPresence;
  count?: number;
  toneIndex?: number;
}

const PRESENCE_LABEL: Record<AvatarPresence, string> = {
  on: "в сети",
  away: "отошёл",
  busy: "занят",
  off: "не в сети",
};

const TONES = 6;

export function initials(name: string): string {
  const words = name
    .replace(/[«»"]/g, "")
    .split(/\s+/)
    .filter((w) => w && !/^(ООО|АО|ИП)$/i.test(w));
  return (((words[0] ?? "?")[0] ?? "?") + (words[1]?.[0] ?? "")).toUpperCase();
}

export function toneOf(name: string): number {
  return [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % TONES;
}

export function Avatar({
  name = "",
  kind = "person",
  size,
  square,
  status,
  count = 3,
  toneIndex,
  className,
  "aria-label": ariaLabel,
  ...rest
}: AvatarProps) {
  const label =
    ariaLabel ??
    (kind === "agent" ? "Агент" : kind === "more" ? `ещё ${count}` : name || undefined);
  return (
    <span
      role="img"
      {...rest}
      className={cx(
        "ds-avatar",
        size && `ds-avatar--${size}`,
        kind === "person" && `ds-avatar--tone-${toneIndex ?? toneOf(name)}`,
        kind === "you" && "ds-avatar--accent",
        kind === "agent" && "ds-avatar--ai",
        kind === "more" && "ds-avatar--more",
        kind === "muted" && "ds-avatar--muted",
        square && "ds-avatar--sqr",
        className,
      )}
      aria-label={label && status ? `${label}, ${PRESENCE_LABEL[status]}` : label}
      data-status={status}
    >
      {kind === "agent" ? (
        <img className="ds-avatar__mark" src={agentLogo} alt="" />
      ) : kind === "more" ? (
        `+${count}`
      ) : kind === "muted" ? (
        "?"
      ) : (
        <span className="ds-avatar__ini">{initials(name)}</span>
      )}
      {status ? <span className="ds-avatar__st" aria-hidden="true" /> : null}
    </span>
  );
}
