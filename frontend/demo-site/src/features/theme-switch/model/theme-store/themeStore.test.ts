import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { THEME_KEY, initTheme, resolveTheme, useThemeStore } from "./themeStore";

function systemPrefers(dark: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches: dark })),
  );
}

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
  systemPrefers(false);
});

afterEach(() => vi.unstubAllGlobals());

describe("themeStore", () => {
  it("без выбора берёт системную тему", () => {
    systemPrefers(true);
    expect(resolveTheme()).toBe("dark");
    systemPrefers(false);
    expect(resolveTheme()).toBe("light");
  });

  it("запомненная тема важнее системной", () => {
    systemPrefers(true);
    localStorage.setItem(THEME_KEY, "light");
    expect(resolveTheme()).toBe("light");
  });

  it("мусор в хранилище игнорирует", () => {
    localStorage.setItem(THEME_KEY, "purple");
    expect(resolveTheme()).toBe("light");
  });

  it("переключение ставит data-theme на html и запоминает выбор", () => {
    useThemeStore.setState({ theme: "light" });
    useThemeStore.getState().toggleTheme();

    expect(useThemeStore.getState().theme).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem(THEME_KEY)).toBe("dark");

    useThemeStore.getState().toggleTheme();
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("initTheme применяет текущую тему, не записывая её в хранилище", () => {
    useThemeStore.setState({ theme: "dark" });
    initTheme();
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem(THEME_KEY)).toBeNull();
  });

  it("скрипт в index.html читает тот же ключ, что стор", () => {
    const html = readFileSync(join(import.meta.dirname, "../../../../../index.html"), "utf8");
    expect(html).toContain(`localStorage.getItem("${THEME_KEY}")`);
  });
});
