/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { createElement, Fragment, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { GROUPS, type DocSpec } from "@/engine/types";
import { importsLine } from "./exports";

export const GEN_START = "<!-- gen:start -->";
export const GEN_END = "<!-- gen:end -->";
export const MANUAL_START = "<!-- manual:start -->";
export const MANUAL_END = "<!-- manual:end -->";
export const LICENSE_LINE = "© 2026 Komarov Zhiznev Group. Все права защищены. См. LICENSE";
export const MANUAL_STUB =
  "[TODO] код компонента появится в этой папке; импорт и пример использования.";
export const REGEN_COMMAND = "task bun -- run docs";

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&nbsp;": " ",
  "&#39;": "'",
  "&#x27;": "'",
};

const BLOCK_TAGS = "p|div|li|ul|ol|tr|table|section|h[1-6]|br";

const decode = (s: string) => s.replace(/&(?:amp|lt|gt|quot|nbsp|#39|#x27);/g, (m) => ENTITIES[m]);

const withCode = (html: string) =>
  html.replace(
    /<code[^>]*>([\s\S]*?)<\/code>/g,
    (_, inner: string) => `\`${inner.replace(/<[^>]*>/g, "")}\``,
  );

function markup(node: ReactNode): string {
  try {
    return renderToStaticMarkup(createElement(Fragment, null, node));
  } catch {
    return "";
  }
}

export function inlineText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string") return node.replace(/\s+/g, " ").trim();
  const html = withCode(markup(node))
    .replace(new RegExp(`</?(?:${BLOCK_TAGS})(?:\\s[^>]*)?/?>`, "g"), " ")
    .replace(/<[^>]*>/g, "");
  return decode(html).replace(/\s+/g, " ").trim();
}

export function blockText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  const html = withCode(typeof node === "string" ? node : markup(node))
    .replace(/<li(?:\s[^>]*)?>/g, "\n- ")
    .replace(/<\/(?:td|th)>/g, " · ")
    .replace(new RegExp(`</(?:${BLOCK_TAGS})>|<br\\s*/?>`, "g"), "\n")
    .replace(/<[^>]*>/g, "");
  const lines = decode(html)
    .split("\n")
    .map((l) =>
      l
        .replace(/\s+/g, " ")
        .replace(/( · )+$/, "")
        .trim(),
    )
    .filter(Boolean);
  return lines.join("\n");
}

const cell = (s: string) => s.replace(/\|/g, "\\|").replace(/\s+/g, " ").trim() || "—";

function table(head: string[], rows: string[][]): string {
  return [
    `| ${head.join(" | ")} |`,
    `| ${head.map(() => "---").join(" | ")} |`,
    ...rows.map((r) => `| ${r.map(cell).join(" | ")} |`),
  ].join("\n");
}

function todoSentences(where: string, text: string): string[] {
  if (!text.includes("[TODO]")) return [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  const found: string[] = [];
  sentences.forEach((s, i) => {
    if (!s.includes("[TODO]")) return;
    const alone = s.replace("[TODO]", "").replace(/[\s.:;,]/g, "") === "";
    found.push(`${where}: ${alone && i > 0 ? `${sentences[i - 1]} ${s}` : s}`);
  });
  return found;
}

const stateLine = (title: string, kind: string, id: string, note: string) =>
  `**${title}** (${kind === id ? `\`${id}\`` : `\`${kind}\`, \`${id}\``}): ${note}`;

const groupTitle = (id: string) => GROUPS.find((g) => g.id === id)?.title ?? id;

export function renderGenerated(doc: DocSpec): string {
  const todos = new Set<string>();
  const text = (where: string, node: ReactNode) => {
    const s = inlineText(node);
    for (const t of todoSentences(where, s)) todos.add(t);
    return s;
  };
  const sections: string[] = [];

  const head = [`# ${doc.title}`, text("Описание", doc.summary)];
  if (doc.purpose) head.push(text("Назначение", doc.purpose));
  const origins = (["mockup", "proposal"] as const)
    .map((o) => [o, doc.choreography.filter((c) => c.origin === o).length] as const)
    .filter(([, n]) => n > 0)
    .map(([o, n]) => `${o} (${n})`);
  head.push(
    [
      `- **id:** \`${doc.id}\``,
      `- **Группа:** ${groupTitle(doc.group)} (\`${doc.group}\`)`,
      `- **CSS-префикс:** \`${doc.cssPrefix}\``,
      `- **Origin хореографии:** ${origins.join(", ") || "нет сценариев"}`,
      ...(doc.foundation ? ["- **Страница основы:** да"] : []),
    ].join("\n"),
  );
  sections.push(head.join("\n\n"));

  const use = doc.rules.use.map((r, i) => `- ${text(`Правила / использовать ${i + 1}`, r)}`);
  const avoid = doc.rules.avoid.map((r, i) => `- ${text(`Правила / не использовать ${i + 1}`, r)}`);
  sections.push(
    [
      "## Когда использовать / не использовать",
      "### Использовать",
      use.join("\n") || "Нет.",
      "### Не использовать",
      avoid.join("\n") || "Нет.",
    ].join("\n\n"),
  );

  const parts = doc.anatomy.parts.map(
    (p, i) =>
      `${i + 1}. **${p.name}**${p.optional ? " (необязательная)" : ""} — ${text(`Анатомия / ${p.name}`, p.description)}`,
  );
  sections.push(["## Анатомия", parts.join("\n") || "Нет."].join("\n\n"));

  const variants = doc.variants.map((v) => {
    const when = v.when ? ` Когда: ${text(`Варианты / ${v.title} / когда`, v.when)}` : "";
    return `- **${v.title}** (\`${v.id}\`): ${text(`Варианты / ${v.title}`, v.description)}${when}`;
  });
  sections.push(["## Варианты", variants.join("\n") || "Нет."].join("\n\n"));

  const applicable = doc.states
    .filter((s) => !s.notApplicable)
    .map((s) => `- ${stateLine(s.title, s.kind, s.id, text(`Состояния / ${s.title}`, s.note))}`);
  const notApplicable = doc.states
    .filter((s) => s.notApplicable)
    .map((s) => `- ${stateLine(s.title, s.kind, s.id, text(`Состояния / ${s.title}`, s.note))}`);
  sections.push(
    [
      "## Состояния",
      "### Применимые",
      applicable.join("\n") || "Нет.",
      "### Не применимы (с причиной)",
      notApplicable.join("\n") || "Нет.",
    ].join("\n\n"),
  );

  const tokenParts = ["## Размеры и токены"];
  if (doc.sizes?.length) {
    tokenParts.push(
      "### Размеры",
      table(
        ["Название", "Значение", "Назначение"],
        doc.sizes.map((s) => [
          s.title,
          s.value,
          s.note ? text(`Размеры / ${s.title}`, s.note) : "",
        ]),
      ),
    );
  }
  tokenParts.push(
    "### Токены",
    doc.tokens.length
      ? table(
          ["Название", "Значение", "Назначение"],
          doc.tokens.map((t) => [
            `\`${t.name}\``,
            text(`Токены / ${t.name} / значение`, t.value),
            text(`Токены / ${t.name}`, t.usage),
          ]),
        )
      : "Нет.",
  );
  sections.push(tokenParts.join("\n\n"));

  sections.push(
    [
      "## Доступность",
      doc.a11y
        .map((a) => `- **${a.title}** (\`${a.kind}\`): ${text(`Доступность / ${a.title}`, a.text)}`)
        .join("\n") || "Нет.",
    ].join("\n\n"),
  );

  const scenarios = doc.choreography.map((c) => {
    const where = `Хореография / ${c.title}`;
    return [
      `### ${c.title} (\`${c.id}\`, origin: ${c.origin})`,
      `- **Триггер:** ${text(`${where} / триггер`, c.trigger)}`,
      table(
        ["at, мс", "dur, мс", "Что происходит", "prop", "easing"],
        c.steps.map((s, i) => [
          String(s.at),
          String(s.dur),
          text(`${where} / шаг ${i + 1}`, s.what),
          s.prop ?? "",
          s.easing ?? "",
        ]),
      ),
      `- **Фокус:** ${text(`${where} / фокус`, c.focus)}`,
      `- **Reduced motion:** ${text(`${where} / reduced motion`, c.reducedMotion)}`,
      `- **Соседи:** ${text(`${where} / соседи`, c.neighbours)}`,
    ].join("\n\n");
  });
  sections.push(["## Хореография", ...(scenarios.length ? scenarios : ["Нет."])].join("\n\n"));

  const examples = doc.examples.map((e) =>
    [
      `### ${e.title} (\`${e.id}\`)`,
      e.description ? text(`Примеры / ${e.title}`, e.description) : "",
      e.code ? `\`\`\`tsx\n${e.code.trim()}\n\`\`\`` : "",
    ]
      .filter(Boolean)
      .join("\n\n"),
  );
  if (examples.length) sections.push(["## Примеры", ...examples].join("\n\n"));

  const extra = (doc.extra ?? [])
    .map((x) => {
      const body = blockText(x.content);
      for (const t of todoSentences(`Дополнительно / ${x.title}`, body.replace(/\n/g, " ")))
        todos.add(t);
      return body ? `### ${x.title}\n\n${body}` : "";
    })
    .filter(Boolean);
  if (extra.length) sections.push(["## Дополнительно", ...extra].join("\n\n"));

  sections.push(
    [
      "## Связанные компоненты",
      (doc.related ?? []).map((id) => `- \`${id}\``).join("\n") || "Нет.",
    ].join("\n\n"),
  );

  sections.push(
    ["## Открытые вопросы", [...todos].map((t) => `- ${t}`).join("\n") || "Нет."].join("\n\n"),
  );

  return sections.join("\n\n");
}

export function manualPart(readme: string | null): string {
  if (!readme) return MANUAL_STUB;
  const a = readme.indexOf(MANUAL_START);
  const b = readme.indexOf(MANUAL_END);
  if (a === -1 || b === -1 || b < a) return MANUAL_STUB;
  return readme.slice(a + MANUAL_START.length, b).trim() || MANUAL_STUB;
}

export function generatedPart(readme: string): string | null {
  const a = readme.indexOf(GEN_START);
  const b = readme.indexOf(GEN_END);
  if (a === -1 || b === -1 || b < a) return null;
  return readme.slice(a + GEN_START.length, b).trim();
}

export function composeReadme(
  doc: DocSpec,
  existing: string | null,
  components: string[] = [],
): string {
  return [
    GEN_START,
    renderGenerated(doc),
    GEN_END,
    "",
    "## Как использовать",
    "",
    ...(components.length ? [importsLine(components), ""] : []),
    MANUAL_START,
    manualPart(existing),
    MANUAL_END,
    "",
    LICENSE_LINE,
    "",
  ].join("\n");
}

export function countMarkers(readme: string, marker: string): number {
  return readme.split(marker).length - 1;
}
