/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { PortalHost } from "@/ui/internal";
import { Rich } from "../Rich";
import type { SizeSpec, VariantSpec } from "../types";

export function VariantsBlock({ variants, wide }: { variants: VariantSpec[]; wide?: boolean }) {
  return (
    <div className="dx-grid dx-grid--variants" data-wide={wide || undefined}>
      {variants.map((v) => (
        <article
          className="dx-card"
          key={v.id}
          id={`variant-${v.id}`}
          data-wide={v.wide || undefined}
        >
          <PortalHost contain minHeight={v.stageMinHeight} className="dx-canvas">
            {v.demo}
          </PortalHost>
          <div className="dx-card__body">
            <h3>
              {v.title} <code className="dx-id">{v.id}</code>
            </h3>
            <p>
              <Rich>{v.description}</Rich>
            </p>
            {v.when ? (
              <p className="dx-card__when">
                <b>Когда:</b> <Rich>{v.when}</Rich>
              </p>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}

export function SizesBlock({ sizes }: { sizes: SizeSpec[] }) {
  return (
    <div className="dx-sizes">
      {sizes.map((s) => (
        <div className="dx-sizes__row" key={s.id}>
          <div className="dx-sizes__label">
            <b>{s.title}</b>
            <span className="dx-num">{s.value}</span>
            {s.note ? (
              <small>
                <Rich>{s.note}</Rich>
              </small>
            ) : null}
          </div>
          <PortalHost contain minHeight={s.stageMinHeight} className="dx-sizes__demo">
            {s.demo}
          </PortalHost>
        </div>
      ))}
    </div>
  );
}
