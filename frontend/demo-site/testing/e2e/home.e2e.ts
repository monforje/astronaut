import { expect, test } from "@playwright/test";
import { APP_NAME } from "../../src/shared/config/app";

test("главная показывает ответ бэкенда по контракту", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: APP_NAME })).toBeVisible();
  await expect(page.getByText("Версия")).toBeVisible();
});

test("неизвестный адрес — страница 404", async ({ page }) => {
  await page.goto("/missing");
  await expect(page.getByRole("heading", { name: "Страница не найдена" })).toBeVisible();
});
