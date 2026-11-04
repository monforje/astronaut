import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  text?: ReactNode;
  action?: ReactNode;
}

/** Пустое состояние страницы или блока: заголовок, пояснение и действие. */
export function EmptyState({ title, text, action }: EmptyStateProps) {
  return (
    <div>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}
