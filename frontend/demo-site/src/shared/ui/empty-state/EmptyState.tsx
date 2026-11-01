import type { ReactNode } from "react";
import { Stack, Text, Title } from "@mantine/core";
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
    <Stack align="center" gap="sm" className={cn(styles.state, compact && styles.compact)}>
      <Title order={2} size="h3">
        {title}
      </Title>
      {text && (
        <Text c="dimmed" className={styles.text}>
          {text}
        </Text>
      )}
      {action}
    </Stack>
  );
}
