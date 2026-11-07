import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useThemeStore } from "../../model/theme-store";
import { ThemeSwitch } from "./ThemeSwitch";

beforeEach(() => {
  localStorage.clear();
  useThemeStore.setState({ theme: "light" });
});

describe("ThemeSwitch", () => {
  it("переключает тему на html, меняет подпись и запоминает выбор", async () => {
    render(<ThemeSwitch />);

    await userEvent.click(screen.getByRole("button", { name: "Включить тёмную тему" }));
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("astronaut:theme")).toBe("dark");

    await userEvent.click(screen.getByRole("button", { name: "Включить светлую тему" }));
    expect(document.documentElement.dataset.theme).toBe("light");
  });
});
