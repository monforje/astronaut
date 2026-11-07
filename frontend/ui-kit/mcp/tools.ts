/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import {
  fold,
  importLine,
  Kit,
  KitError,
  LICENSE_LINE,
  packageImportLine,
  queryTokens,
  splitReadme,
  splitSections,
  STATUS_LABEL,
  textBlocks,
  words,
  wordMatch,
  type Entry,
} from "./kit";

export const COMPONENT_SECTIONS = [
  "usage",
  "props",
  "variants",
  "anatomy",
  "rules",
  "states",
  "tokens",
  "a11y",
  "choreography",
  "examples",
  "open",
] as const;

export type ComponentSection = (typeof COMPONENT_SECTIONS)[number];

export const DEFAULT_SECTIONS: ComponentSection[] = ["usage", "props", "a11y"];

export const TOKEN_KINDS = [
  "colors",
  "typography",
  "radii",
  "sizes",
  "state-layers",
  "shadows",
  "motion",
  "all",
] as const;

export type TokenKind = (typeof TOKEN_KINDS)[number];

const GENERATED_HEADING: Partial<Record<ComponentSection, string>> = {
  rules: "Когда использовать / не использовать",
  anatomy: "Анатомия",
  variants: "Варианты",
  states: "Состояния",
  tokens: "Размеры и токены",
  a11y: "Доступность",
  choreography: "Хореография",
  examples: "Примеры",
  open: "Открытые вопросы",
};

const MANUAL_STUB_MARK = "[TODO] код компонента появится";

const similar = (kit: Kit, id: string): string[] =>
  rank(kit, id, 3)
    .filter((hit) => hit.where.length > 0)
    .map((hit) => hit.entry.id);

function requireEntry(kit: Kit, rawId: string): Entry {
  const id = rawId.trim().toLowerCase();
  const entry = kit.find(id);
  if (entry) return entry;
  const hints = similar(kit, id).map((s) => `\`${s}\``);
  throw new KitError(
    `Нет компонента «${rawId}». ${hints.length ? `Похожие: ${hints.join(", ")}.` : "Похожих нет."} Полный список: list_components, поиск: search.`,
  );
}

function requireReadme(kit: Kit, entry: Entry): string {
  const readme = kit.readme(entry.id);
  if (readme === null) {
    throw new KitError(
      `У «${entry.id}» нет README.md (${STATUS_LABEL[entry.status]}). Спецификации нет: компонент не использовать.`,
    );
  }
  return readme;
}

const header = (entry: Entry): string => {
  const imp = importLine(entry);
  const pkg = packageImportLine(entry);
  return [
    `# ${entry.title}`,
    `\`${entry.id}\` · ${entry.groupTitle} · ${STATUS_LABEL[entry.status]}`,
    imp ? `Импорт в ките: \`${imp}\`` : "",
    pkg ? `Импорт в приложении (пакет, нужен \`@astronaut/ui-kit/styles.css\`): \`${pkg}\`` : "",
    entry.summary ? `> ${entry.summary}` : "",
  ]
    .filter(Boolean)
    .join("\n");
};

export function listComponents(kit: Kit, args: { group?: string; query?: string }): string {
  let entries = kit.entries();
  const groups = kit.groups();
  if (args.group) {
    const wanted = fold(args.group.trim());
    const hit = groups.find(([id, title]) => id === wanted || fold(title) === wanted);
    if (!hit) {
      const list = groups.map(([id, title]) => `\`${id}\` (${title})`).join(", ");
      throw new KitError(`Нет группы «${args.group}». Группы: ${list}.`);
    }
    entries = entries.filter((e) => e.group === hit[0]);
  }
  if (args.query?.trim()) {
    const ids = new Set(rank(kit, args.query, 200, entries).map((hit) => hit.entry.id));
    entries = entries.filter((e) => ids.has(e.id));
  }
  if (!entries.length) return "Ничего не найдено. Уберите фильтры или вызовите search.";

  const lines: string[] = [];
  let group = "";
  for (const e of entries) {
    if (e.groupTitle !== group) {
      group = e.groupTitle;
      lines.push("", `## ${group}`);
    }
    const imp = importLine(e);
    const pkg = packageImportLine(e);
    lines.push(
      `- \`${e.id}\` **${e.title}** [${STATUS_LABEL[e.status]}]: ${e.summary}${imp ? ` Импорт в ките: \`${imp}\`; в приложении: \`${pkg}\`.` : ""}`,
    );
  }
  const implemented = entries.filter((e) => e.status === "implemented").length;
  return [
    `Записей: ${entries.length}, реализовано (в ките @/ui, в приложении @astronaut/ui-kit): ${implemented}.`,
    ...lines,
  ].join("\n");
}

interface UsageParts {
  usage: string;
  props: string;
  a11y: string;
}

const isPropsTable = (b: string) => /^\|\s*`?Проп/i.test(b);
const isPlain = (b: string) => !b.startsWith("|") && !b.startsWith("```");

export function splitManual(manual: string): UsageParts {
  const blocks = textBlocks(manual);
  const a11yAt = blocks.findIndex((b, i) => /^Доступность\b/.test(b) && !isPropsTable(blocks[i]));
  const body = a11yAt === -1 ? blocks : blocks.slice(0, a11yAt);
  const a11y = a11yAt === -1 ? [] : blocks.slice(a11yAt);

  const propIndexes = new Set<number>();
  body.forEach((b, i) => {
    if (!isPropsTable(b)) return;
    propIndexes.add(i);
    if (i > 0 && isPlain(body[i - 1]) && /пропс/i.test(body[i - 1])) propIndexes.add(i - 1);
  });
  return {
    usage: body.filter((_, i) => !propIndexes.has(i)).join("\n\n"),
    props: body.filter((_, i) => propIndexes.has(i)).join("\n\n"),
    a11y: a11y.join("\n\n"),
  };
}

export function getComponent(
  kit: Kit,
  args: { id: string; sections?: (ComponentSection | "all")[] },
): string {
  const entry = requireEntry(kit, args.id);
  if (entry.status === "planned") {
    return [
      header(entry),
      "Спецификации и реализации ещё нет. Не изобретайте компонент: запишите потребность в [TODO] или предложите добавить запись в кит.",
    ].join("\n\n");
  }
  const readme = requireReadme(kit, entry);
  const { generated, manual } = splitReadme(readme);
  const generatedSections = splitSections(generated);
  const manualParts = splitManual(manual);

  const requested = args.sections?.length ? args.sections : DEFAULT_SECTIONS;
  const wanted = new Set<ComponentSection>(
    requested.includes("all") ? COMPONENT_SECTIONS : (requested as ComponentSection[]),
  );

  const parts: string[] = [header(entry)];
  if (entry.status === "spec") {
    parts.push(
      "> Компонент не реализован ни в `@/ui`, ни в `@astronaut/ui-kit`: это только спецификация. Не импортируйте его и не копируйте стили из demo-site и landing.",
    );
  }
  const generatedBlock = (section: ComponentSection): string | null => {
    const title = GENERATED_HEADING[section];
    const body = title ? generatedSections.get(title) : undefined;
    return body ? `## ${title}\n\n${body}` : null;
  };

  for (const section of COMPONENT_SECTIONS) {
    if (!wanted.has(section)) continue;
    if (section === "usage") {
      const stub = manualParts.usage.includes(MANUAL_STUB_MARK) || !manualParts.usage;
      parts.push(
        stub
          ? '## Как использовать\n\nРучного раздела ещё нет ([TODO] в README): ориентируйтесь на спецификацию (`sections: ["all"]`).'
          : `## Как использовать\n\n${manualParts.usage}`,
      );
    } else if (section === "props") {
      if (manualParts.props) parts.push(`## Пропсы\n\n${manualParts.props}`);
      else if (wanted.size === 1)
        parts.push("Отдельной таблицы пропсов в README нет: см. `usage` и `get_component_source`.");
    } else if (section === "a11y") {
      const gen = generatedBlock("a11y");
      const own = manualParts.a11y ? `### В реализации\n\n${manualParts.a11y}` : "";
      parts.push([gen, own].filter(Boolean).join("\n\n") || "## Доступность\n\nНет данных.");
    } else {
      parts.push(generatedBlock(section) ?? `## ${GENERATED_HEADING[section]}\n\nНет данных.`);
    }
  }
  return parts.join("\n\n");
}

export function getChoreography(kit: Kit, args: { id: string; scenario?: string }): string {
  const entry = requireEntry(kit, args.id);
  const readme = entry.status === "planned" ? null : requireReadme(kit, entry);
  const body = readme
    ? splitSections(splitReadme(readme).generated).get(GENERATED_HEADING.choreography ?? "")
    : undefined;
  if (!body || body === "Нет.") {
    return `${header(entry)}\n\nСценариев хореографии нет. Анимации только из токенов \`--dur-f/--dur/--dur-s\`, \`--ease\`, \`--glide\` и с блоком \`prefers-reduced-motion\` (см. get_design_rules).`;
  }
  const scenarios = body.split(/^(?=### )/m).filter((s) => s.startsWith("### "));
  const picked = args.scenario
    ? scenarios.filter((s) => fold(s.split("\n", 1)[0]).includes(fold(args.scenario ?? "")))
    : scenarios;
  if (!picked.length) {
    const ids = scenarios.map((s) => s.split("\n", 1)[0].slice(4)).join("; ");
    throw new KitError(`Нет сценария «${args.scenario}» у ${entry.id}. Есть: ${ids}.`);
  }
  return [`# ${entry.title}: хореография`, ...picked.map((s) => s.trim())].join("\n\n");
}

const SOURCE_SKIP = /^(README\.md|doc\.tsx|demo\.tsx)$|\.test\.tsx?$|\.force\.css$/;

const FENCE_LANG: Record<string, string> = { tsx: "tsx", ts: "ts", css: "css", md: "md" };

export function getComponentSource(kit: Kit, args: { id: string; file?: string }): string {
  const entry = requireEntry(kit, args.id);
  const all = kit.sourceFiles(entry.id);
  if (!all.includes("index.ts")) {
    throw new KitError(
      `У «${entry.id}» нет реализации (${STATUS_LABEL[entry.status]}): исходников нет. Спецификация: get_component.`,
    );
  }
  let files = all.filter((f) => !SOURCE_SKIP.test(f));
  if (args.file) {
    const name = args.file.trim();
    if (!all.includes(name)) {
      throw new KitError(`Нет файла «${name}» в src/entries/${entry.id}. Есть: ${all.join(", ")}.`);
    }
    files = [name];
  }
  const blocks = files.map((f) => {
    const text = (kit.read(`${kit.entriesDir}/${entry.id}/${f}`) ?? "").trimEnd();
    const lang = FENCE_LANG[f.split(".").pop() ?? ""] ?? "";
    return `### src/entries/${entry.id}/${f} (${text.split("\n").length} строк)\n\n\`\`\`${lang}\n${text}\n\`\`\``;
  });
  const hidden = all.filter((f) => !files.includes(f));
  const tail =
    args.file || !hidden.length
      ? ""
      : `\nНе показаны (запросите через file): ${hidden.join(", ")}.`;
  return [header(entry), ...blocks].join("\n\n") + tail;
}

interface Hit {
  entry: Entry;
  score: number;
  where: string[];
}

function rank(kit: Kit, query: string, limit: number, pool: Entry[] = kit.entries()): Hit[] {
  const tokens = queryTokens(query);
  if (!tokens.length) return [];
  const scored = pool.map((entry) => {
    const readme = kit.readme(entry.id);
    const fields: [string, number, string[]][] = [
      ["название", 10, words(`${entry.title} ${entry.id.replaceAll("-", " ")}`)],
      ["ключевые слова", 6, words(entry.keywords.join(" "))],
      ["описание", 4, words(entry.summary)],
      ["README", 1, readme ? [...new Set(words(readme))] : []],
    ];
    const where = new Set<string>();
    const perToken = tokens.map((token) => {
      let best = 0;
      for (const [name, weight, list] of fields) {
        let tier = 0;
        for (const word of list) tier = Math.max(tier, wordMatch(word, token));
        if (tier && weight * tier > best) best = weight * tier;
        if (tier && weight > 1) where.add(name);
      }
      return best;
    });
    return { entry, perToken, where: [...where] };
  });
  const all = scored.filter((s) => s.perToken.every((p) => p > 0));
  const matched = all.length ? all : scored.filter((s) => s.perToken.some((p) => p > 0));
  return matched
    .map((s) => ({
      entry: s.entry,
      score: s.perToken.reduce((a, b) => a + b, 0),
      where: s.where,
    }))
    .toSorted((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title))
    .slice(0, limit);
}

export function search(kit: Kit, args: { query: string; limit?: number }): string {
  const limit = Math.min(Math.max(args.limit ?? 8, 1), 30);
  const hits = rank(kit, args.query, limit);
  if (!hits.length) {
    return `По запросу «${args.query}» ничего нет. Если компонента нет в ките, не изобретайте его: запишите [TODO] и предложите добавить запись (см. skill ui-kit). Весь список: list_components.`;
  }
  const lines = hits.map(({ entry, where }) => {
    const imp = importLine(entry);
    return `- \`${entry.id}\` **${entry.title}** (${entry.groupTitle}, ${STATUS_LABEL[entry.status]}): ${entry.summary}${imp ? ` \`${imp}\`` : ""}${where.length ? ` [совпало: ${where.join(", ")}]` : ""}`;
  });
  return [`Найдено: ${hits.length}. Подробности: get_component.`, ...lines].join("\n");
}

interface Token {
  name: string;
  light: string;
  dark: string | undefined;
}

const TOKEN_KIND_TITLE: Record<Exclude<TokenKind, "all">, string> = {
  colors: "Цвета (роли)",
  typography: "Типографика",
  radii: "Радиусы",
  sizes: "Размеры",
  "state-layers": "Слои состояний",
  shadows: "Тени",
  motion: "Движение",
};

function kindOf(name: string): Exclude<TokenKind, "all"> {
  if (name.startsWith("--r-")) return "radii";
  if (/^--[hw]-/.test(name)) return "sizes";
  if (/^--(fs-|font$|mono$)/.test(name)) return "typography";
  if (name.startsWith("--shadow-")) return "shadows";
  if (/^--(layer-|tone$|ink$)/.test(name)) return "state-layers";
  if (/^--(dur|ease|glide)/.test(name)) return "motion";
  return "colors";
}

export function parseTokens(css: string): Token[] {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const light = new Map<string, string>();
  const dark = new Map<string, string>();
  for (const block of clean.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const target = /data-theme="dark"/.test(block[1]) ? dark : light;
    for (const d of block[2].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      target.set(d[1], d[2].trim().replace(/\s+/g, " "));
    }
  }
  return [...light].map(([name, value]) => ({ name, light: value, dark: dark.get(name) }));
}

function tokenPurposes(kit: Kit): Map<string, string> {
  const purposes = new Map<string, string>();
  for (const entry of kit.entries()) {
    if (entry.status !== "foundation") continue;
    const readme = kit.readme(entry.id);
    if (readme === null) continue;
    for (const line of splitReadme(readme).generated.split("\n")) {
      if (!line.startsWith("| `")) continue;
      const cells = line.split(/(?<!\\)\|/).map((c) => c.trim());
      const purpose = cells[3];
      if (!purpose) continue;
      for (const m of cells[1].matchAll(/--[\w-]+/g)) {
        if (!purposes.has(m[0])) purposes.set(m[0], purpose);
      }
    }
  }
  return purposes;
}

const cell = (s: string) => `\`${s.replaceAll("|", "\\|")}\``;

export function getTokens(kit: Kit, args: { kind?: TokenKind }): string {
  const kind = args.kind ?? "all";
  const tokens = parseTokens(kit.readTokensCss());
  const purposes = tokenPurposes(kit);
  const kinds = (kind === "all" ? Object.keys(TOKEN_KIND_TITLE) : [kind]) as Exclude<
    TokenKind,
    "all"
  >[];
  const sections = kinds
    .map((k) => {
      const rows = tokens
        .filter((t) => kindOf(t.name) === k)
        .map(
          (t) =>
            `| ${cell(t.name)} | ${cell(t.light)} | ${t.dark ? cell(t.dark) : "то же"} | ${purposes.get(t.name) ?? "—"} |`,
        );
      if (!rows.length) return "";
      return [
        `## ${TOKEN_KIND_TITLE[k]}`,
        "| Токен | Светлая тема | Тёмная тема | Назначение |",
        "| --- | --- | --- | --- |",
        ...rows,
      ].join("\n");
    })
    .filter(Boolean);
  if (!sections.length) throw new KitError("В tokens.css нет токенов этого вида.");
  return [
    "Цвета в css компонентов берут ролью: `var(--text)`, без HEX. Источник: src/styles/tokens.css; назначение: страницы «Основа» (colors, typography, radii-sizes, state-layers).",
    ...sections,
  ].join("\n\n");
}

export function getDesignRules(kit: Kit, args: { topic?: string }): string {
  const text = kit.readRules().replace(LICENSE_LINE, "").trim();
  const sections = text.split(/^(?=### )/m);
  const intro = sections[0].trim();
  const body = sections.slice(1);
  const topic = args.topic?.trim();
  if (!topic) return [intro, ...body.map((s) => s.trim())].join("\n\n");

  const tokens = queryTokens(topic);
  const matches = (s: string) => {
    const list = words(s);
    return tokens.every((t) => list.some((w) => wordMatch(w, t) > 0));
  };
  const picked: string[] = [];
  for (const section of body) {
    const [heading, ...lines] = section.trim().split("\n");
    if (matches(heading)) {
      picked.push(section.trim());
      continue;
    }
    const bullets = lines.filter((l) => l.startsWith("- ") && matches(l));
    if (bullets.length) picked.push([heading, "", ...bullets].join("\n"));
  }
  if (!picked.length) {
    const headings = body.map((s) => s.split("\n", 1)[0].slice(4)).join(", ");
    throw new KitError(
      `По теме «${topic}» правил нет. Разделы: ${headings}. Без topic вернутся все правила.`,
    );
  }
  return picked.join("\n\n");
}
