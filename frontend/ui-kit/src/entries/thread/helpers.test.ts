/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { describe, expect, it } from "vitest";
import {
  filterPeople,
  insertMention,
  isContinuation,
  mentionQuery,
  minutesOf,
  plainText,
  splitBold,
  splitMentions,
  toggleReaction,
} from "./helpers";
import type { ThreadMessage } from "./types";

const PEOPLE = [{ name: "Ирина Петрова" }, { name: "Алексей Крылов" }, { name: "Алексей" }];
const msg = (extra: Partial<ThreadMessage>): ThreadMessage => ({
  id: 1,
  author: "Ирина Петрова",
  day: "Сегодня",
  time: "10:44",
  text: "x",
  ...extra,
});

describe("лента: текст", () => {
  it("plainText убирает теги", () => {
    expect(plainText("<b>Ирина</b> изменила приоритет")).toBe("Ирина изменила приоритет");
  });

  it("splitMentions выделяет упоминания по списку людей, длинное имя приоритетнее", () => {
    const parts = splitMentions("@Алексей Крылов проверьте, и @Алексей тоже", PEOPLE);
    expect(parts.filter((p) => p.kind === "mention").map((p) => p.text)).toEqual([
      "@Алексей Крылов",
      "@Алексей",
    ]);
    expect(parts.map((p) => p.text).join("")).toBe("@Алексей Крылов проверьте, и @Алексей тоже");
  });

  it("splitMentions не трогает @ с неизвестным именем и пустой список людей", () => {
    expect(splitMentions("@Неизвестный привет", PEOPLE).every((p) => p.kind === "text")).toBe(true);
    expect(splitMentions("@Ирина Петрова", [])).toEqual([
      { text: "@Ирина Петрова", kind: "text", at: 0 },
    ]);
  });

  it("splitBold превращает <b> в выделение без innerHTML", () => {
    expect(splitBold("Агент нашёл <b>180 кг</b> разницы")).toEqual([
      { text: "Агент нашёл ", kind: "text", at: 0 },
      { text: "180 кг", kind: "bold", at: 12 },
      { text: " разницы", kind: "text", at: 25 },
    ]);
    expect(splitBold("<i>тег</i> текст")).toEqual([{ text: "тег текст", kind: "text", at: 0 }]);
  });
});

describe("лента: упоминания в поле", () => {
  it("mentionQuery берёт слово после последней @ в конце текста", () => {
    expect(mentionQuery("привет @Ал")).toBe("Ал");
    expect(mentionQuery("@")).toBe("");
    expect(mentionQuery("привет @Алексей Крылов ")).toBeNull();
    expect(mentionQuery("без упоминаний")).toBeNull();
  });

  it("filterPeople ищет по подстроке без учёта регистра", () => {
    expect(filterPeople(PEOPLE, "ал").map((p) => p.name)).toEqual(["Алексей Крылов", "Алексей"]);
    expect(filterPeople(PEOPLE, "")).toHaveLength(3);
    expect(filterPeople(PEOPLE, null)).toEqual([]);
  });

  it("insertMention заменяет хвост @запрос именем и пробелом", () => {
    expect(insertMention("привет @Ал", "Алексей Крылов")).toBe("привет @Алексей Крылов ");
  });
});

describe("лента: группировка и реакции", () => {
  it("minutesOf разбирает ч:мм", () => {
    expect(minutesOf("10:44")).toBe(644);
  });

  it("продолжение: тот же автор в пределах пяти минут", () => {
    const a = msg({});
    expect(isContinuation(a, msg({ id: 2, time: "10:49" }))).toBe(true);
    expect(isContinuation(a, msg({ id: 2, time: "10:50" }))).toBe(false);
    expect(isContinuation(a, msg({ id: 2, author: "Алексей Крылов" }))).toBe(false);
    expect(isContinuation(a, msg({ id: 2, replyTo: 1 }))).toBe(false);
    expect(isContinuation(a, msg({ id: 2, kind: "agent" }))).toBe(false);
    expect(isContinuation(msg({ kind: "system" }), msg({ id: 2 }))).toBe(false);
    expect(isContinuation(null, a)).toBe(false);
  });

  it("toggleReaction добавляет и снимает, пустую реакцию убирает, исходник не меняет", () => {
    const src = { "👍": ["Мария"] };
    const added = toggleReaction(src, "👍", "Ирина");
    expect(added["👍"]).toEqual(["Мария", "Ирина"]);
    expect(src["👍"]).toEqual(["Мария"]);
    expect(toggleReaction(added, "👍", "Ирина")["👍"]).toEqual(["Мария"]);
    expect(toggleReaction({ "👍": ["Ирина"] }, "👍", "Ирина")).toEqual({});
    expect(toggleReaction(undefined, "✅", "Ирина")).toEqual({ "✅": ["Ирина"] });
  });
});
