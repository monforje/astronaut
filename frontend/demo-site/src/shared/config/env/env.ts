/**
 * Переменные окружения Vite (только с префиксом `VITE_`, значения попадают в бандл).
 * Остальной код читает окружение только отсюда.
 */
export const env = {
  /** Origin API без хвостового `/`; пусто — тот же origin (traefik отдаёт `/api/v1` бэкенду). */
  apiBaseUrl: ((import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "").replace(/\/$/, ""),
  /**
   * Моки API в браузере (`mocks/`). Бэкенда пока нет, поэтому включены, пока явно не выключены:
   * `VITE_API_MOCK=false`.
   */
  apiMock: (import.meta.env.VITE_API_MOCK as string | undefined) !== "false",
};
