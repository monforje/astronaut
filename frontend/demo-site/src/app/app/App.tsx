import { useState } from "react";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { RouterProvider } from "react-router";
import { theme } from "@/shared/ui";
import { ErrorBoundary } from "../error-boundary";
import { QueryProvider } from "../query-provider";
import { createRouter } from "../routes";

/** Дерево провайдеров. Тема снаружи всего: экран ErrorBoundary тоже рисуется компонентами Mantine. */
export function App() {
  const [router] = useState(createRouter);
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <Notifications position="top-right" />
      <ErrorBoundary>
        <QueryProvider>
          <RouterProvider router={router} />
        </QueryProvider>
      </ErrorBoundary>
    </MantineProvider>
  );
}
