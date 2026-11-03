import { renderAstro } from "@/shared/lib/test-utils";
import WhyNow from "./WhyNow.astro";

const text = (el: Element | null | undefined) => el?.textContent?.replace(/\s+/g, " ").trim();
/** Текст без скрытого от читалки — то, что она прочтёт. */
const spoken = (el: Element) => {
  const clone = el.cloneNode(true) as Element;
  for (const hidden of clone.querySelectorAll('[aria-hidden="true"]')) hidden.remove();
  return text(clone);
};

describe("WhyNow", () => {
  it("секция #why-now подписана своим h2, h1 в ней нет", async () => {
    const doc = await renderAstro(WhyNow);
    const section = doc.getElementById("why-now");
    const h2 = section?.querySelector("h2");
    expect(section?.getAttribute("aria-labelledby")).toBe(h2?.id);
    expect(text(h2)).toBe("С сентября ошибка останавливает отгрузку");
    expect(doc.querySelector("h1")).toBeNull();
  });

  it("каждая дата — рядом со своим смыслом, читалка слышит дату словами", async () => {
    const doc = await renderAstro(WhyNow);
    expect([...doc.querySelectorAll("ol > li")].map(spoken)).toEqual([
      "1 сентября 2026 Электронные перевозочные документы Перевозочные документы только в электронном виде. Опечатка в реквизитах, и накладную отклоняют.",
      "1 марта 2027 Реестр перевозчиков Договор можно заключить только с перевозчиком из государственного реестра.",
      "3 года Хранение сведений Столько экспедитор хранит договоры и сведения о грузе и выдаёт их по запросу.",
    ]);
    expect([...doc.querySelectorAll("time")].map((t) => t.getAttribute("datetime"))).toEqual([
      "2026-09-01",
      "2027-03-01",
    ]);
  });
});
