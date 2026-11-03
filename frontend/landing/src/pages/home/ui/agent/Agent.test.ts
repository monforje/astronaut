import { renderAstro } from "@/shared/lib/test-utils";
import Agent from "./Agent.astro";

const text = (el: Element | null | undefined) => el?.textContent?.replace(/\s+/g, " ").trim();

describe("Agent", () => {
  it("секция #agent подписана своим h2, h1 в ней нет", async () => {
    const doc = await renderAstro(Agent);
    const section = doc.getElementById("agent");
    const h2 = section?.querySelector("h2");
    expect(section?.getAttribute("aria-labelledby")).toBe(h2?.id);
    expect(text(h2)).toBe("Попросите — агент сделает");
    expect(doc.querySelector("h1")).toBeNull();
  });

  it("чат — пример разговора: вопрос человека и ответ агента с вопросом о подтверждении", async () => {
    const doc = await renderAstro(Agent);
    const chat = doc.querySelector("figure");
    expect(text(chat?.querySelector("figcaption"))).toBe("Пример разговора с агентом");
    expect([...(chat?.querySelectorAll("p") ?? [])].map(text)).toEqual([
      "Вы: Почему упал обмен с 1С?",
      "Агент: Обмен 1С → Контур не работает 10 минут. Истёк токен Контура. Обновить токен в подключении?",
    ]);
  });

  it("«Применить» и «Отклонить» в макете только для вида: не кнопки, не ссылки, скрыты от читалки", async () => {
    const doc = await renderAstro(Agent);
    const chat = doc.querySelector("figure");
    expect(chat?.querySelectorAll("a, button, input")).toHaveLength(0);
    const fake = [...(chat?.querySelectorAll("span") ?? [])].find((s) => text(s) === "Применить");
    expect(fake?.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it("три правила под чатом: права, подтверждение, выбор модели", async () => {
    const doc = await renderAstro(Agent);
    expect([...doc.querySelectorAll("ul > li")].map(text)).toEqual([
      "Агент работает с вашими правами и не может больше, чем вы.",
      "Важное подтверждаете вы: изменения данных, повторную отправку документов.",
      "Модель выбираете вы, в том числе российскую или на вашем сервере.",
    ]);
  });
});
