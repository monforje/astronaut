import { renderAstro } from "@/shared/lib/test-utils";
import HomePage from "./HomePage.astro";

describe("HomePage", () => {
  it("на странице один h1 — заголовок первого экрана", async () => {
    const doc = await renderAstro(HomePage);
    const h1 = doc.querySelectorAll("h1");
    expect(h1).toHaveLength(1);
    expect(h1[0]?.textContent?.replace(/\s+/g, " ").trim()).toBe("Документы без расхождений");
  });

  it("«Узнать больше» ведёт к блоку возможностей", async () => {
    const doc = await renderAstro(HomePage);
    const link = [...doc.querySelectorAll("a")].find(
      (a) => a.textContent?.trim() === "Узнать больше",
    );
    expect(link?.getAttribute("href")).toBe("#features");
    expect(doc.getElementById("features")).not.toBeNull();
  });

  it("показывает четыре ценности с заголовками h3", async () => {
    const doc = await renderAstro(HomePage);
    const titles = [...doc.querySelectorAll("#features h3")].map((h) =>
      h.textContent?.replace(/\s+/g, " ").trim(),
    );
    expect(titles).toEqual([
      "Документы без расхождений",
      "Где контейнер — видно сразу",
      "Обмены, которые не ломаются молча",
      "Одна Ромашка вместо трёх",
    ]);
  });
});
