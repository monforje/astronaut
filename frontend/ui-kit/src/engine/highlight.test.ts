/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { describe, expect, it } from "vitest";
import { detectLang, langOf, tokenize, tokenizeLines, type Lang } from "./highlight";

const SAMPLES: Record<Lang, string> = {
  tsx: `import { Button } from "@/ui";

// комментарий
export function Save({ busy }: { busy: boolean }) {
  const label = busy ? "Сохраняем" : \`Готово \${1}\`;
  return <Button variant="primary" loading={busy} onClick={() => save(42)}>{label}</Button>;
}

<>
  <Dialog.Title>Текст</Dialog.Title>
  <Input value={a < b ? "x" : "y"} />
</>`,
  ts: `type Props<T> = Array<T>;\nconst x: Props<string> = [1, 2];\n/* блок\nкомментария */\nlet y = x.length > 1;`,
  css: `/* заголовок */\n.ds-btn:hover { color: var(--text); padding: 0 12px; background: #00d4d0 !important; }\n@media (max-width: 860px) { .ds-btn { width: calc(100% - 2px); } }`,
  bash: `# сборка\ntask bun -- run verify && echo "ok" $HOME\nbun x vitest run -t 'имя' | head -5`,
  json: `{ "name": "ui-kit", "version": 1.5, "private": true, "list": [null, "a"] }`,
  text: `просто текст\nв две строки`,
};

const typesOf = (code: string, lang: Lang) =>
  new Map(tokenize(code, lang).map((t) => [t.text, t.type] as const));

describe("подсветка кода", () => {
  for (const lang of Object.keys(SAMPLES) as Lang[]) {
    it(`${lang}: токены в сумме дают исходный текст`, () => {
      const tokens = tokenize(SAMPLES[lang], lang);
      expect(tokens.map((t) => t.text).join("")).toBe(SAMPLES[lang]);
      expect(tokens.every((t) => t.text.length > 0)).toBe(true);
    });

    it(`${lang}: строки склеиваются обратно`, () => {
      const lines = tokenizeLines(SAMPLES[lang], lang);
      expect(lines.map((l) => l.map((t) => t.text).join("")).join("\n")).toBe(SAMPLES[lang]);
    });
  }

  it("tsx: ключевые слова, строки, комментарии, компоненты и атрибуты", () => {
    const types = typesOf(SAMPLES.tsx, "tsx");
    expect(types.get("import")).toBe("keyword");
    expect(types.get('"@/ui"')).toBe("string");
    expect(types.get("// комментарий")).toBe("comment");
    expect(types.get("Button")).toBe("tag");
    expect(types.get("variant")).toBe("prop");
    expect(types.get('"primary"')).toBe("string");
    expect(types.get("42")).toBe("number");
    expect(types.get("save")).toBe("fn");
  });

  it("ts: обобщённый тип не принимается за тег", () => {
    const tokens = tokenize("const x: Array<string> = [];", "ts");
    expect(tokens.some((t) => t.type === "tag")).toBe(false);
  });

  it("tsx: сравнение внутри выражения не ломает разбор", () => {
    const text = tokenize('<Input value={a < b ? "x" : "y"} />', "tsx")
      .map((t) => t.text)
      .join("");
    expect(text).toBe('<Input value={a < b ? "x" : "y"} />');
  });

  it("css: свойства, токены, классы и числа", () => {
    const types = typesOf(SAMPLES.css, "css");
    expect(types.get("color")).toBe("prop");
    expect(types.get("--text")).toBe("prop");
    expect(types.get(".ds-btn")).toBe("type");
    expect(types.get("@media")).toBe("keyword");
    expect(types.get("#00d4d0")).toBe("number");
    expect(types.get("var")).toBe("fn");
  });

  it("bash: команда, флаги, переменные", () => {
    const types = typesOf(SAMPLES.bash, "bash");
    expect(types.get("# сборка")).toBe("comment");
    expect(types.get("task")).toBe("fn");
    expect(types.get("$HOME")).toBe("prop");
    expect(types.get('"ok"')).toBe("string");
    expect(types.get("-t")).toBe("keyword");
  });

  it("json: ключи отличаются от значений", () => {
    const types = typesOf(SAMPLES.json, "json");
    expect(types.get('"name"')).toBe("prop");
    expect(types.get('"ui-kit"')).toBe("string");
    expect(types.get("true")).toBe("keyword");
    expect(types.get("1.5")).toBe("number");
  });

  it("пустой код и неизвестный язык", () => {
    expect(tokenize("", "tsx")).toEqual([]);
    expect(langOf("unknown")).toBe("text");
    expect(langOf("TSX")).toBe("tsx");
    expect(langOf(undefined)).toBe("text");
  });

  it("незакрытая строка и комментарий не зацикливают разбор", () => {
    for (const code of ['const a = "abc', "/* вечный", "<Button", "{ {{", "`шаблон"]) {
      expect(
        tokenize(code, "tsx")
          .map((t) => t.text)
          .join(""),
      ).toBe(code);
    }
  });
});

describe("определение языка по содержимому", () => {
  it("css внутри tsx-блока распознаётся как css", () => {
    expect(detectLang(".card { border-radius: var(--r-card); padding: 8px; }", "tsx")).toBe("css");
    expect(detectLang("@media (max-width: 1px) {\n  .a { color: red; }\n}", "tsx")).toBe("css");
  });

  it("tsx остаётся tsx, явный язык не меняется", () => {
    expect(detectLang('<Button variant="primary">Да</Button>', "tsx")).toBe("tsx");
    expect(detectLang("const a: number = 1;\nif (a) {\n  b: c;\n}", "tsx")).toBe("tsx");
    expect(detectLang(".a { color: red; }", "bash")).toBe("bash");
    expect(detectLang("task bun -- run verify")).toBe("bash");
  });
});
