import { MAILTO_URL, TELEGRAM_URL } from "@/shared/config";
import { renderAstro } from "@/shared/lib/test-utils";
import Faq from "./Faq.astro";

const text = (el: Element | null | undefined) => el?.textContent?.replace(/\s+/g, " ").trim();

describe("Faq", () => {
  it("секция #faq подписана своим h2, h1 в ней нет", async () => {
    const doc = await renderAstro(Faq);
    const section = doc.getElementById("faq");
    const h2 = section?.querySelector("h2");
    expect(section?.getAttribute("aria-labelledby")).toBe(h2?.id);
    expect(text(h2)).toBe("Что обычно спрашивают");
    expect(doc.querySelector("h1")).toBeNull();
  });

  it("семь вопросов на нативном <details>, без клиентского JS", async () => {
    const doc = await renderAstro(Faq);
    expect(doc.querySelectorAll("details > summary")).toHaveLength(7);
    expect(doc.querySelectorAll("script:not([type='application/ld+json'])")).toHaveLength(0);
  });

  it("FAQPage для поисковиков совпадает с вопросами и ответами на странице", async () => {
    const doc = await renderAstro(Faq);
    const ld = JSON.parse(
      doc.querySelector('script[type="application/ld+json"]')?.textContent ?? "",
    );
    expect(ld["@type"]).toBe("FAQPage");
    const onPage = [...doc.querySelectorAll("details")].map((d) => ({
      "@type": "Question",
      name: text(d.querySelector("summary")),
      acceptedAnswer: { "@type": "Answer", text: text(d.querySelector("p")) },
    }));
    expect(ld.mainEntity).toEqual(onPage);
  });

  it("цена — без цифр, про клиентов — честно", async () => {
    const doc = await renderAstro(Faq);
    const answer = (q: string) =>
      text(
        [...doc.querySelectorAll("details")]
          .find((d) => text(d.querySelector("summary")) === q)
          ?.querySelector("p"),
      );
    expect(answer("Сколько это стоит?")).not.toMatch(/\d/);
    expect(answer("У вас есть клиенты?")).toContain("Готового кейса ещё нет");
  });

  it("свой вопрос можно задать в Telegram или на почту — обычными ссылками, без формы", async () => {
    const doc = await renderAstro(Faq);
    const aside = doc.querySelector("aside");
    expect(aside?.getAttribute("aria-labelledby")).toBe(aside?.querySelector("h3")?.id);
    expect(text(aside?.querySelector("h3"))).toBe("Не нашли свой вопрос?");
    expect([...(aside?.querySelectorAll("a") ?? [])].map((a) => a.getAttribute("href"))).toEqual([
      TELEGRAM_URL,
      MAILTO_URL,
    ]);
    expect(doc.querySelector("form")).toBeNull();
  });
});
