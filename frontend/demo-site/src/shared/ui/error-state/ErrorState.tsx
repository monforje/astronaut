import { EmptyState } from "../empty-state";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

/** Ошибка загрузки: понятное сообщение и повтор; объявляется скринридеру (`role="alert"`). */
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div role="alert">
      <EmptyState
        title="Не удалось загрузить"
        text={message}
        action={
          onRetry && (
            <button type="button" onClick={onRetry}>
              Повторить
            </button>
          )
        }
      />
    </div>
  );
}
