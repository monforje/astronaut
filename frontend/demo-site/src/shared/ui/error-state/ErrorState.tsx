import { Alert, Button } from "@astronaut/ui-kit";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

/** Ошибка загрузки плашкой рядом с блоком: понятное сообщение и «Повторить». Объявляется скринридеру (`role="alert"`). */
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <Alert
      tone="err"
      layout="stacked"
      title="Не удалось загрузить"
      hint={message}
      actions={
        onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry}>
            Повторить
          </Button>
        )
      }
    />
  );
}
