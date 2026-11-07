/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { PortalHost } from "@/ui/internal";
import { Rich } from "../Rich";
import type { Anatomy as AnatomySpec } from "../types";

export function AnatomyBlock({ anatomy }: { anatomy: AnatomySpec }) {
  return (
    <div className="dx-anatomy">
      {anatomy.demo ? (
        <PortalHost
          contain
          minHeight={anatomy.stageMinHeight}
          className="dx-canvas dx-anatomy__demo"
        >
          {anatomy.demo}
        </PortalHost>
      ) : null}
      <ol className="dx-anatomy__parts">
        {anatomy.parts.map((p, i) => (
          <li key={`${i}-${p.name}`}>
            <span className="dx-anatomy__n">{i + 1}</span>
            <span>
              <b>{p.name}</b>
              {p.optional ? <em className="dx-tag">необязательно</em> : null}
              <small>
                <Rich>{p.description}</Rich>
              </small>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
