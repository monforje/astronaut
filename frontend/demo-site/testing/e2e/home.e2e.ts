import { expect, test } from "@playwright/test";

test("главная: оболочка кита, крошки вместо заголовка и ответ бэкенда по контракту", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("navigation", { name: "Навигация" }).getByText("Главная"),
  ).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(0);
  await expect(page.getByText("Версия")).toBeVisible();
});

test("тема переключается и переживает перезагрузку", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Включить (тёмную|светлую) тему/ }).click();
  const theme = await page.locator("html").getAttribute("data-theme");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme!);
});

test("неизвестный адрес — страница 404", async ({ page }) => {
  await page.goto("/missing");
  await expect(page.getByRole("heading", { name: "Страница не найдена" })).toBeVisible();
});
