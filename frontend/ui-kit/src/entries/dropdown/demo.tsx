/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useState } from "react";
import { Icon, type IconName } from "@/engine/Icon";
import { PortalHost, useIds } from "../../ui/internal";
import { Avatar } from "../avatar";
import {
  Dropdown,
  DropdownHeader,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
  DropdownSeparator,
  DropdownTrigger,
} from "./index";
import "./menu.force.css";

export interface MenuItem {
  id: string;
  text: string;
  icon?: IconName;
  hint?: string;
  end?: string;
  danger?: boolean;
  off?: boolean;
  check?: boolean;
}
export type MenuEntry =
  | { sep: true; id: string }
  | { label: string; id: string }
  | { head: { name: string; sub: string }; id: string }
  | MenuItem;

const NO_CHECKS: Record<string, boolean> = {};

export const ACTIONS: MenuEntry[] = [
  { id: "open", text: "Открыть карточку", icon: "doc" },
  { id: "copy", text: "Копировать номер", icon: "copy", end: "Ctrl C" },
  { id: "fix", text: "Исправить в 1С", icon: "edit", off: true, hint: "Расхождений нет" },
  { id: "s1", sep: true },
  { id: "archive", text: "В архив", icon: "trash", danger: true },
];

export const PROFILE: MenuEntry[] = [
  { id: "head", head: { name: "Ирина Петрова", sub: "Оформление · Дальснаб" } },
  { id: "profile", text: "Профиль", icon: "user" },
  { id: "settings", text: "Настройки", icon: "gear", end: "Ctrl ," },
  { id: "links", text: "Подключения", icon: "link", off: true, hint: "Нужны права администратора" },
  { id: "s1", sep: true },
  { id: "logout", text: "Выйти", icon: "logout", danger: true },
];

export const COLUMNS: MenuEntry[] = [
  { id: "l1", label: "Показать колонки" },
  { id: "client", text: "Клиент", check: true },
  { id: "decl", text: "Декларация", check: true },
  { id: "weight", text: "Вес, кг", check: false },
  { id: "s1", sep: true },
  { id: "reset", text: "Сбросить", icon: "refresh" },
];

function renderEntries({
  entries,
  checks = NO_CHECKS,
  hot,
  hotForce = "hover",
  onPick,
  onCheck,
}: {
  entries: MenuEntry[];
  checks?: Record<string, boolean>;
  hot?: string;
  hotForce?: "hover" | "active";
  onPick?: (item: MenuItem) => void;
  onCheck?: (item: MenuItem, checked: boolean) => void;
}) {
  return entries.map((entry) => {
    if ("sep" in entry) return <DropdownSeparator key={entry.id} />;
    if ("label" in entry) return <DropdownLabel key={entry.id}>{entry.label}</DropdownLabel>;
    if ("head" in entry)
      return (
        <DropdownHeader
          key={entry.id}
          title={entry.head.name}
          subtitle={entry.head.sub}
          avatar={<Avatar kind="you" size="md" name={entry.head.name} />}
        />
      );
    const checkable = entry.check !== undefined;
    return (
      <DropdownItem
        key={entry.id}
        icon={entry.icon ? <Icon name={entry.icon} /> : undefined}
        hint={entry.hint}
        shortcut={entry.end}
        danger={entry.danger}
        disabled={entry.off}
        checked={checkable ? (checks[entry.id] ?? entry.check) : undefined}
        onCheckedChange={checkable ? (next) => onCheck?.(entry, next) : undefined}
        onSelect={() => onPick?.(entry)}
        data-force={hot === entry.id ? hotForce : undefined}
      >
        {entry.text}
      </DropdownItem>
    );
  });
}

export function MenuSurface({
  id,
  entries,
  checks,
  hot,
  hotForce,
  isStatic,
  end,
  label,
}: {
  id?: string;
  entries: MenuEntry[];
  checks?: Record<string, boolean>;
  hot?: string;
  hotForce?: "hover" | "active";
  isStatic?: boolean;
  end?: boolean;
  label: string;
}) {
  return (
    <DropdownMenu
      id={id}
      label={label}
      className={isStatic ? "ds-menu--static" : undefined}
      data-align-end={end ? "" : undefined}
    >
      {renderEntries({ entries, checks, hot, hotForce })}
    </DropdownMenu>
  );
}

export type MenuTriggerKind = "button" | "icon";

export function MenuTrigger({
  kind = "button",
  open,
  force,
  menuId,
}: {
  kind?: MenuTriggerKind;
  open?: boolean;
  force?: "hover" | "focus";
  menuId?: string;
}) {
  return (
    <DropdownTrigger
      kind={kind}
      aria-haspopup="menu"
      aria-expanded={open ? "true" : "false"}
      aria-controls={open ? menuId : undefined}
      data-force={force}
    />
  );
}

export interface MenuState {
  open: boolean;
  hot?: string;
  checks: Record<string, boolean>;
  force?: "hover" | "focus";
  log?: string;
}

export function MenuScene({
  state,
  entries = ACTIONS,
  kind = "button",
  end,
  label = "Действия",
}: {
  state: MenuState;
  entries?: MenuEntry[];
  kind?: MenuTriggerKind;
  end?: boolean;
  label?: string;
}) {
  const ids = useIds(["menu"]);
  return (
    <div className="ds-menu__stage ds-menu__stage--short">
      <div className="ds-menu__host">
        <MenuTrigger kind={kind} open={state.open} force={state.force} menuId={ids.menu} />
        {state.open ? (
          <MenuSurface
            id={ids.menu}
            entries={entries}
            checks={state.checks}
            hot={state.hot}
            end={end}
            label={label}
          />
        ) : null}
      </div>
      <div className="ds-menu__page" aria-hidden="true">
        <b>MSKU4821907</b>
        <span>Владивосток → Новосибирск · 18 420 кг</span>
        <span>Декларация подана, ждём выпуск</span>
      </div>
      <div className="ds-menu__log" aria-live="polite">
        {state.log ?? ""}
      </div>
    </div>
  );
}

export function DemoMenu({
  entries = ACTIONS,
  kind = "button",
  end,
  label = "Действия",
  flow,
}: {
  entries?: MenuEntry[];
  kind?: MenuTriggerKind;
  end?: boolean;
  label?: string;
  flow?: boolean;
}) {
  const [open, setOpen] = useState(!!flow);
  const [log, setLog] = useState("");
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const holdOpen = flow
    ? {
        open,
        onOpenChange: (next: boolean, reason: string) => {
          if (reason !== "dismiss") setOpen(next);
        },
      }
    : {};
  return (
    <PortalHost
      className={`ds-menu__stage ${flow ? "ds-menu__stage--flow" : "ds-menu__stage--short"}${end ? " ds-menu__stage--end" : ""}`}
    >
      <Dropdown {...holdOpen} kind={kind} label={label} end={end}>
        {renderEntries({
          entries,
          checks,
          onCheck: (item, checked) => setChecks((c) => ({ ...c, [item.id]: checked })),
          onPick: (item) => {
            if (item.check === undefined) setLog(`Выбрано: ${item.text}`);
          },
        })}
      </Dropdown>
      <div className="ds-menu__log" aria-live="polite">
        {log}
      </div>
    </PortalHost>
  );
}

export function RowMenuExample() {
  const [log, setLog] = useState("");
  return (
    <div className="ds-menu__example">
      <Dropdown kind="icon" label="Действия" end>
        {renderEntries({
          entries: ACTIONS,
          onPick: (item) => setLog(`Выбрано: ${item.text}`),
        })}
      </Dropdown>
      <div className="ds-menu__log" aria-live="polite">
        {log}
      </div>
    </div>
  );
}

export function ColumnsMenuExample() {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  return (
    <div className="ds-menu__example">
      <Dropdown label="Колонки" triggerLabel="Колонки">
        {renderEntries({
          entries: COLUMNS,
          checks,
          onCheck: (item, checked) => setChecks((c) => ({ ...c, [item.id]: checked })),
        })}
      </Dropdown>
    </div>
  );
}
