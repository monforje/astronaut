import { MAILTO_URL, TELEGRAM_URL } from "@/shared/config";
import { renderAstro } from "@/shared/lib/test-utils";
import SiteFooter from "./SiteFooter.astro";

const text = (el: Element | null | undefined) => el?.textContent?.replace(/\s+/g, " ").trim();

describe("SiteFooter", () => {
  it("строка о компании, город и год", async () => {
    const doc = await renderAstro(SiteFooter);
    const footer = text(doc.querySelector("footer"));
    expect(footer).toContain(
      "Astronaut — платформа данных для логистических и транспортных компаний.",
    );
    expect(footer).toContain("Владивосток");
    expect(footer).toContain(`© ${new Date().getFullYear()}`);
  });

  it("Telegram и почта — обычные ссылки", async () => {
    const doc = await renderAstro(SiteFooter);
    const links = [...doc.querySelectorAll("a")].map((a) => [text(a), a.getAttribute("href")]);
    expect(links).toEqual([
      ["Telegram @monforje", TELEGRAM_URL],
      ["komarov.di@dvfu.ru", MAILTO_URL],
    ]);
  });
});
