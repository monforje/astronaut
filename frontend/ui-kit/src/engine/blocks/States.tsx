/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { PortalHost } from "@/ui/internal";
import { Rich } from "../Rich";
import type { StateMatrix, StateSpec } from "../types";

export function StatesBlock({
  states,
  matrix,
  wide,
}: {
  states: StateSpec[];
  matrix?: StateMatrix;
  wide?: boolean;
}) {
  return (
    <div className="dx-stack">
      {states.length > 0 ? (
        <div className="dx-grid dx-grid--states" data-wide={wide || undefined}>
          {states.map((s) => (
            <article
              className="dx-state"
              key={s.id}
              id={`state-${s.id}`}
              data-na={s.notApplicable || undefined}
              data-wide={s.wide || undefined}
            >
              <PortalHost
                contain={!s.notApplicable}
                minHeight={s.stageMinHeight}
                className="dx-canvas dx-state__demo"
              >
                {s.notApplicable ? <span className="dx-state__na">не применимо</span> : s.demo}
              </PortalHost>
              <div className="dx-state__cap">
                <b>{s.title}</b>
                {s.forced ? <em className="dx-tag dx-tag--forced">принудительно</em> : null}
                <small>
                  <Rich>{s.note}</Rich>
                </small>
              </div>
            </article>
          ))}
        </div>
      ) : null}
      {matrix ? (
        <div className="dx-scroll">
          <table className="dx-matrix">
            <thead>
              <tr>
                <th scope="col">
                  <span className="dx-sr">Вид</span>
                </th>
                {matrix.columns.map((c) => (
                  <th scope="col" key={c}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.rows.map((r, ri) => (
                <tr key={`${ri}-${r.label}`}>
                  <th scope="row">{r.label}</th>
                  {r.cells.map((c, i) => (
                    <td key={`${i}-${matrix.columns[i]}`}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
