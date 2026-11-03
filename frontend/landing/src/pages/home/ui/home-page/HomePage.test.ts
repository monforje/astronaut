import { DEMO_URL } from "@/shared/config";
import { renderAstro } from "@/shared/lib/test-utils";
import HomePage from "./HomePage.astro";

const text = (el: Element | null | undefined) => el?.textContent?.replace(/\s+/g, " ").trim();

describe("HomePage", () => {
  it("на странице один h1 — заголовок первого экрана", async () => {
    const doc = await renderAstro(HomePage);
    const h1 = doc.querySelectorAll("h1");
    expect(h1).toHaveLength(1);
    expect(text(h1[0])).toBe("Документы без расхождений");
  });

  it("секции идут тактами рассказа, у каждой свой якорь из PLAN.md", async () => {
    const doc = await renderAstro(HomePage);
    expect([...doc.querySelectorAll("section")].map((s) => s.id)).toEqual([
      "top",
      "features",
      "pain",
      "why-now",
      "how",
      "agent",
      "systems",
      "honest",
      "start",
      "faq",
      "contact",
    ]);
  });

  it("каждая секция подписана своим h2, кроме первого экрана с h1", async () => {
    const doc = await renderAstro(HomePage);
    for (const section of [...doc.querySelectorAll("section")].slice(1)) {
      const title = doc.getElementById(section.getAttribute("aria-labelledby") ?? "");
      expect(title?.tagName, section.id).toBe("H2");
      expect(section.contains(title), section.id).toBe(true);
    }
  });

  it("каждый якорь ведёт на существующий id", async () => {
    const doc = await renderAstro(HomePage);
    const anchors = [...doc.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute("href"));
    expect(anchors.length).toBeGreaterThan(0);
    const missing = anchors.filter((href) => !doc.getElementById(href!.slice(1)));
    expect(missing).toEqual([]);
  });

  it("все кнопки «Записаться на демо» открывают Telegram с набранным сообщением", async () => {
    const doc = await renderAstro(HomePage);
    const demo = [...doc.querySelectorAll("a")].filter((a) => text(a) === "Записаться на демо");
    expect(demo).toHaveLength(2);
    expect(demo.map((a) => a.getAttribute("href"))).toEqual([DEMO_URL, DEMO_URL]);
  });

  it("пробелы между предложениями и строками заголовков на месте", async () => {
    // Astro сжимает HTML и выбрасывает перенос строки между текстом и тегом: без `{" "}` читалка и
    // поисковик видят «118.Узнали» и «контейнер.Десять».
    const doc = await renderAstro(HomePage);
    const blocks = "h1, h2, h3, p, li, dt, dd, summary, figcaption, div";
    const glued = [...doc.querySelectorAll(blocks)]
      .filter((el) => !el.querySelector(blocks))
      .map(text)
      .filter((line) => /[а-яёa-z0-9][.!?:;,—][А-ЯЁA-Z]/.test(line ?? ""));
    expect(glued).toEqual([]);
  });
});
