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
            <button type="button" className="button button-outline" onClick={onRetry}>
              Повторить
            </button>
          )
        }
      />
    </div>
  );
}
