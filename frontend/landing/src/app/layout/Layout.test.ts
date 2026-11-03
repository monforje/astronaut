import { DEMO_URL } from "@/shared/config";
import { renderAstro } from "@/shared/lib/test-utils";
import Home from "../pages/index.astro";

/** Главная целиком — маршрут в Layout: шапка, страница, подвал и `<head>`. */
const text = (el: Element | null | undefined) => el?.textContent?.replace(/\s+/g, " ").trim();
const meta = (doc: Document, name: string) =>
  doc.querySelector(`meta[name="${name}"]`)?.getAttribute("content");
const jsonLd = (doc: Document) =>
  [...doc.querySelectorAll('script[type="application/ld+json"]')].map((s) =>
    JSON.parse(s.textContent ?? ""),
  );

describe("Layout на главной", () => {
  it("title и description — из PLAN.md, раздел «SEO»", async () => {
    const doc = await renderAstro(Home);
    expect(doc.title).toBe("Сверка документов по грузу для экспедиторов — Astronaut");
    expect(doc.title.length).toBeLessThanOrEqual(60);
    const description = meta(doc, "description") ?? "";
    expect(description).toBe(
      "Инвойс, коносамент, декларация и ЭТрН сверяются по одной карточке груза до отправки. Связываем 1С, CRM и операторов ЭПД. Владивосток.",
    );
    expect(description.length).toBeLessThanOrEqual(160);
  });

  it("пока в текстах есть [TODO], страница закрыта от индексации", async () => {
    const doc = await renderAstro(Home);
    if (text(doc.body)?.includes("[TODO]")) {
      expect(meta(doc, "robots")).toBe("noindex, nofollow");
    }
  });

  it("разметка Organization — имя, строка о компании, город и почта", async () => {
    const doc = await renderAstro(Home);
    const organization = jsonLd(doc).find((d) => d["@type"] === "Organization");
    expect(organization).toMatchObject({
      name: "Astronaut",
      description: "Astronaut — платформа данных для логистических и транспортных компаний.",
      email: "komarov.di@dvfu.ru",
      address: { addressLocality: "Владивосток", addressCountry: "RU" },
    });
    expect(jsonLd(doc).map((d) => d["@type"])).toEqual(["Organization", "FAQPage"]);
  });

  it("первая ссылка — «К содержимому», h1 на всю страницу один", async () => {
    const doc = await renderAstro(Home);
    const first = doc.body.querySelector("a");
    expect(text(first)).toBe("К содержимому");
    expect(doc.getElementById(first?.getAttribute("href")?.slice(1) ?? "")).not.toBeNull();
    expect(doc.querySelectorAll("h1")).toHaveLength(1);
  });

  it("якоря шапки, страницы и подвала ведут на существующие id", async () => {
    const doc = await renderAstro(Home);
    const anchors = [...doc.querySelectorAll("a[href]")]
      .map((a) => a.getAttribute("href") ?? "")
      .filter((href) => /^\/?#/.test(href));
    const missing = anchors.filter((href) => !doc.getElementById(href.replace(/^\/?#/, "")));
    expect(anchors.length).toBeGreaterThan(5);
    expect(missing).toEqual([]);
  });

  it("все «Записаться на демо» — шапка, первый экран, блок «Демо» — открывают Telegram", async () => {
    const doc = await renderAstro(Home);
    const demo = [...doc.querySelectorAll("a")].filter((a) => text(a) === "Записаться на демо");
    expect(demo.map((a) => a.getAttribute("href"))).toEqual([DEMO_URL, DEMO_URL, DEMO_URL]);
  });
});
