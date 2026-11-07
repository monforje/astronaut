/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Fragment, type ReactNode } from "react";

export type RichText = ReactNode;

export function rich(text: string): ReactNode {
  const parts = text.split(/`([^`]+)`/);
  if (parts.length === 1) return text;
  return parts.map((p, i) =>
    i % 2 === 1 ? <code key={i}>{p}</code> : <Fragment key={i}>{p}</Fragment>,
  );
}

export function Rich({ children }: { children: RichText }) {
  return <>{typeof children === "string" ? rich(children) : children}</>;
}
