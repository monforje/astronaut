import { DEMO_URL } from "@/shared/config";
import { renderAstro } from "@/shared/lib/test-utils";
import Hero from "./Hero.astro";

const text = (el: Element | null | undefined) => el?.textContent?.replace(/\s+/g, " ").trim();
const link = (doc: Document, label: string) =>
  [...doc.querySelectorAll("a")].find((a) => text(a) === label);

describe("Hero", () => {
  it("заголовок первого экрана — единственный h1, секция подписана им", async () => {
    const doc = await renderAstro(Hero);
    const h1 = doc.querySelectorAll("h1");
    expect(h1).toHaveLength(1);
    expect(text(h1[0])).toBe("Документы без расхождений");
    expect(doc.querySelector("section")?.getAttribute("aria-labelledby")).toBe(h1[0]?.id);
  });

  it("«Записаться на демо» открывает чат в Telegram с набранным сообщением", async () => {
    const doc = await renderAstro(Hero);
    expect(link(doc, "Записаться на демо")?.getAttribute("href")).toBe(DEMO_URL);
  });

  it("«Как это работает» ведёт к пути контейнера", async () => {
    const doc = await renderAstro(Hero);
    expect(link(doc, "Как это работает")?.getAttribute("href")).toBe("#how");
  });
});
