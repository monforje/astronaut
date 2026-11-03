import { renderAstro } from "@/shared/lib/test-utils";
import How from "./How.astro";

const text = (el: Element | null | undefined) => el?.textContent?.replace(/\s+/g, " ").trim();

describe("How", () => {
  it("секция #how подписана своим h2, h1 в ней нет", async () => {
    const doc = await renderAstro(How);
    const section = doc.getElementById("how");
    const h2 = section?.querySelector("h2");
    expect(section?.getAttribute("aria-labelledby")).toBe(h2?.id);
    expect(text(h2)).toBe("Путь одного контейнера");
    expect(doc.querySelector("h1")).toBeNull();
  });

  it("пять шагов по порядку, у каждого — сообщение системы", async () => {
    const doc = await renderAstro(How);
    const steps = [...doc.querySelectorAll("ol > li")];
    expect(steps.map((li) => text(li.querySelector("h3")))).toEqual([
      "Новый клиент",
      "Документы поставщика",
      "Черновик коносамента",
      "Таможня",
      "Доставка по России",
    ]);
    expect(steps.map((li) => text([...li.querySelectorAll("p")].at(-1)))).toEqual([
      "Сообщение системы: Это уже заведённая ООО Ромашка.",
      "Сообщение системы: В инвойсе 120 мест, в упаковочном листе 118. Проверьте упаковочный лист.",
      "Сообщение системы: Вес брутто: в упаковочном листе 18 420 кг, в коносаменте 18 920 кг. Разница 2,7 %, это больше допуска. Проверьте коносамент до выпуска.",
      "Сообщение системы: Документы по контейнеру MSKU1234567 сверены. Расхождений нет.",
      "Сообщение системы: ЭТрН № 518 не подписана перевозчиком 2 часа. Напомнили ему.",
    ]);
  });

  it("у сообщения видно, какая проверка его прислала, — без выдуманного времени", async () => {
    const doc = await renderAstro(How);
    const sources = [...doc.querySelectorAll("ol > li")].map((li) =>
      text([...li.querySelectorAll("p")].at(-2)),
    );
    expect(sources).toEqual([
      "Справочник клиентов",
      "Сверка: инвойс и упаковочный лист",
      "Сверка: упаковочный лист и коносамент",
      "Сверка перед подачей декларации",
      "Подписание ЭТрН",
    ]);
    expect(sources.join(" ")).not.toMatch(/\d{1,2}:\d{2}/);
  });

  it("искрой выделены только расхождения: 118 мест и 18 920 кг", async () => {
    const doc = await renderAstro(How);
    expect([...doc.querySelectorAll("mark")].map(text)).toEqual(["118", "18 920 кг"]);
  });

  it("второе действие — ссылка к блоку «Демо»", async () => {
    const doc = await renderAstro(How);
    const link = [...doc.querySelectorAll("a")].find(
      (a) => text(a) === "Покажем этот путь на демо",
    );
    expect(link?.getAttribute("href")).toBe("#contact");
  });
});
