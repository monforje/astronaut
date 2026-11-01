import { Button } from "@mantine/core";
import { EmptyState } from "../empty-state";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  compact?: boolean;
}

/** Ошибка загрузки: понятное сообщение и повтор; объявляется скринридеру (`role="alert"`). */
export function ErrorState({ message, onRetry, compact }: ErrorStateProps) {
  return (
    <div role="alert">
      <EmptyState
        title="Не удалось загрузить"
        text={message}
        compact={compact}
        action={
          onRetry && (
            <Button variant="outline" onClick={onRetry}>
              Повторить
            </Button>
          )
        }
      />
    </div>
  );
}
