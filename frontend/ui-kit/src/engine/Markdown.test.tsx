/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Markdown } from "./Markdown";
import { parseInline, parseMarkdown, safeHref } from "./markdown";
import { isStub, splitManual, splitReadme } from "./readme";

const SOURCE = `## Заголовок

Абзац с \`кодом\`, **жирным**, *курсивом* и [ссылкой](https://example.com).
Вторая строка абзаца.

- первый
- второй \`a | b\`
  продолжение

1. раз
2. два

| Проп | Тип |
| ---- | --- |
| \`variant\` | \`"a" \\| "b"\` |
| \`size\` | \`"xs"\` |

\`\`\`tsx
<Button>Ок</Button>
\`\`\`

> цитата

---`;

describe("разбор markdown", () => {
  it("делит текст на блоки", () => {
    expect(parseMarkdown(SOURCE).map((b) => b.type)).toEqual([
      "heading",
      "paragraph",
      "list",
      "list",
      "table",
      "code",
      "quote",
      "rule",
    ]);
  });

  it("склеивает строки абзаца и продолжения пунктов", () => {
    const blocks = parseMarkdown(SOURCE);
    expect(blocks[1]).toMatchObject({ type: "paragraph" });
    expect((blocks[1] as { text: string }).text).toContain("ссылкой](https://example.com). Вторая");
    expect((blocks[2] as { items: string[] }).items[1]).toBe("второй `a | b` продолжение");
  });

  it("таблица: экранированная вертикальная черта остаётся в ячейке", () => {
    const table = parseMarkdown(SOURCE).find((b) => b.type === "table");
    expect(table).toMatchObject({
      head: ["Проп", "Тип"],
      rows: [
        ["`variant`", '`"a" | "b"`'],
        ["`size`", '`"xs"`'],
      ],
    });
  });

  it("убирает html-комментарии маркеров", () => {
    const blocks = parseMarkdown("<!-- manual:start -->\nтекст\n<!-- manual:end -->");
    expect(blocks).toEqual([{ type: "paragraph", text: "текст" }]);
  });

  it("незакрытый блок кода доходит до конца текста", () => {
    expect(parseMarkdown("```ts\nconst a = 1;")).toEqual([
      { type: "code", lang: "ts", code: "const a = 1;" },
    ]);
  });

  it("inline: код, жирный, курсив, ссылка", () => {
    const nodes = parseInline("a `b` **c** *d* [e](#/button)");
    expect(nodes.map((n) => n.type)).toEqual([
      "text",
      "code",
      "text",
      "bold",
      "text",
      "italic",
      "text",
      "link",
    ]);
  });

  it("опасные адреса ссылок отбрасываются", () => {
    expect(safeHref("javascript:alert(1)")).toBeUndefined();
    expect(safeHref("data:text/html,x")).toBeUndefined();
    expect(safeHref("https://a.b")).toBe("https://a.b");
    expect(safeHref("#/button/states")).toBe("#/button/states");
    expect(parseInline("[x](javascript:alert(1))").some((n) => n.type === "link")).toBe(false);
  });
});

describe("Markdown", () => {
  it("рисует элементы React без сырого html", () => {
    const { container } = render(<Markdown>{SOURCE}</Markdown>);
    expect(container.querySelector("h3")?.textContent).toBe("Заголовок");
    expect(container.querySelectorAll("li").length).toBe(4);
    expect(container.querySelectorAll("table th").length).toBe(2);
    expect(container.querySelectorAll("table td").length).toBe(4);
    expect(container.querySelector("strong")?.textContent).toBe("жирным");
    expect(container.querySelector(".dx-codeblock")).toBeTruthy();
    expect(container.querySelector("blockquote")?.textContent).toBe("цитата");
    expect(container.querySelector("hr")).toBeTruthy();
  });

  it("html из текста выводится как текст", () => {
    const { container } = render(
      <Markdown>{'<img src=x onerror="alert(1)"> и <script>x</script>'}</Markdown>,
    );
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("script")).toBeNull();
    expect(container.textContent).toContain("<script>x</script>");
  });

  it("внешние ссылки открываются безопасно, javascript: не становится ссылкой", () => {
    const { container } = render(
      <Markdown>{"[a](https://example.com) [b](javascript:alert(1)) [c](#/button)"}</Markdown>,
    );
    const links = container.querySelectorAll("a");
    expect(links.length).toBe(2);
    expect(links[0].getAttribute("rel")).toBe("noopener noreferrer");
    expect(links[0].getAttribute("target")).toBe("_blank");
    expect(links[1].getAttribute("target")).toBeNull();
  });

  it("таблица в прокручиваемой области, доступной с клавиатуры", () => {
    const { container } = render(<Markdown>{"| a |\n| - |\n| 1 |"}</Markdown>);
    const scroll = container.querySelector(".dx-md__scroll") as HTMLElement;
    expect(scroll.tabIndex).toBe(0);
    expect(scroll.getAttribute("role")).toBe("region");
  });

  it("смещение уровня заголовков", () => {
    const { container } = render(<Markdown headingOffset={2}>{"## Раз"}</Markdown>);
    expect(container.querySelector("h4")?.textContent).toBe("Раз");
  });
});

describe("README записи", () => {
  const README = `<!-- gen:start -->\n# X\n\nописание\n<!-- gen:end -->\n\n## Как использовать\n\n<!-- manual:start -->\nКомпонент \`X\`.\n\n\`\`\`tsx\nimport { X } from "@/ui";\n\`\`\`\n\n| Проп | Тип |\n| --- | --- |\n| \`a\` | \`b\` |\n\nДоступность:\n\n- пункт\n<!-- manual:end -->\n`;

  it("делит файл на генерируемую и ручную части", () => {
    const parts = splitReadme(README);
    expect(parts.generated).toContain("описание");
    expect(parts.manual).toContain("Компонент");
  });

  it("выделяет импорт, пропсы и доступность", () => {
    const m = splitManual(splitReadme(README).manual);
    expect(m.importLine).toBe('import { X } from "@/ui";');
    expect(m.usage.map((b) => b.type)).toEqual(["paragraph", "table"]);
    expect(m.a11y.map((b) => b.type)).toEqual(["list"]);
  });

  it("заглушка [TODO] определяется и не даёт блоков", () => {
    expect(isStub("[TODO] описать")).toBe(true);
    expect(isStub("")).toBe(true);
    expect(isStub("Компонент `X`.")).toBe(false);
    expect(splitManual("[TODO] описать")).toEqual({ usage: [], a11y: [], importLine: undefined });
  });
});

describe("раздел «Доступность» из README", () => {
  it("абзац «Поведение и доступность:» открывает раздел, подпись не дублируется", () => {
    const m = splitManual(
      "Текст.\n\nПоведение и доступность:\n\n- Esc закрывает.\n- Tab идёт дальше.",
    );
    expect(m.usage).toHaveLength(1);
    expect(m.a11y).toHaveLength(1);
    expect(m.a11y[0]?.type).toBe("list");
  });
});
