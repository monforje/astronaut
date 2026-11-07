/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { CodeBlock } from "../CodeBlock";
import { PortalHost } from "@/ui/internal";
import { Rich } from "../Rich";
import type { ExampleSpec } from "../types";

export function ExamplesBlock({ examples }: { examples: ExampleSpec[] }) {
  return (
    <div className="dx-examples">
      {examples.map((e) => (
        <article className="dx-card" key={e.id}>
          <div className="dx-card__body">
            <h3>{e.title}</h3>
            {e.description ? (
              <p>
                <Rich>{e.description}</Rich>
              </p>
            ) : null}
          </div>
          <PortalHost contain minHeight={e.stageMinHeight} className="dx-canvas">
            {e.demo}
          </PortalHost>
          {e.code ? <CodeBlock lang={e.lang}>{e.code}</CodeBlock> : null}
        </article>
      ))}
    </div>
  );
}
