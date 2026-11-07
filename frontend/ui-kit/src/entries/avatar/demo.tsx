/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ReactNode } from "react";
import { Avatar, type AvatarProps } from "./index";
import "./avatar.force.css";

export type { AvatarKind, AvatarSize } from "./index";
export type { AvatarPresence as Presence } from "./index";
export { initials, toneOf as tone } from "./Avatar";

export interface DemoAvatarProps extends Omit<AvatarProps, "ref"> {
  label?: string;
  tip?: boolean;
}

export function DemoAvatar({ name = "Ирина Петрова", label, tip, ...rest }: DemoAvatarProps) {
  const avatar = <Avatar {...rest} name={name} aria-label={label} />;
  if (!tip) return avatar;
  return (
    <span className="ds-avatar-anchor">
      {avatar}
      <span className="ds-avatar-tip">{name}</span>
    </span>
  );
}

export function DemoAvatarGroup({ children }: { children: ReactNode }) {
  return (
    <span className="ds-avatar-group" role="group" aria-label="Участники">
      {children}
    </span>
  );
}
