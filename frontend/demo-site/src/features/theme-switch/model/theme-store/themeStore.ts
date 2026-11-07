import { create } from "zustand";
import { readStorage, writeStorage } from "@/shared/lib";

/** Ключ запомненной темы. Тот же читает скрипт в index.html: он ставит тему до первой отрисовки, без вспышки. */
export const THEME_KEY = "astronaut:theme";

export type Theme = "light" | "dark";

const isTheme = (value: unknown): value is Theme => value === "light" || value === "dark";

/** Запомненная тема, а если выбора ещё не было — системная (`prefers-color-scheme`). */
export function resolveTheme(): Theme {
  const stored = readStorage(THEME_KEY);
  if (isTheme(stored)) return stored;
  return typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/** Тему кита задаёт атрибут `data-theme` на `<html>`: `tokens.css` кита переопределяет роли под него. */
function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: resolveTheme(),
  setTheme: (theme) => {
    applyTheme(theme);
    writeStorage(THEME_KEY, theme);
    set({ theme });
  },
  toggleTheme: () => get().setTheme(get().theme === "dark" ? "light" : "dark"),
}));

/** Применяет тему к `<html>` до первого рендера (`main.tsx`); выбор пользователя не перезаписывает. */
export function initTheme() {
  applyTheme(useThemeStore.getState().theme);
}
