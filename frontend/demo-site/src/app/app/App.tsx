import { useState } from "react";
import { RouterProvider } from "react-router";
import { ErrorBoundary } from "../error-boundary";
import { QueryProvider } from "../query-provider";
import { createRouter } from "../routes";

/** Дерево провайдеров. ErrorBoundary снаружи всего: ловит и ошибки запросов, и роутера. */
export function App() {
  const [router] = useState(createRouter);
  return (
    <ErrorBoundary>
      <QueryProvider>
        <RouterProvider router={router} />
      </QueryProvider>
    </ErrorBoundary>
  );
}
