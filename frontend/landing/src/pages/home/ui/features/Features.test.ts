import { renderAstro } from "@/shared/lib/test-utils";
import Features from "./Features.astro";

const text = (el: Element | null | undefined) => el?.textContent?.replace(/\s+/g, " ").trim();

describe("Features", () => {
  it("три слова питча: одна карточка, сверка до отправки, сбой виден сразу", async () => {
    const doc = await renderAstro(Features);
    expect([...doc.querySelectorAll("h3")].map(text)).toEqual([
      "Одна карточка груза",
      "Сверка до отправки",
      "Сбой виден сразу",
    ]);
  });

  it("секция с якорем #features подписана своим h2, h1 в ней нет", async () => {
    const doc = await renderAstro(Features);
    const section = doc.getElementById("features");
    const h2 = section?.querySelector("h2");
    expect(section?.getAttribute("aria-labelledby")).toBe(h2?.id);
    expect(text(h2)).toBe("Что делает Astronaut");
    expect(doc.querySelector("h1")).toBeNull();
  });

  it("куски интерфейса — картинка для глаза: скрыты от читалки, смысл в заголовке и тексте", async () => {
    const doc = await renderAstro(Features);
    const items = [...doc.querySelectorAll("#features > div > ul > li")];
    expect(items).toHaveLength(3);
    for (const item of items) {
      expect(item.firstElementChild?.getAttribute("aria-hidden")).toBe("true");
      expect(text(item.querySelector("h3 + p"))).not.toBe("");
    }
  });

  it("куски собраны из сквозного примера, оранжевой искры рядом с главной кнопкой нет", async () => {
    const doc = await renderAstro(Features);
    const all = text(doc.getElementById("features"));
    for (const fact of ["MSKU1234567", "ООО Ромашка", "120", "18 420 кг", "1С → Контур"]) {
      expect(all).toContain(fact);
    }
    expect(doc.querySelector("mark")).toBeNull();
  });
});
