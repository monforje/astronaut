/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ReactNode } from "react";

export interface SectionDef {
  id: string;
  title: string;
}

export function Section({
  id,
  title,
  lead,
  children,
}: {
  id: string;
  title: string;
  lead?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="dx-section" id={`s-${id}`} aria-labelledby={`h-${id}`}>
      <h2 className="dx-section__title" id={`h-${id}`}>
        {title}
      </h2>
      {lead ? <p className="dx-section__lead">{lead}</p> : null}
      {children}
    </section>
  );
}
