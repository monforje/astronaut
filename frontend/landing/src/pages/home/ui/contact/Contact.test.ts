import { DEMO_URL, MAILTO_URL } from "@/shared/config";
import { renderAstro } from "@/shared/lib/test-utils";
import Contact from "./Contact.astro";

const text = (el: Element | null | undefined) => el?.textContent?.replace(/\s+/g, " ").trim();

describe("Contact", () => {
  it("секция #contact подписана своим h2, h1 в ней нет", async () => {
    const doc = await renderAstro(Contact);
    const section = doc.getElementById("contact");
    const h2 = section?.querySelector("h2");
    expect(section?.getAttribute("aria-labelledby")).toBe(h2?.id);
    expect(text(h2)).toBe("Покажем на одном контейнере");
    expect(doc.querySelector("h1")).toBeNull();
  });

  it("«Записаться на демо» открывает чат в Telegram, а почта — запасной путь", async () => {
    const doc = await renderAstro(Contact);
    const links = [...doc.querySelectorAll("a")].map((a) => [text(a), a.getAttribute("href")]);
    expect(links).toEqual([
      ["Записаться на демо", DEMO_URL],
      ["komarov.di@dvfu.ru", MAILTO_URL],
    ]);
  });

  it("формы нет: заявка — только переход в Telegram или на почту", async () => {
    const doc = await renderAstro(Contact);
    expect(doc.querySelectorAll("form, input, textarea")).toHaveLength(0);
  });
});
