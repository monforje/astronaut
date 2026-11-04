import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app";
import { env } from "@/shared/config";

/** Бэкенда пока нет: до первого запроса поднимаем мок-бэкенд (mocks/README.md). */
async function start() {
  if (env.apiMock) {
    const { startMockApi } = await import("../mocks/browser");
    await startMockApi();
  }
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void start();
