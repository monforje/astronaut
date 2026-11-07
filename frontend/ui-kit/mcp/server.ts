/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as z from "zod";
import { Kit, KIT_ROOT, KitError, STATUS_LABEL } from "./kit";
import {
  COMPONENT_SECTIONS,
  getChoreography,
  getComponent,
  getComponentSource,
  getDesignRules,
  getTokens,
  listComponents,
  search,
  TOKEN_KINDS,
} from "./tools";

const READ_ONLY = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};

const reply = (text: string, isError = false) => ({
  content: [{ type: "text" as const, text }],
  ...(isError ? { isError: true } : {}),
});

function run(fn: () => string) {
  try {
    return reply(fn());
  } catch (error) {
    if (error instanceof KitError) return reply(error.message, true);
    throw error;
  }
}

const text = (uri: URL, body: string, mimeType: string) => ({
  contents: [{ uri: uri.href, mimeType, text: body }],
});

export function createServer(root: string = KIT_ROOT): McpServer {
  const kit = new Kit(root);
  const server = new McpServer(
    { name: "astronaut-ui-kit", version: "0.1.0" },
    {
      instructions:
        "UI-кит Astronaut. Перед созданием интерфейса найдите готовый компонент (search, list_components), прочитайте get_component и импортируйте из @/ui. Не изобретайте компоненты и не копируйте стили из других фронтов. Общие правила: get_design_rules.",
    },
  );

  server.registerTool(
    "list_components",
    {
      title: "Список компонентов кита",
      description:
        'Список записей UI-кита по группам: id, название, статус (реализован / только спецификация / запланирован), описание и строка импорта `import { X } from "@/ui"`. Фильтры: group (id или название группы: actions, Поля), query (слова по названию, описанию, ключевым словам). Only read.',
      inputSchema: {
        group: z
          .string()
          .optional()
          .describe(
            "id или название группы: base, actions, fields, tables, navigation, feedback, overlays, people, time, data",
          ),
        query: z
          .string()
          .optional()
          .describe("слова для фильтра, например «таблица» или «модальное»"),
      },
      annotations: { ...READ_ONLY, title: "Список компонентов кита" },
    },
    (args) => run(() => listComponents(kit, args)),
  );

  server.registerTool(
    "get_component",
    {
      title: "Описание компонента",
      description:
        "README компонента кита. По умолчанию: «Как использовать» (импорт, примеры), пропсы и доступность. sections выбирает части: usage, props, variants, anatomy, rules, states, tokens, a11y, choreography, examples, open или all. Читайте перед использованием компонента. Only read.",
      inputSchema: {
        id: z.string().min(1).describe("id компонента: button, select, data-table"),
        sections: z
          .array(z.enum([...COMPONENT_SECTIONS, "all"]))
          .optional()
          .describe("какие части вернуть; по умолчанию usage, props, a11y"),
      },
      annotations: { ...READ_ONLY, title: "Описание компонента" },
    },
    (args) => run(() => getComponent(kit, args)),
  );

  server.registerTool(
    "get_component_source",
    {
      title: "Исходники компонента",
      description:
        "Исходники реализованного компонента: Name.tsx, name.css, index.ts и соседние файлы (без тестов, demo, doc и force-css). file задаёт один файл папки, в том числе тест или demo. Для понимания API и копирования приёмов внутрь кита. Only read.",
      inputSchema: {
        id: z.string().min(1).describe("id компонента"),
        file: z
          .string()
          .optional()
          .describe("имя одного файла из папки компонента, например Button.test.tsx"),
      },
      annotations: { ...READ_ONLY, title: "Исходники компонента" },
    },
    (args) => run(() => getComponentSource(kit, args)),
  );

  server.registerTool(
    "search",
    {
      title: "Поиск по киту",
      description:
        "Поиск компонента по названию, ключевым словам, описанию и README; учитывает русские слова и окончания («тост», «чипы», «выпадающий список»). Возвращает лучшие совпадения с id и импортом. Only read.",
      inputSchema: {
        query: z
          .string()
          .min(1)
          .describe("что нужно: «уведомление», «таблица грузов», «модальное окно»"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(30)
          .optional()
          .describe("сколько результатов, по умолчанию 8"),
      },
      annotations: { ...READ_ONLY, title: "Поиск по киту" },
    },
    (args) => run(() => search(kit, args)),
  );

  server.registerTool(
    "get_tokens",
    {
      title: "Токены дизайн-системы",
      description:
        "Токены из src/styles/tokens.css в таблицах: значение в светлой и тёмной теме и назначение. kind: colors, typography, radii, sizes, state-layers, shadows, motion или all (по умолчанию). Цвет в css берут ролью `var(--text)`, не HEX. Only read.",
      inputSchema: {
        kind: z.enum(TOKEN_KINDS).optional().describe("вид токенов; по умолчанию all"),
      },
      annotations: { ...READ_ONLY, title: "Токены дизайн-системы" },
    },
    (args) => run(() => getTokens(kit, args)),
  );

  server.registerTool(
    "get_design_rules",
    {
      title: "Общие правила дизайна",
      description:
        "Общие правила дизайн-системы: нет левых акцентных линий, цифры без моно, пара кнопок 50/50, Dialog без крестика, аватары плоские, анимации только из brand/animated, контраст. topic фильтрует по слову («кнопки», «контраст», «анимации»). Only read.",
      inputSchema: {
        topic: z.string().optional().describe("тема или слово; без него вернутся все правила"),
      },
      annotations: { ...READ_ONLY, title: "Общие правила дизайна" },
    },
    (args) => run(() => getDesignRules(kit, args)),
  );

  server.registerTool(
    "get_choreography",
    {
      title: "Хореография компонента",
      description:
        "Сценарии движения компонента: триггер, шаги с таймингами (at, dur, easing), фокус, reduced motion, соседи. scenario сужает до одного сценария по id или названию. Only read.",
      inputSchema: {
        id: z.string().min(1).describe("id компонента"),
        scenario: z.string().optional().describe("часть id или названия сценария, например sort"),
      },
      annotations: { ...READ_ONLY, title: "Хореография компонента" },
    },
    (args) => run(() => getChoreography(kit, args)),
  );

  server.registerResource(
    "llms",
    "uikit://llms.txt",
    { title: "llms.txt", description: "Список компонентов по группам", mimeType: "text/plain" },
    (uri) => text(uri, kit.readGenerated("llms.txt"), "text/plain"),
  );

  server.registerResource(
    "llms-full",
    "uikit://llms-full.txt",
    {
      title: "llms-full.txt",
      description: "Общие правила и README всех компонентов",
      mimeType: "text/plain",
    },
    (uri) => text(uri, kit.readGenerated("llms-full.txt"), "text/plain"),
  );

  server.registerResource(
    "component",
    new ResourceTemplate("uikit://component/{id}", {
      list: () => ({
        resources: kit
          .entries()
          .filter((e) => kit.readme(e.id) !== null)
          .map((e) => ({
            uri: `uikit://component/${e.id}`,
            name: e.title,
            description: `${STATUS_LABEL[e.status]}: ${e.summary}`,
            mimeType: "text/markdown",
          })),
      }),
    }),
    { title: "README компонента", mimeType: "text/markdown" },
    (uri, variables) => {
      const id = String(variables.id).toLowerCase();
      const readme = kit.readme(id);
      if (readme === null || !kit.find(id)) throw new KitError(`Нет README компонента «${id}».`);
      return text(uri, readme, "text/markdown");
    },
  );

  return server;
}
