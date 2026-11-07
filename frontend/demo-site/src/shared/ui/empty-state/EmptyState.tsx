import type { ReactNode } from "react";
import { Icon, type IconName } from "@astronaut/ui-kit";
import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  title: string;
  text?: ReactNode;
  /** Одно действие: кнопка кита. Два — не нужно, пустое состояние ведёт к одному шагу. */
  action?: ReactNode;
  icon?: IconName;
}

/**
 * Пустое состояние страницы или блока по центру: значок, заголовок, пояснение и одно действие.
 * В ките отдельной записи нет (только макет в `app-shell`), поэтому это раскладка из его токенов.
 */
export function EmptyState({ title, text, action, icon = "inbox" }: EmptyStateProps) {
  return (
    <div className={styles.root}>
      <span className={styles.icon} aria-hidden="true">
        <Icon name={icon} size="xl" />
      </span>
      <h2 className={styles.title}>{title}</h2>
      {text && <p className={styles.text}>{text}</p>}
      {action}
    </div>
  );
}
