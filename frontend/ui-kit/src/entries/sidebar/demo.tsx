/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useLayoutEffect, useRef, useState } from "react";
import { Icon, type IconName } from "@/engine/Icon";
import { TooltipCard } from "../tooltip";
import { Sidebar } from "./index";
import "./sidebar.force.css";

export type SideForce = "hover" | "active" | "focus";
export interface SideItem {
  id: string;
  label: string;
  icon: IconName;
  count?: number | "loading";
  tone?: "err";
  dot?: boolean;
  disabled?: boolean;
}
export interface SideGroup {
  id: string;
  title: string;
  glyph: IconName;
  items: SideItem[];
}

export const GROUPS: SideGroup[] = [
  {
    id: "screen",
    title: "Экран",
    glyph: "layout",
    items: [{ id: "cargo", label: "Грузы", icon: "box", count: 128 }],
  },
  {
    id: "layouts",
    title: "Макеты",
    glyph: "grid",
    items: [
      { id: "dash", label: "Дашборд", icon: "chart" },
      { id: "inbox", label: "Расхождения", icon: "warn", count: 8 },
      { id: "settings", label: "Настройки", icon: "gear" },
    ],
  },
  {
    id: "docs",
    title: "Документы",
    glyph: "doc",
    items: [
      { id: "waybill", label: "Накладные", icon: "doc" },
      { id: "decl", label: "Декларации", icon: "doc", count: 5 },
    ],
  },
];

export function DemoSidebar({
  rail,
  defaultRail = false,
  onRailChange,
  active,
  defaultActive = "cargo",
  groups = GROUPS,
  closed,
  defaultClosed,
  force,
  tipFor,
  height = 470,
  hideFoot,
}: {
  rail?: boolean;
  defaultRail?: boolean;
  onRailChange?: (r: boolean) => void;
  active?: string;
  defaultActive?: string;
  groups?: SideGroup[];
  closed?: string[];
  defaultClosed?: string[];
  force?: Record<string, SideForce | undefined>;
  tipFor?: string;
  height?: number;
  hideFoot?: boolean;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [ownRail, setOwnRail] = useState(defaultRail);
  const isRail = rail ?? ownRail;
  const [tipTop, setTipTop] = useState<number | null>(null);
  const tipText = groups.find((g) => g.id === tipFor)?.title;
  useLayoutEffect(() => {
    const target = tipFor
      ? wrap.current?.querySelector<HTMLElement>(`[data-gid="${tipFor}"]`)
      : null;
    if (!wrap.current || !target) {
      setTipTop(null);
      return;
    }
    const box = wrap.current.getBoundingClientRect();
    const row = target.getBoundingClientRect();
    setTipTop(row.top - box.top + row.height / 2);
    // oxlint-disable-next-line react/exhaustive-effect-dependencies
  }, [tipFor, isRail]);
  return (
    <div ref={wrap} className="ds-side-wrap" style={{ height }}>
      <Sidebar
        rail={rail}
        defaultRail={defaultRail}
        onRailChange={(next) => {
          setOwnRail(next);
          onRailChange?.(next);
        }}
        active={active}
        defaultActive={defaultActive}
        closedGroups={closed}
        defaultClosedGroups={defaultClosed}
        brand={
          <>
            <img
              src={`${import.meta.env.BASE_URL}brand/logo-mark.svg`}
              alt=""
              width={24}
              height={24}
            />
            Astronaut
          </>
        }
        brandMark={
          <img
            src={`${import.meta.env.BASE_URL}brand/logo-mark.svg`}
            alt=""
            width={24}
            height={24}
          />
        }
        toggleProps={{ "data-force": force?.trigger }}
        groups={groups.map((g) => ({
          id: g.id,
          title: g.title,
          icon: <Icon name={g.glyph} />,
          "data-force": force?.[g.id],
          items: g.items.map((it) => ({
            id: it.id,
            label: it.label,
            icon: <Icon name={it.icon} />,
            count: it.count,
            tone: it.tone,
            dot: it.dot,
            disabled: it.disabled,
            "data-force": force?.[it.id],
          })),
        }))}
        footerItems={
          hideFoot ? undefined : [{ id: "help", label: "Справка", icon: <Icon name="help" /> }]
        }
      />
      {tipText && isRail ? (
        <TooltipCard
          className="ds-side__tip"
          style={{ top: tipTop ?? 0, visibility: tipTop === null ? "hidden" : undefined }}
          content={tipText}
        />
      ) : null}
    </div>
  );
}
