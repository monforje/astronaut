/**
 * Единственное место, где код приложения трогает `localStorage` (проверяет `codestyle.test.ts`).
 * Хранилище может быть недоступно (приватное окно, запрет сайта): тогда чтение даёт `null`, запись молча
 * пропускается, а приложение работает без запоминания.
 */
export function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    return;
  }
}
