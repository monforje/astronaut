/**
 * Запуск мок-бэкенда в браузере. Service worker перехватывает `fetch` к `/api/v1`, поэтому
 * сгенерированный клиент, `customFetch` и TanStack Query работают как с настоящим бэкендом.
 * Воркер `/mockServiceWorker.js` отдаёт плагин `msw/vite` (vite.config.ts).
 */
import { setupWorker } from "msw/browser";
import { db } from "./db";
import { handlers } from "./handlers";

declare global {
  interface Window {
    /** Ручное управление данными демо из консоли: `mockDb.reset()`. */
    mockDb?: typeof db;
  }
}

export async function startMockApi() {
  window.mockDb = db;
  await setupWorker(...handlers).start({
    // Всё, что не API (модули Vite, шрифты, картинки), идёт в сеть как обычно.
    onUnhandledFrame: "bypass",
    quiet: true,
  });
}
