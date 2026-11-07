import { useState } from "react";
import { RouterProvider } from "react-router";
import { Toaster } from "@astronaut/ui-kit";
import { ErrorBoundary } from "../error-boundary";
import { QueryProvider } from "../query-provider";
import { createRouter } from "../routes";

/** Дерево провайдеров. ErrorBoundary снаружи всего: ловит и ошибки запросов, и роутера. Toaster один на приложение. */
export function App() {
  const [router] = useState(createRouter);
  return (
    <ErrorBoundary>
      <QueryProvider>
        <RouterProvider router={router} />
        <Toaster />
      </QueryProvider>
    </ErrorBoundary>
  );
}
