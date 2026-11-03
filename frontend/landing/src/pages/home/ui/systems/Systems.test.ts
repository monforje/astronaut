import { renderAstro } from "@/shared/lib/test-utils";
import Systems from "./Systems.astro";

const text = (el: Element | null | undefined) => el?.textContent?.replace(/\s+/g, " ").trim();

describe("Systems", () => {
  it("секция #systems подписана своим h2, h1 в ней нет", async () => {
    const doc = await renderAstro(Systems);
    const section = doc.getElementById("systems");
    const h2 = section?.querySelector("h2");
    expect(section?.getAttribute("aria-labelledby")).toBe(h2?.id);
    expect(text(h2)).toBe("Работает с тем, что у вас уже есть");
    expect(doc.querySelector("h1")).toBeNull();
  });

  it("системы первой версии — текстом, без чужих логотипов", async () => {
    const doc = await renderAstro(Systems);
    const list = doc.querySelector("h3 + div ul");
    expect([...(list?.querySelectorAll("li") ?? [])].map(text)).toEqual([
      "1С",
      "Битрикс24",
      "Базы данных",
      "Почта и Excel",
      "Операторы ЭПД",
      "ЕГРЮЛ",
      "ГосЛог",
      "MAX",
    ]);
    expect(list?.querySelectorAll("img")).toHaveLength(0);
  });

  it("две ценности: обмены и один справочник", async () => {
    const doc = await renderAstro(Systems);
    const titles = [...doc.querySelectorAll("h3")].map(text).slice(1);
    expect(titles).toEqual(["Обмены, которые не ломаются молча", "Одна Ромашка вместо трёх"]);
  });
});
