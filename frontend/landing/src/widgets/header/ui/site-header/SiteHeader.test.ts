import { DEMO_URL } from "@/shared/config";
import { renderAstro } from "@/shared/lib/test-utils";
import SiteHeader from "./SiteHeader.astro";

const text = (el: Element | null | undefined) => el?.textContent?.replace(/\s+/g, " ").trim();

describe("SiteHeader", () => {
  it("меню ведёт на такты главной: путь контейнера, системы, как начать, вопросы", async () => {
    const doc = await renderAstro(SiteHeader);
    const items = [...doc.querySelectorAll("nav a")].map((a) => [text(a), a.getAttribute("href")]);
    expect(items).toEqual([
      ["Как это работает", "/#how"],
      ["Системы", "/#systems"],
      ["Как начать", "/#start"],
      ["Вопросы", "/#faq"],
    ]);
  });

  it("«Записаться на демо» открывает чат в Telegram с набранным сообщением", async () => {
    const doc = await renderAstro(SiteHeader);
    const demo = [...doc.querySelectorAll("a")].find((a) => text(a) === "Записаться на демо");
    expect(demo?.getAttribute("href")).toBe(DEMO_URL);
  });

  it("логотип ведёт на главную и подписан словом Astronaut", async () => {
    const doc = await renderAstro(SiteHeader);
    const home = doc.querySelector('a[href="/"]');
    expect(text(home)).toBe("Astronaut");
  });
});
