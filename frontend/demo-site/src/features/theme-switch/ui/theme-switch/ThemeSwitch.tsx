import { Icon, TopbarAction } from "@astronaut/ui-kit";
import { useThemeStore } from "../../model/theme-store";

/** Кнопка топбара: светлая и тёмная темы. Подпись называет действие, а не состояние. */
export function ThemeSwitch() {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const dark = theme === "dark";

  return (
    <TopbarAction
      label={dark ? "Включить светлую тему" : "Включить тёмную тему"}
      icon={<Icon name={dark ? "sun" : "moon"} />}
      onClick={toggleTheme}
    />
  );
}
