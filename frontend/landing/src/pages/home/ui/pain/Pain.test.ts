import { renderAstro } from "@/shared/lib/test-utils";
import Pain from "./Pain.astro";

const text = (el: Element | null | undefined) => el?.textContent?.replace(/\s+/g, " ").trim();

describe("Pain", () => {
  it("секция #pain подписана своим h2, h1 в ней нет", async () => {
    const doc = await renderAstro(Pain);
    const section = doc.getElementById("pain");
    const h2 = section?.querySelector("h2");
    expect(section?.getAttribute("aria-labelledby")).toBe(h2?.id);
    expect(text(h2)).toBe("Один контейнер. Десять документов.");
    expect(doc.querySelector("h1")).toBeNull();
  });

  it("четыре сцены из сквозного примера, без кавычек: это не отзывы", async () => {
    const doc = await renderAstro(Pain);
    const scenes = [...doc.querySelectorAll("li")].map(text);
    expect(scenes).toHaveLength(4);
    expect(scenes[0]).toBe("В инвойсе 120 мест, в коносаменте 118. Узнали на таможне.");
    expect(scenes.join(" ")).not.toMatch(/[«»"]/);
  });

  it("искрой выделено только расходящееся значение — 118 мест в коносаменте", async () => {
    const doc = await renderAstro(Pain);
    expect(new Set([...doc.querySelectorAll("mark")].map(text))).toEqual(new Set(["118"]));
  });

  it("веер документов — картинка для глаза: скрыт от читалки, цифры только из сцены", async () => {
    const doc = await renderAstro(Pain);
    const stack = doc.querySelector('[aria-hidden="true"][data-reveal]');
    expect(text(stack)).toContain("MSKU1234567");
    const numbers = text(stack)?.match(/\d+/g) ?? [];
    expect(numbers).toEqual(expect.arrayContaining(["120", "118"]));
    expect(numbers.filter((n) => !["1234567", "120", "118"].includes(n))).toEqual([]);
  });
});
