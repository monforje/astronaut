/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
export type MdBlock =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "code"; lang: string; code: string }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "quote"; text: string }
  | { type: "rule" };

const FENCE = /^\s*```\s*([\w-]*)\s*$/;
const HEADING = /^(#{1,6})\s+(.*?)\s*#*\s*$/;
const ITEM = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
const TABLE_SEPARATOR = /^\s*\|?\s*:?-{1,}:?\s*(\|\s*:?-{1,}:?\s*)*\|?\s*$/;
const COMMENT = /<!--[\s\S]*?-->/g;

function splitRow(line: string): string[] {
  const body = line
    .trim()
    .replace(/^\|/, "")
    .replace(/(?<!\\)\|$/, "");
  return body.split(/(?<!\\)\|/).map((c) => c.trim().replaceAll("\\|", "|"));
}

const startsBlock = (line: string, next: string | undefined) =>
  FENCE.test(line) ||
  HEADING.test(line) ||
  ITEM.test(line) ||
  /^\s*>/.test(line) ||
  /^\s*(-{3,}|\*{3,})\s*$/.test(line) ||
  (line.includes("|") && next !== undefined && TABLE_SEPARATOR.test(next) && next.includes("-"));

export function parseMarkdown(source: string): MdBlock[] {
  const lines = source.replace(/\r\n?/g, "\n").replace(COMMENT, "").split("\n");
  const blocks: MdBlock[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "") {
      i++;
      continue;
    }
    const fence = FENCE.exec(line);
    if (fence) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) code.push(lines[i++]);
      i++;
      blocks.push({ type: "code", lang: fence[1], code: code.join("\n") });
      continue;
    }
    const heading = HEADING.exec(line);
    if (heading) {
      blocks.push({ type: "heading", level: heading[1].length, text: heading[2] });
      i++;
      continue;
    }
    if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) {
      blocks.push({ type: "rule" });
      i++;
      continue;
    }
    if (
      line.includes("|") &&
      TABLE_SEPARATOR.test(lines[i + 1] ?? "") &&
      (lines[i + 1] ?? "").includes("-")
    ) {
      const head = splitRow(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i].trim() !== "" && lines[i].includes("|")) {
        rows.push(splitRow(lines[i]));
        i++;
      }
      blocks.push({ type: "table", head, rows });
      continue;
    }
    const item = ITEM.exec(line);
    if (item) {
      const ordered = /\d/.test(item[2]);
      const items: string[] = [];
      while (i < lines.length) {
        const m = ITEM.exec(lines[i]);
        if (m && /\d/.test(m[2]) === ordered) {
          items.push(m[3]);
          i++;
        } else if (m) {
          break;
        } else if (/^\s+\S/.test(lines[i]) && items.length > 0) {
          items[items.length - 1] += ` ${lines[i].trim()}`;
          i++;
        } else {
          break;
        }
      }
      blocks.push({ type: "list", ordered, items });
      continue;
    }
    if (/^\s*>/.test(line)) {
      const quote: string[] = [];
      while (i < lines.length && /^\s*>/.test(lines[i]))
        quote.push(lines[i++].replace(/^\s*>\s?/, ""));
      blocks.push({ type: "quote", text: quote.join(" ") });
      continue;
    }
    const text: string[] = [line.trim()];
    i++;
    while (i < lines.length && lines[i].trim() !== "" && !startsBlock(lines[i], lines[i + 1])) {
      text.push(lines[i].trim());
      i++;
    }
    blocks.push({ type: "paragraph", text: text.join(" ") });
  }
  return blocks;
}

export type Inline =
  | { type: "text"; text: string }
  | { type: "code"; text: string }
  | { type: "bold"; children: Inline[] }
  | { type: "italic"; children: Inline[] }
  | { type: "link"; href: string; children: Inline[] };

const INLINE =
  /(`[^`\n]+`)|(\*\*[^*\n](?:[^\n]*?[^*\n])?\*\*)|(\*[^*\s](?:[^*\n]*[^*\s])?\*)|(\[[^\]\n]+\]\([^)\s]+\))/g;

const SAFE_HREF = /^(?:https?:\/\/|mailto:|\/|#|\.{0,2}\/)/i;

export const safeHref = (href: string): string | undefined =>
  SAFE_HREF.test(href) ? href : undefined;

export function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  let last = 0;
  for (const m of text.matchAll(INLINE)) {
    const at = m.index ?? 0;
    if (at > last) out.push({ type: "text", text: text.slice(last, at) });
    const [raw] = m;
    if (m[1]) out.push({ type: "code", text: raw.slice(1, -1) });
    else if (m[2]) out.push({ type: "bold", children: parseInline(raw.slice(2, -2)) });
    else if (m[3]) out.push({ type: "italic", children: parseInline(raw.slice(1, -1)) });
    else {
      const close = raw.indexOf("](");
      const href = safeHref(raw.slice(close + 2, -1));
      const label = parseInline(raw.slice(1, close));
      if (href) out.push({ type: "link", href, children: label });
      else out.push(...label);
    }
    last = at + raw.length;
  }
  if (last < text.length) out.push({ type: "text", text: text.slice(last) });
  return out;
}
