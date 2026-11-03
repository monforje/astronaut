import { DEMO_MESSAGE, DEMO_URL, MAILTO_URL, TELEGRAM_URL } from "./company";

describe("company", () => {
  it("кнопка демо открывает чат @monforje с уже набранным сообщением", () => {
    const url = new URL(DEMO_URL);
    expect(url.origin + url.pathname).toBe("https://t.me/monforje");
    expect(url.searchParams.get("text")).toBe(DEMO_MESSAGE);
    expect(DEMO_MESSAGE).toBe("Здравствуйте! Хочу посмотреть демо Astronaut. Компания: ");
  });

  it("обычный чат и почта — без параметров", () => {
    expect(TELEGRAM_URL).toBe("https://t.me/monforje");
    expect(MAILTO_URL).toBe("mailto:komarov.di@dvfu.ru");
  });
});
