import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@astronaut/ui-kit/styles.css";
import { App } from "@/app";
import { initTheme } from "@/features/theme-switch";
import { env } from "@/shared/config";

/** Бэкенда пока нет: до первого запроса поднимаем мок-бэкенд (mocks/README.md). */
async function start() {
  // До первого рендера: тему уже поставил скрипт из index.html, здесь стор с ней синхронизируется.
  initTheme();
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
