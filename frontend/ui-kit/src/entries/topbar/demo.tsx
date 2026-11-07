/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/engine/Icon";
import { PortalHost } from "../../ui/internal";
import { DemoAvatar } from "../avatar/demo";
import { Topbar, TopbarAction, TopbarProfile, TopbarSearch } from "./index";
import "./topbar.force.css";

export function Fit({ base = 500, children }: { base?: number; children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(1);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => setK(Math.min(1, Math.max(0.62, el.clientWidth / base)));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [base]);
  return (
    <div ref={box} className="ds-top-fit">
      <div style={{ width: base, zoom: k }}>{children}</div>
    </div>
  );
}

export type TopForce = "hover" | "active" | "focus";
export type Part = "theme" | "bell" | "prof" | "search";

const CRUMBS = ["Грузы", "Морской импорт", "MSKU4821907"];

export function DemoTopbar({
  crumbs = CRUMBS,
  force,
  menu,
  unread = 0,
  dark,
  searchLoading,
  searchValue,
  interactive,
  hideCenter,
  reserve,
}: {
  crumbs?: string[];
  force?: Partial<Record<Part, TopForce>>;
  menu?: boolean;
  unread?: number;
  dark?: boolean;
  searchLoading?: boolean;
  searchValue?: string;
  interactive?: boolean;
  hideCenter?: boolean;
  reserve?: boolean;
}) {
  const [isDark, setDark] = useState(!!dark);
  const [open, setOpen] = useState(false);
  const dk = dark ?? isDark;

  return (
    <PortalHost className={reserve ? "ds-top-stage ds-top-stage--tall" : "ds-top-stage"}>
      <Topbar
        searchHotkey={interactive ? "topbar" : false}
        crumbs={crumbs.map((label) => ({
          label,
          href: "#top",
          onClick: (e) => e.preventDefault(),
        }))}
        search={
          hideCenter ? undefined : (
            <DemoSearch force={force?.search} loading={searchLoading} value={searchValue} />
          )
        }
        actions={
          <DemoActionItems
            force={force}
            unread={unread}
            dark={dk}
            onTheme={() => setDark(!isDark)}
            menu={menu ?? open}
            onMenu={setOpen}
          />
        }
      />
    </PortalHost>
  );
}

export function DemoSearch({
  force,
  loading,
  value,
}: {
  force?: TopForce;
  loading?: boolean;
  value?: string;
}) {
  return (
    <TopbarSearch
      rootProps={{ "data-force": force }}
      loading={loading}
      placeholder="Поиск по грузам, клиентам, документам"
      defaultValue={value}
    />
  );
}

interface ActionsProps {
  force?: Partial<Record<Part, TopForce>>;
  unread?: number;
  dark?: boolean;
  onTheme?: () => void;
  menu?: boolean;
  onMenu?: (open: boolean) => void;
}

function DemoActionItems({ force, unread = 0, dark, onTheme, menu, onMenu }: ActionsProps) {
  return (
    <>
      <TopbarAction
        label="Сменить тему"
        icon={<Icon name={dark ? "sun" : "moon"} />}
        data-force={force?.theme}
        onClick={onTheme}
      />
      <TopbarAction
        label="Уведомления"
        icon={<Icon name="bell" />}
        badge={unread}
        data-force={force?.bell}
      />
      <TopbarProfile
        avatar={<DemoAvatar name="Иван Петров" kind="you" />}
        name="Иван Петров"
        subtitle="Оформление · Владивосток"
        data-force={force?.prof}
        open={menu}
        onOpenChange={onMenu}
        items={[
          { label: "Профиль", icon: <Icon name="user" size="sm" /> },
          { label: "Настройки", icon: <Icon name="gear" size="sm" /> },
          { label: "Выйти", icon: <Icon name="logout" size="sm" />, separatorBefore: true },
        ]}
      />
    </>
  );
}

export function DemoActions(props: ActionsProps) {
  const [open, setOpen] = useState(false);
  return (
    <PortalHost className="ds-top-stage ds-top__end">
      <DemoActionItems {...props} menu={props.menu ?? open} onMenu={setOpen} />
    </PortalHost>
  );
}
