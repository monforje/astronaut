import { Component, type ReactNode } from "react";
import { Button } from "@astronaut/ui-kit";
import { EmptyState } from "@/shared/ui";

type State = { error: Error | null };

/** Последний рубеж: непойманная ошибка рендера вместо белого экрана. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert">
        <EmptyState
          title="Что-то пошло не так"
          text="Страница не смогла показаться. Обновите её — обычно этого достаточно."
          action={<Button onClick={() => location.reload()}>Обновить страницу</Button>}
        />
      </div>
    );
  }
}
