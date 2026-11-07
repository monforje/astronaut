/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ReactNode } from "react";
import { SectionHeader, Separator } from "./index";
import "./separator.force.css";

export type SepForce = "hover" | "active" | "focus";

export function Hr({ strong }: { strong?: boolean }) {
  return <Separator strong={strong} decorative />;
}

export function LabelSep({ children }: { children: ReactNode }) {
  return <Separator>{children}</Separator>;
}

export function Vr() {
  return <Separator orientation="vertical" decorative />;
}

export function Toolbar() {
  return (
    <div className="ds-sep-bar" role="toolbar" aria-label="Действия со списком">
      <button type="button" className="ds-sep-bar__b">
        Фильтр
      </button>
      <Vr />
      <button type="button" className="ds-sep-bar__b">
        Колонки
      </button>
      <Vr />
      <button type="button" className="ds-sep-bar__b">
        Экспорт
      </button>
    </div>
  );
}

export function DemoSection({
  open,
  defaultOpen = true,
  force,
  animate,
  title = "Документы груза",
  disabled,
  summary,
}: {
  summary?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  force?: SepForce;
  animate?: boolean;
  title?: string;
  disabled?: boolean;
}) {
  return (
    <SectionHeader
      title={title}
      open={open}
      defaultOpen={defaultOpen}
      animated={animate}
      disabled={disabled}
      summary="3 документа · 1 с расхождением"
      summaryAlways={summary}
      data-force={force}
    >
      <div className="ds-sep-sec__rows">
        <div>
          <span>Накладная</span>
          <em className="ds-sep-sec__ok">Ок</em>
        </div>
        <div>
          <span>Декларация</span>
          <em className="ds-sep-sec__err">Разница</em>
        </div>
      </div>
    </SectionHeader>
  );
}
