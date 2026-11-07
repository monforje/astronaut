/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useState, type ReactNode } from "react";
import { Icon, type IconName } from "@/engine/Icon";
import { PortalHost, useStableId } from "../../ui/internal";
import { Breadcrumb } from "./index";
import "./breadcrumb.force.css";

export type CrumbForce = "hover" | "active" | "focus";
export interface Crumb {
  t: string;
  icon?: IconName;
  menu?: string[];
  disabled?: boolean;
  loading?: boolean;
}

export function DemoBreadcrumb({
  items,
  max = 4,
  size,
  force,
  openMenu,
}: {
  items: Crumb[];
  max?: number;
  size?: "sm";
  force?: Record<number, CrumbForce>;
  openMenu?: "ell" | number;
}) {
  return (
    <PortalHost className="ds-bc-host">
      <Breadcrumb
        max={max}
        size={size}
        openMenu={openMenu === undefined ? undefined : openMenu === "ell" ? "ellipsis" : openMenu}
        items={items.map((c, i) => ({
          label: c.t,
          icon: c.icon ? <Icon name={c.icon} size="sm" /> : undefined,
          menu: c.menu,
          disabled: c.disabled,
          loading: c.loading,
          href: "#bc",
          onClick: (event) => event.preventDefault(),
          "data-force": force?.[i],
        }))}
      />
    </PortalHost>
  );
}

export function Resizable({
  width,
  control,
  min = 160,
  max = 560,
  children,
}: {
  width?: number;
  control?: boolean;
  min?: number;
  max?: number;
  children: ReactNode;
}) {
  const [own, setOwn] = useState(width ?? max);
  const w = control ? own : width;
  const id = useStableId();
  return (
    <div className="ds-bc-box">
      <div className="ds-bc-resz" style={w ? { width: w } : undefined}>
        {children}
      </div>
      {control ? (
        <label className="ds-bc-box__ctl" htmlFor={id}>
          Ширина
          <input
            id={id}
            type="range"
            min={min}
            max={max}
            step={10}
            value={own}
            onChange={(e) => setOwn(Number(e.target.value))}
          />
          <output>{own} px</output>
        </label>
      ) : null}
    </div>
  );
}

export const ANATOMY_PATH: Crumb[] = [
  { t: "Главная", icon: "layout" },
  { t: "Интеграции" },
  { t: "Подключения" },
  { t: "1С", menu: ["1С", "Битрикс24"] },
  { t: "Журнал" },
];
export const CARGO_PATH: Crumb[] = [{ t: "Грузы" }, { t: "Морской импорт" }, { t: "MSKU4821907" }];
export const LONG_PATH: Crumb[] = [
  { t: "Главная", icon: "layout" },
  { t: "Клиенты" },
  { t: "ООО «Дальснаб»" },
  { t: "Договоры" },
  { t: "Договор № 14/2026" },
  { t: "Приложение 3 к договору поставки" },
];
export const SWITCH_PATH: Crumb[] = [
  { t: "Подключения", icon: "link" },
  { t: "1С:Предприятие", menu: ["1С:Предприятие", "Битрикс24", "Альта-ГТД", "Контур.ЭДО"] },
  { t: "Журнал синхронизации" },
];
