/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
export type Lang = "tsx" | "ts" | "css" | "bash" | "json" | "text";

export type TokenType =
  | "comment"
  | "string"
  | "keyword"
  | "number"
  | "type"
  | "fn"
  | "prop"
  | "tag"
  | "punct"
  | "plain";

export interface Token {
  type: TokenType;
  text: string;
}

export const LANG_LABEL: Record<Lang, string> = {
  tsx: "TSX",
  ts: "TypeScript",
  css: "CSS",
  bash: "Bash",
  json: "JSON",
  text: "Текст",
};

const ALIASES: Record<string, Lang> = {
  tsx: "tsx",
  jsx: "tsx",
  ts: "ts",
  typescript: "ts",
  js: "ts",
  javascript: "ts",
  css: "css",
  bash: "bash",
  sh: "bash",
  shell: "bash",
  json: "json",
};

export function langOf(name: string | undefined): Lang {
  return ALIASES[(name ?? "").trim().toLowerCase()] ?? "text";
}

const CSS_DECLARATION = /(?:^|[{;])\s*(?:--[\w-]+|[a-z-]+)\s*:\s*[^;{}]+;/m;
const CSS_RULE = /^\s*(?:@[\w-]+[^{]*|[.#:*[a-z][^{};]*)\{/m;
const CSS_FOREIGN = /\b(?:import|export|const|let|function|return)\b|=>|<\/?[A-Za-z][\w.]*[\s/>]/;
const SHELL_LINE = /^\s*(?:\$\s|(?:task|bun|bunx|npm|npx|git|cd|ls)\s)/;

export function detectLang(code: string, declared?: Lang): Lang {
  if (declared && declared !== "tsx" && declared !== "ts") return declared;
  if (CSS_RULE.test(code) && CSS_DECLARATION.test(code) && !CSS_FOREIGN.test(code)) return "css";
  if (
    declared === undefined &&
    code.split("\n").every((l) => l.trim() === "" || SHELL_LINE.test(l))
  ) {
    return "bash";
  }
  return declared ?? "tsx";
}

type Rule = readonly [TokenType, RegExp];

const sticky = (source: string) => new RegExp(source, "y");

const KEYWORDS =
  "import|export|from|const|let|var|function|return|if|else|for|while|switch|case|break|continue|default|new|typeof|instanceof|as|type|interface|extends|implements|async|await|class|true|false|null|undefined|void|in|of|throw|try|catch|finally|readonly|satisfies|keyof|enum|static|public|private";

const STRINGS = String.raw`"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|` + "`(?:\\\\.|[^`\\\\])*`";

const TS_RULES: Rule[] = [
  ["comment", sticky(String.raw`//[^\n]*|/\*[\s\S]*?(?:\*/|$)`)],
  ["string", sticky(STRINGS)],
  ["keyword", sticky(String.raw`\b(?:${KEYWORDS})\b`)],
  ["number", sticky(String.raw`\b\d[\d_]*(?:\.\d+)?\b`)],
  ["fn", sticky(String.raw`[A-Za-z_$][\w$]*(?=\s*\()`)],
  ["type", sticky(String.raw`\b[A-Z][A-Za-z0-9_]*\b`)],
  ["plain", sticky(String.raw`[A-Za-z_$][\w$]*`)],
  ["punct", sticky(String.raw`=>|[{}()[\];,.<>=+\-*/%!&|?:^~@]`)],
];

const CSS_RULES: Rule[] = [
  ["comment", sticky(String.raw`/\*[\s\S]*?(?:\*/|$)`)],
  ["string", sticky(STRINGS)],
  ["keyword", sticky(String.raw`@[\w-]+|!important`)],
  [
    "number",
    sticky(String.raw`#[0-9a-fA-F]{3,8}\b|-?(?:\d*\.)?\d+(?:px|rem|em|%|ms|s|vh|vw|deg|fr|ch)?\b`),
  ],
  ["prop", sticky(String.raw`--[\w-]+`)],
  ["fn", sticky(String.raw`[A-Za-z_-][\w-]*(?=\()`)],
  ["type", sticky(String.raw`[.#][A-Za-z_][\w-]*`)],
  ["plain", sticky(String.raw`[A-Za-z_-][\w-]*`)],
  ["punct", sticky(String.raw`[{}()[\];,:>+~*=]`)],
];

const JSON_RULES: Rule[] = [
  ["prop", sticky(String.raw`"(?:\\.|[^"\\\n])*"(?=\s*:)`)],
  ["string", sticky(String.raw`"(?:\\.|[^"\\\n])*"`)],
  ["number", sticky(String.raw`-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b`)],
  ["keyword", sticky(String.raw`\b(?:true|false|null)\b`)],
  ["punct", sticky(String.raw`[{}[\]:,]`)],
];

function scanOne(src: string, i: number, rules: Rule[]): Token {
  for (const [kind, re] of rules) {
    re.lastIndex = i;
    const m = re.exec(src);
    if (m && m[0].length > 0) return { type: kind, text: m[0] };
  }
  const ws = /^\s+/.exec(src.slice(i, i + 256));
  return { type: "plain", text: ws ? ws[0] : src[i] };
}

function scan(src: string, rules: Rule[]): Token[] {
  const out: Token[] = [];
  let i = 0;
  while (i < src.length) {
    const t = scanOne(src, i, rules);
    out.push(t);
    i += t.text.length;
  }
  return out;
}

const JSX_TAG = sticky(String.raw`</?(?:[A-Za-z][\w.]*)?`);
const JSX_ATTR = sticky(String.raw`[A-Za-z_][\w:-]*`);

function tokenizeTs(src: string, jsx: boolean): Token[] {
  const out: Token[] = [];
  let inTag = false;
  let depth = 0;
  let i = 0;
  const emit = (t: Token) => {
    out.push(t);
    i += t.text.length;
  };
  while (i < src.length) {
    const ch = src[i];
    const markup = inTag && depth === 0;
    if (jsx && !inTag && ch === "<" && (i === 0 || !/[\w)\]]/.test(src[i - 1]))) {
      JSX_TAG.lastIndex = i;
      const m = JSX_TAG.exec(src);
      if (m && (m[0].replace(/^<\/?/, "") !== "" || src[i + m[0].length] === ">")) {
        const name = m[0].replace(/^<\/?/, "");
        emit({ type: "punct", text: name ? m[0].slice(0, m[0].length - name.length) : m[0] });
        if (name) {
          emit({ type: "tag", text: name });
          inTag = true;
        }
        continue;
      }
    }
    if (markup) {
      if (src.startsWith("/>", i)) {
        emit({ type: "punct", text: "/>" });
        inTag = false;
        continue;
      }
      if (ch === ">") {
        emit({ type: "punct", text: ">" });
        inTag = false;
        continue;
      }
      JSX_ATTR.lastIndex = i;
      const m = JSX_ATTR.exec(src);
      if (m) {
        emit({ type: "prop", text: m[0] });
        continue;
      }
      if (ch === "{") depth++;
      if (ch !== '"' && ch !== "'") {
        emit({ type: /\s/.test(ch) ? "plain" : "punct", text: ch });
        continue;
      }
    } else if (inTag) {
      if (ch === "{") depth++;
      if (ch === "}") depth--;
    }
    emit(scanOne(src, i, TS_RULES));
  }
  return out;
}

function tokenizeCss(src: string): Token[] {
  let depth = 0;
  const all = scan(src, CSS_RULES);
  const significant = all.map((t, idx) => ({ t, idx })).filter((x) => x.t.text.trim() !== "");
  const nextOf = new Map(significant.map((x, k) => [x.idx, significant[k + 1]?.t]));
  return all.map((t, idx) => {
    if (t.type === "punct") {
      if (t.text === "{") depth++;
      if (t.text === "}") depth = Math.max(0, depth - 1);
    }
    const next = nextOf.get(idx);
    if (t.type === "plain" && depth > 0 && next?.type === "punct" && next.text === ":") {
      return { type: "prop" as const, text: t.text };
    }
    return t;
  });
}

function tokenizeBash(src: string): Token[] {
  const out: Token[] = [];
  let expectCmd = true;
  const re = sticky(
    String.raw`(?<comment>#[^\n]*)|(?<string>"(?:\\.|[^"\\])*"|'[^']*')|(?<variable>\$\{?[\w@#?*]+\}?)|(?<flag>--?[A-Za-z][\w-]*)|(?<op>&&|\|\||[|;&<>]+)|(?<nl>\n)|(?<space>[ \t]+)|(?<word>[^\s"'|&;<>$#]+)`,
  );
  let i = 0;
  while (i < src.length) {
    re.lastIndex = i;
    const m = re.exec(src);
    if (!m || !m.groups) {
      out.push({ type: "plain", text: src[i] });
      i++;
      continue;
    }
    const g = m.groups;
    const text = m[0];
    if (g.comment && (i === 0 || /\s/.test(src[i - 1]))) out.push({ type: "comment", text });
    else if (g.comment) out.push({ type: "plain", text });
    else if (g.string) out.push({ type: "string", text });
    else if (g.variable) out.push({ type: "prop", text });
    else if (g.flag) out.push({ type: "keyword", text });
    else if (g.op) {
      out.push({ type: "punct", text });
      expectCmd = true;
    } else if (g.nl) {
      out.push({ type: "plain", text });
      expectCmd = true;
    } else if (g.space) out.push({ type: "plain", text });
    else if (g.word) {
      if (expectCmd && !/^\d/.test(text)) {
        out.push({ type: "fn", text });
        expectCmd = false;
      } else if (/^\d+(?:\.\d+)?$/.test(text)) out.push({ type: "number", text });
      else out.push({ type: "plain", text });
    }
    i += text.length;
  }
  return out;
}

function merge(tokens: Token[]): Token[] {
  const out: Token[] = [];
  for (const t of tokens) {
    const last = out[out.length - 1];
    if (last && last.type === t.type && (t.type === "plain" || t.type === "punct"))
      last.text += t.text;
    else out.push({ ...t });
  }
  return out;
}

export function tokenize(code: string, lang: Lang): Token[] {
  if (code === "") return [];
  switch (lang) {
    case "tsx":
      return merge(tokenizeTs(code, true));
    case "ts":
      return merge(tokenizeTs(code, false));
    case "css":
      return merge(tokenizeCss(code));
    case "bash":
      return merge(tokenizeBash(code));
    case "json":
      return merge(scan(code, JSON_RULES));
    default:
      return [{ type: "plain", text: code }];
  }
}

export function tokenizeLines(code: string, lang: Lang): Token[][] {
  const lines: Token[][] = [[]];
  for (const t of tokenize(code, lang)) {
    const parts = t.text.split("\n");
    parts.forEach((part, k) => {
      if (k > 0) lines.push([]);
      if (part !== "") lines[lines.length - 1].push({ type: t.type, text: part });
    });
  }
  return lines;
}
