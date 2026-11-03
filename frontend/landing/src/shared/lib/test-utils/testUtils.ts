import { experimental_AstroContainer as AstroContainer } from "astro/container";
import type { ContainerRenderOptions } from "astro/container";
import { Window } from "happy-dom";

type AstroComponent = Parameters<AstroContainer["renderToString"]>[0];

/**
 * Рендерит `.astro`-компонент через Container API и разбирает HTML в happy-dom `Document`: дальше
 * обычные `querySelector` и `textContent`. Окружение тестов — node (см. vitest.config.ts).
 */
export async function renderAstro(
  component: AstroComponent,
  options: ContainerRenderOptions = {},
): Promise<Document> {
  const container = await AstroContainer.create();
  const html = await container.renderToString(component, options);
  const window = new Window();
  return new window.DOMParser().parseFromString(html, "text/html") as unknown as Document;
}
