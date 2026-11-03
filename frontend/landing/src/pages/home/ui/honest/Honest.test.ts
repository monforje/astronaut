import { renderAstro } from "@/shared/lib/test-utils";
import Honest from "./Honest.astro";

const text = (el: Element | null | undefined) => el?.textContent?.replace(/\s+/g, " ").trim();

describe("Honest", () => {
  it("секция #honest подписана своим h2, h1 в ней нет", async () => {
    const doc = await renderAstro(Honest);
    const section = doc.getElementById("honest");
    const h2 = section?.querySelector("h2");
    expect(section?.getAttribute("aria-labelledby")).toBe(h2?.id);
    expect(text(h2)).toBe("Чего мы не обещаем");
    expect(doc.querySelector("h1")).toBeNull();
  });

  it("честно говорит о границах и о том, что кейсов пока нет", async () => {
    const doc = await renderAstro(Honest);
    expect([...doc.querySelectorAll("li")].map(text)).toEqual([
      "Порт и железную дорогу мы не ускорим.",
      "Ставки не снизим.",
      "1С и программу брокера не заменим: мы работаем поверх них.",
      "Мы убираем задержки, которые случаются из-за ошибок в документах.",
    ]);
    const team = text(doc.querySelector("ul + p"));
    expect(team).toContain("готовых кейсов у нас пока нет");
    expect(team).toMatch(/Не покажем результат — не продолжаем\.$/);
  });
});
