/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ReactNode } from "react";
import { AppShell } from "./index";
import "./app-shell.force.css";

export type Bp = "w" | "1280" | "1180" | "900" | "760";
export type Pat = "cargo" | "inbox" | "settings" | "dash";
export type ShellState = "ok" | "loading" | "empty" | "error";

export const BP_LABEL: Record<Bp, string> = {
  w: "шире 1280",
  "1280": "≤ 1280",
  "1180": "≤ 1180",
  "900": "≤ 900",
  "760": "≤ 760",
};

export function Blk({
  label,
  hint,
  fill,
  scroll,
  span,
  className = "",
  children,
}: {
  label: string;
  hint?: string;
  fill?: boolean;
  scroll?: boolean;
  span?: number;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={`ds-shell__b ${className}`.trim()}
      data-fill={fill || undefined}
      data-scroll={scroll || undefined}
      style={span ? { gridColumn: `span ${span}` } : undefined}
    >
      <b>{label}</b>
      {hint ? <small>{hint}</small> : null}
      {children}
    </div>
  );
}

function Rows({ n = 4 }: { n?: number }) {
  return (
    <span className="ds-shell__rows" aria-hidden="true">
      {Array.from({ length: n }, (_, i) => `r${i}`).map((k) => (
        <i key={k} />
      ))}
    </span>
  );
}

export function PatCargo() {
  return (
    <div className="ds-shell__page ds-shell__cargo">
      <div className="ds-shell__kpis">
        <Blk label="KPI" hint="В работе" />
        <Blk label="KPI" hint="Ждут" />
        <Blk label="KPI" hint="Расхожд." />
        <Blk label="KPI" hint="Связи" />
      </div>
      <div className="ds-shell__split">
        <Blk label="Таблица" hint="Tabs · фильтры · строки" scroll>
          <Rows n={5} />
        </Blk>
        <div className="ds-shell__stack">
          <Blk label="Карточка груза" hint="340 px" />
          <Blk label="История" hint="растёт до низа таблицы" fill />
        </div>
      </div>
    </div>
  );
}

export function PatInbox() {
  return (
    <div className="ds-shell__page ds-shell__inbox">
      <Blk label="Список" hint="340 px · поиск · фильтр" scroll>
        <Rows n={6} />
      </Blk>
      <Blk label="Деталь" hint="заголовок · Stepper · Tabs · содержимое" scroll>
        <Rows n={5} />
      </Blk>
      <Blk label="Свойства" hint="300 px" className="ds-shell__third" scroll>
        <Rows n={4} />
      </Blk>
    </div>
  );
}

export function PatSettings() {
  return (
    <div className="ds-shell__page ds-shell__set">
      <div className="ds-shell__snav" aria-hidden="true">
        <b>Аккаунт</b>
        <i />
        <i data-on />
        <i />
        <b>Компания</b>
        <i />
        <i />
      </div>
      <div className="ds-shell__sbody">
        <Blk label="Заголовок раздела" hint="название · описание · действия" />
        <Blk label="Карточка" hint="поля в 2 колонки" />
        <Blk label="Карточка" hint="строки-переключатели" />
        <Blk label="Панель сохранения" hint="липкая, снизу" className="ds-shell__save" />
      </div>
    </div>
  );
}

export function PatDash() {
  return (
    <div className="ds-shell__page ds-shell__dash">
      <Blk label="Плашка" hint="Сверка идёт…" span={12} className="ds-shell__alert" />
      <Blk label="KPI" hint="3" span={3} className="ds-shell__c3" />
      <Blk label="KPI" hint="3" span={3} className="ds-shell__c3" />
      <Blk label="KPI" hint="3" span={3} className="ds-shell__c3" />
      <Blk label="KPI" hint="3" span={3} className="ds-shell__c3" />
      <Blk label="График по неделям" hint="8" span={8} className="ds-shell__c8" />
      <Blk label="Статусы" hint="4" span={4} className="ds-shell__c4" />
      <Blk label="Топ клиентов" hint="5" span={5} className="ds-shell__c5" />
      <Blk label="Прибытия" hint="4" span={4} className="ds-shell__c4b" />
      <Blk label="Лента" hint="3" span={3} className="ds-shell__c3b" />
    </div>
  );
}

const tag = (text: string) => <span className="ds-shell__tag">{text}</span>;

const PATTERNS: Record<Pat, () => ReactNode> = {
  cargo: PatCargo,
  inbox: PatInbox,
  settings: PatSettings,
  dash: PatDash,
};

export function ShellMini({
  rail,
  bp = "w",
  pattern = "cargo",
  state = "ok",
  height = 300,
  children,
}: {
  rail?: boolean;
  bp?: Bp;
  pattern?: Pat;
  state?: ShellState;
  height?: number;
  children?: ReactNode;
}) {
  const Pattern = PATTERNS[pattern];
  return (
    <AppShell
      rail={rail}
      narrow={bp === "760"}
      responsive={false}
      data-bp={bp}
      style={{ height }}
      brand={
        <>
          <span className="ds-shell__logo" aria-hidden="true" />
          {tag("бренд")}
        </>
      }
      topbar={
        <>
          {tag("топбар · 56")}
          <span className="ds-shell__search" aria-hidden="true" />
        </>
      }
      sidebar={
        <>
          {tag("сайдбар")}
          {["a", "b", "c"].map((k) => (
            <span className="ds-shell__grp" key={k} aria-hidden="true">
              <u />
              <i />
            </span>
          ))}
        </>
      }
      contentProps={{ "data-state": state }}
    >
      {state === "loading" ? (
        <div className="ds-shell__msg">
          <span className="ds-shell__orb" aria-hidden="true" />
          <b>Загружаем рабочее пространство</b>
          <small>оболочка уже на месте, загрузчик только в области контента</small>
        </div>
      ) : state === "empty" ? (
        <div className="ds-shell__msg">
          <b>Пока нет грузов</b>
          <small>EmptyState по центру области, действие одно</small>
        </div>
      ) : state === "error" ? (
        <div className="ds-shell__msg" data-tone="err">
          <b>Не удалось загрузить</b>
          <small>плашка с «Повторить»; сайдбар и топбар работают</small>
        </div>
      ) : (
        (children ?? <Pattern />)
      )}
    </AppShell>
  );
}
