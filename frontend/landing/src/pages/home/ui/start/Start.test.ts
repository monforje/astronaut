import { renderAstro } from "@/shared/lib/test-utils";
import Start from "./Start.astro";

const text = (el: Element | null | undefined) => el?.textContent?.replace(/\s+/g, " ").trim();

describe("Start", () => {
  it("секция #start подписана своим h2, h1 в ней нет", async () => {
    const doc = await renderAstro(Start);
    const section = doc.getElementById("start");
    const h2 = section?.querySelector("h2");
    expect(section?.getAttribute("aria-labelledby")).toBe(h2?.id);
    expect(text(h2)).toBe("Начинаем с малого");
    expect(doc.querySelector("h1")).toBeNull();
  });

  it("четыре этапа по порядку, расширение — только после пилота", async () => {
    const doc = await renderAstro(Start);
    const stages = [...doc.querySelectorAll("ol > li")];
    expect(stages.map((li) => text(li.querySelector("h3")))).toEqual([
      "Демо и знакомство",
      "Первое подключение",
      "Пилот на ваших сделках",
      "Расширение",
    ]);
    expect(text(stages[3]?.querySelector("p"))).toContain("Только если пилот показал результат");
  });

  it("сроков этапов нет: формат пилота ещё не решён", async () => {
    const doc = await renderAstro(Start);
    expect(text(doc.body)).not.toMatch(/\d+\s*(недел|месяц|дн)/);
  });
});
