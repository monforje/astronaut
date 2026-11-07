import { useState, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { useLocation, useMatches, useNavigate } from "react-router";
import {
  AppShell,
  Avatar,
  Icon,
  MARK_SRC,
  Sheet,
  Sidebar,
  Topbar,
  TopbarAction,
  TopbarProfile,
  TopbarSearch,
  toast,
  type SidebarGroup,
} from "@astronaut/ui-kit";
import { ThemeSwitch } from "@/features/theme-switch";
import { APP_NAME } from "@/shared/config";
import { buildCrumbs } from "../../model/crumbs";
import { NAV_GROUPS, activeNavId } from "../../model/nav";
import { useSidebarStore } from "../../model/sidebar-store";
import styles from "./AppFrame.module.css";

/** Обычный клик ведёт через роутер, клик с модификатором (новая вкладка) остаётся браузеру. */
const isPlainClick = (event: MouseEvent) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

/** Поиск без источника данных: честно сообщаем об этом вместо молчаливого «ничего не нашлось». */
function searchStub(event: KeyboardEvent<HTMLInputElement>) {
  if (event.key === "Enter") toast({ title: "Поиск пока недоступен", tone: "info" });
}

function Brand() {
  return (
    <>
      <img src={MARK_SRC} alt="" width={24} height={24} />
      {APP_NAME}
    </>
  );
}

/**
 * Каркас всех экранов на ките: сайдбар с навигацией, топбар с крошками вместо заголовка страницы,
 * область контента. В узком виде (≤ 760 px) сайдбар прячется, меню открывается панелью Sheet.
 */
export function AppFrame({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const matches = useMatches();
  const rail = useSidebarStore((state) => state.rail);
  const setRail = useSidebarStore((state) => state.setRail);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const go = (href: string, event: MouseEvent) => {
    if (!isPlainClick(event)) return;
    event.preventDefault();
    setDrawerOpen(false);
    navigate(href);
  };

  const groups: SidebarGroup[] = NAV_GROUPS.map((group) => ({
    id: group.id,
    title: group.title,
    icon: <Icon name={group.icon} />,
    items: group.items.map((item) => ({
      id: item.id,
      label: item.label,
      icon: <Icon name={item.icon} />,
      href: item.href,
      onClick: (event) => go(item.href, event),
    })),
  }));

  const crumbs = buildCrumbs(matches).map(({ label, href }) => ({
    label,
    href,
    onClick: href ? (event: MouseEvent) => go(href, event) : undefined,
  }));

  return (
    <>
      <a className={styles.skip} href="#content">
        К содержимому
      </a>
      <AppShell
        className={styles.shell}
        rail={rail}
        sidebar={
          <Sidebar
            rail={rail}
            onRailChange={setRail}
            active={activeNavId(pathname)}
            brand={<Brand />}
            brandMark={<img src={MARK_SRC} alt="" width={24} height={24} />}
            groups={groups}
          />
        }
        topbar={
          <Topbar
            crumbs={crumbs}
            search={<TopbarSearch placeholder="Поиск" onKeyDown={searchStub} />}
            actions={
              <>
                <span className={styles.menu}>
                  <TopbarAction
                    label="Открыть меню"
                    icon={<Icon name="list" />}
                    aria-expanded={drawerOpen}
                    onClick={() => setDrawerOpen(true)}
                  />
                </span>
                <ThemeSwitch />
                <TopbarProfile
                  avatar={<Avatar name="Гость" size="sm" />}
                  menuAvatar={<Avatar name="Гость" size="md" />}
                  name="Гость"
                  subtitle="Демо-режим"
                  items={[
                    {
                      label: "На главную",
                      icon: <Icon name="layout" />,
                      href: "/",
                      onSelect: (event) => go("/", event),
                    },
                  ]}
                />
              </>
            }
          />
        }
        contentProps={{ id: "content", tabIndex: -1 }}
      >
        {children}
      </AppShell>
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen} title="Меню" resizable={false}>
        <Sidebar
          className={styles.drawerNav}
          rail={false}
          active={activeNavId(pathname)}
          groups={groups}
          toggleProps={{ hidden: true }}
          navLabel="Разделы"
        />
      </Sheet>
    </>
  );
}
