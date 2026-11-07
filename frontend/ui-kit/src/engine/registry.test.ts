/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { describe, expect, it } from "vitest";
import { entries, normalize, searchEntries } from "./registry";

const nameWords = (e: (typeof entries)[number]) =>
  normalize([e.title, e.id, ...e.keywords].join(" "))
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);

describe("поиск по словарю", () => {
  it("пустой запрос возвращает все записи", () => {
    expect(searchEntries("  ")).toHaveLength(entries.length);
  });

  it("короткий запрос не находит записи только по описанию", () => {
    for (const query of ["чип", "ряд", "тема"]) {
      for (const e of searchEntries(query)) {
        const words = nameWords(e);
        expect(
          words.some((w) => w.startsWith(query)) ||
            normalize(e.title).includes(query) ||
            normalize(e.id).includes(query),
        ).toBe(true);
      }
    }
  });

  it("название выше описания: Button первым по «кнопк»", () => {
    expect(searchEntries("кнопк")[0]?.id).toBe("button");
  });
});
