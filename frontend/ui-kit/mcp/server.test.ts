/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Kit, splitReadme } from "./kit";
import { createServer } from "./server";
import { getComponent, getComponentSource, splitManual } from "./tools";

const kit = new Kit();
let client: Client;

const callText = async (name: string, args: Record<string, unknown> = {}) => {
  const result = await client.callTool({ name, arguments: args });
  const content = result.content as { type: string; text: string }[];
  return { text: content.map((c) => c.text).join("\n"), isError: result.isError === true };
};

beforeAll(async () => {
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
  client = new Client({ name: "test", version: "0.0.0" });
  await Promise.all([createServer().connect(serverSide), client.connect(clientSide)]);
});

afterAll(async () => {
  await client.close();
});

describe("MCP-сервер кита: протокол", () => {
  it("initialize: имя сервера и инструкции", () => {
    expect(client.getServerVersion()?.name).toBe("astronaut-ui-kit");
    expect(client.getInstructions()).toContain("get_component");
  });

  it("tools/list: семь инструментов, все только для чтения и со схемой", async () => {
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).toSorted()).toEqual([
      "get_choreography",
      "get_component",
      "get_component_source",
      "get_design_rules",
      "get_tokens",
      "list_components",
      "search",
    ]);
    for (const tool of tools) {
      expect(tool.annotations?.readOnlyHint, tool.name).toBe(true);
      expect(tool.inputSchema.type, tool.name).toBe("object");
    }
  });

  it("resources: llms.txt, llms-full.txt и README компонента", async () => {
    const { resources } = await client.listResources();
    const uris = resources.map((r) => r.uri);
    expect(uris).toContain("uikit://llms.txt");
    expect(uris).toContain("uikit://llms-full.txt");
    expect(uris).toContain("uikit://component/button");
    const readme = await client.readResource({ uri: "uikit://component/button" });
    expect(JSON.stringify(readme.contents[0])).toContain("# Button");
    const llms = await client.readResource({ uri: "uikit://llms.txt" });
    expect(JSON.stringify(llms.contents[0])).toContain("# Astronaut UI-кит");
  });
});

describe("MCP-сервер кита: инструменты", () => {
  it("list_components: группы, статусы и импорт", async () => {
    const { text, isError } = await callText("list_components");
    expect(isError).toBe(false);
    expect(text).toContain("## Действия");
    expect(text).toContain("`button` **Button** [реализован]");
    expect(text).toContain('import { Button, ButtonGroup, LinkButton } from "@/ui"');
  });

  it("list_components: фильтр по группе и запросу, неизвестная группа — ошибка", async () => {
    const fields = await callText("list_components", { group: "fields" });
    expect(fields.text).toContain("`select`");
    expect(fields.text).not.toContain("`button`");
    const named = await callText("list_components", { group: "Поля", query: "выбор" });
    expect(named.text).toContain("`select`");
    const bad = await callText("list_components", { group: "нет-такой" });
    expect(bad.isError).toBe(true);
    expect(bad.text).toContain("Группы:");
  });

  it("get_component {id: button}: как использовать, пропсы, доступность", async () => {
    const { text, isError } = await callText("get_component", { id: "button" });
    expect(isError).toBe(false);
    expect(text).toContain("# Button");
    expect(text).toContain('import { Button, ButtonGroup, LinkButton } from "@/ui"');
    expect(text).toContain("## Как использовать");
    expect(text).toContain("## Пропсы");
    expect(text).toContain("| `variant`");
    expect(text).toContain("## Доступность");
    expect(text).not.toContain("## Хореография");
  });

  it("get_component: sections выбирает части, all отдаёт всё", async () => {
    const one = await callText("get_component", { id: "select", sections: ["states"] });
    expect(one.text).toContain("## Состояния");
    expect(one.text).not.toContain("## Пропсы");
    const all = await callText("get_component", { id: "select", sections: ["all"] });
    for (const heading of ["## Хореография", "## Анатомия", "## Пропсы", "## Размеры и токены"]) {
      expect(all.text).toContain(heading);
    }
  });

  it("get_component: несуществующий id — понятная ошибка с подсказками", async () => {
    const { text, isError } = await callText("get_component", { id: "buton" });
    expect(isError).toBe(true);
    expect(text).toContain("Нет компонента «buton»");
    expect(text).toContain("`button`");
  });

  it("get_component_source: tsx, css и index без тестов и demo", async () => {
    const { text } = await callText("get_component_source", { id: "button" });
    expect(text).toContain("src/entries/button/Button.tsx");
    expect(text).toContain("src/entries/button/button.css");
    expect(text).toContain("src/entries/button/index.ts");
    expect(text).not.toContain("Button.test.tsx (");
    expect(text).not.toContain("demo.tsx (");
    const test = await callText("get_component_source", { id: "button", file: "Button.test.tsx" });
    expect(test.text).toContain("Button.test.tsx");
    const bad = await callText("get_component_source", { id: "button", file: "../../x" });
    expect(bad.isError).toBe(true);
  });

  it("search {query: тост}: находит Toast", async () => {
    const { text, isError } = await callText("search", { query: "тост" });
    expect(isError).toBe(false);
    expect(text).toContain("`toast`");
    expect(text.split("\n")[1]).toContain("`toast`");
  });

  it("search: падежи, ё/е и пустая выдача", async () => {
    expect((await callText("search", { query: "чипы" })).text).toContain("`user-chip`");
    expect((await callText("search", { query: "qqzzxxvv" })).text).toContain("ничего нет");
    expect((await callText("search", { query: "таблица", limit: 2 })).text).toContain(
      "`data-table`",
    );
  });

  it("get_tokens: роли с назначением и обеими темами", async () => {
    const { text } = await callText("get_tokens");
    expect(text).toContain("## Цвета (роли)");
    expect(text).toMatch(/\| `--surface` \| `#fff` \| `#151b23` \|/);
    expect(text).toContain("Основной текст");
    expect(text).toContain("## Радиусы");
    expect(text).toContain("## Движение");
    const radii = await callText("get_tokens", { kind: "radii" });
    expect(radii.text).toContain("`--r-item`");
    expect(radii.text).not.toContain("`--surface`");
  });

  it("get_design_rules: все правила и фильтр по теме", async () => {
    const all = await callText("get_design_rules");
    for (const rule of ["левых акцентных линий", "50/50", "Dialog без крестика", "аватарах"]) {
      expect(all.text).toContain(rule);
    }
    const contrast = await callText("get_design_rules", { topic: "контраст" });
    expect(contrast.text).toContain("4,5:1");
    expect(contrast.text).not.toContain("Dialog");
    const bad = await callText("get_design_rules", { topic: "ззз" });
    expect(bad.isError).toBe(true);
  });

  it("get_choreography: шаги, таймингы, один сценарий и ошибка", async () => {
    const all = await callText("get_choreography", { id: "button" });
    expect(all.text).toContain("| at, мс | dur, мс |");
    expect(all.text).toContain("Reduced motion");
    const one = await callText("get_choreography", { id: "data-table", scenario: "sort" });
    expect(one.text).toContain("`sort`");
    expect(one.text).not.toContain("`select`");
    const bad = await callText("get_choreography", { id: "button", scenario: "нет" });
    expect(bad.isError).toBe(true);
  });

  it("неверные аргументы дают ошибку, а не падение", async () => {
    const result = await client
      .callTool({ name: "get_component", arguments: { id: "" } })
      .catch((error: unknown) => error);
    const failed = result instanceof Error || (result as { isError?: boolean }).isError === true;
    expect(failed).toBe(true);
  });
});

describe("MCP-сервер кита: данные", () => {
  const implemented = kit.entries().filter((e) => e.status === "implemented");

  it("в ките есть реализованные записи", () => {
    expect(implemented.length).toBeGreaterThanOrEqual(3);
  });

  it.each(implemented.map((e) => [e.id]))("%s: get_component отдаёт непустой README", (id) => {
    const text = getComponent(kit, { id });
    expect(text.length).toBeGreaterThan(300);
    expect(text).toContain('from "@/ui"');
    expect(text).toContain("## Как использовать");
    expect(text).not.toContain("Ручного раздела ещё нет");
    const { manual } = splitManualOf(id);
    expect(manual.usage.length + manual.props.length).toBeGreaterThan(0);
    expect(getComponentSource(kit, { id })).toContain(`src/entries/${id}/index.ts`);
  });

  it("исходники mcp/ начинаются с лицензии", () => {
    const dir = import.meta.dirname;
    for (const name of readdirSync(dir).filter((f) => f.endsWith(".ts"))) {
      const first = readFileSync(join(dir, name), "utf8").split("\n", 1)[0];
      expect(first, name).toContain("© 2026 Komarov Zhiznev Group. Все права защищены.");
    }
  });
});

function splitManualOf(id: string) {
  return { manual: splitManual(splitReadme(kit.readme(id) ?? "").manual) };
}
