import { DEMO_URL } from "@/shared/config";
import { renderAstro } from "@/shared/lib/test-utils";
import DemoButton from "./DemoButton.astro";

const text = (el: Element | null | undefined) => el?.textContent?.replace(/\s+/g, " ").trim();

describe("DemoButton", () => {
  it("открывает чат в Telegram с набранным сообщением", async () => {
    const doc = await renderAstro(DemoButton);
    const link = doc.querySelector("a");
    expect(text(link)).toBe("Записаться на демо");
    expect(link?.getAttribute("href")).toBe(DEMO_URL);
  });

  it("магнит — только у главной (оранжевой) кнопки", async () => {
    const primary = await renderAstro(DemoButton);
    const secondary = await renderAstro(DemoButton, {
      props: { variant: "secondary", size: "md" },
    });
    expect(primary.querySelector("a")?.hasAttribute("data-magnet")).toBe(true);
    expect(secondary.querySelector("a")?.hasAttribute("data-magnet")).toBe(false);
  });
});
