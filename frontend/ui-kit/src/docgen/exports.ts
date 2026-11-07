/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
export const KIT_PACKAGE = "@astronaut/ui-kit";
export const KIT_ALIAS = "@/ui";

export const exportedComponents = (indexSource: string): string[] => {
  const names: string[] = [];
  for (const m of indexSource.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const raw of m[1].split(",")) {
      const item = raw.trim();
      if (!item || item.startsWith("type ")) continue;
      const name = item.split(/\s+as\s+/).pop() ?? "";
      if (/^[A-Z]/.test(name) && !names.includes(name)) names.push(name);
    }
  }
  return names;
};

export const importFrom = (names: string[], from: string): string =>
  `import { ${names.join(", ")} } from "${from}"`;

export const importsLine = (names: string[]): string =>
  `Импорт: в ките — \`${importFrom(names, KIT_ALIAS)}\`, в приложении — \`${importFrom(names, KIT_PACKAGE)}\` (нужен \`${KIT_PACKAGE}/styles.css\`).`;
