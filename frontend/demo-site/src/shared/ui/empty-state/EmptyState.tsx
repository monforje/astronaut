import type { ReactNode } from "react";
import { cn } from "@/shared/lib";
import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  title: string;
  text?: ReactNode;
  action?: ReactNode;
  compact?: boolean;
}

/** Пустое состояние страницы или блока: заголовок, пояснение и действие. */
export function EmptyState({ title, text, action, compact }: EmptyStateProps) {
  return (
    <div className={cn(styles.state, compact && styles.compact)}>
      <h2 className={styles.title}>{title}</h2>
      {text && <p className={styles.text}>{text}</p>}
      {action}
    </div>
  );
}
