/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useLayoutEffect, useRef, useState } from "react";
import { Icon } from "@/engine/Icon";
import { DemoAvatar, tone as avatarTone } from "../avatar/demo";
import { DemoBadge, type BadgeTone } from "../badge/demo";
import { DemoButton } from "../button/demo";
import { DataTable, type DataTableColumn, type DataTableTab } from "./index";
import "../tabs/tabs.force.css";
import "./data-table.force.css";

export type TableState = "data" | "loading" | "error" | "empty";
export type Density = "compact" | "normal" | "comfort";
export type Lines = "h" | "grid" | "zebra";
export type SortDir = "asc" | "desc";
export type ColId = "id" | "client" | "docs" | "day" | "w" | "st";
export interface SortState {
  col: ColId;
  dir: SortDir;
}
export type Force = "hover" | "active" | "focus";
export type TabId = "all" | "err" | "wait" | "draft";

type St = "ok" | "err" | "w1" | "w2" | "idle";
export interface Row {
  id: string;
  client: string;
  st: St;
  day: number;
  w: number;
}

const ST_LABEL: Record<St, [string, BadgeTone]> = {
  ok: ["Сверено", "ok"],
  err: ["Расхождение", "err"],
  w1: ["Ждём декларацию", "warn"],
  w2: ["Ждём накладную", "warn"],
  idle: ["Черновик", "idle"],
};
const DOCN: Record<St, number> = { ok: 3, err: 3, w1: 1, w2: 2, idle: 0 };

const CLIENTS = [
  "ООО «Дальснаб»",
  "ИП Кравец",
  "ООО «Порт-Трейд»",
  "АО «Приморье-Опт»",
  "ООО «Восток-Карго»",
  "ИП Лозовой",
];
const PFX = ["MSKU", "TGHU", "CAIU", "TCLU", "FCIU", "MRKU", "OOLU", "HLXU"];
const SEQ: St[] = ["ok", "ok", "w1", "ok", "err", "ok", "w2", "ok", "idle", "ok", "ok", "w1"];
export const ROWS: Row[] = Array.from({ length: 24 }, (_, i) => ({
  id:
    i === 0
      ? "MSKU4821907"
      : `${PFX[(i * 3) % 8]}${String(2084000 + ((i * 7919) % 6900000)).padStart(7, "0")}`,
  client: CLIENTS[(i * 5 + (i > 3 ? 1 : 0)) % 6],
  st: i === 0 ? "err" : SEQ[(i * 5) % 12],
  day: 10 + ((i * 7) % 18),
  w: 8000 + ((i * 2735) % 17000) - (((i * 2735) % 17000) % 5),
}));
ROWS[0].w = 18420;
ROWS[0].client = "ООО «Дальснаб»";

const fmt = (n: number) => n.toLocaleString("ru-RU");

const TABS: DataTableTab<Row>[] = [
  { id: "all", label: "Все", filter: () => true },
  { id: "err", label: "С расхождениями", filter: (r) => r.st === "err" },
  { id: "wait", label: "Ждут документов", filter: (r) => r.st === "w1" || r.st === "w2" },
  { id: "draft", label: "Черновики", filter: (r) => r.st === "idle" },
  { id: "archive", label: "Архив", disabled: true },
];

const COMPACT_TABS: DataTableTab<Row>[] = [
  { id: "all", label: "Все", filter: () => true },
  { id: "err", label: "Расхождения", filter: (r) => r.st === "err" },
  { id: "draft", label: "Черновики", filter: (r) => r.st === "idle" },
];

function Docs({ st }: { st: St }) {
  const n = DOCN[st];
  return (
    <span className="ds-dtable__docs">
      <span className="ds-dtable__seg" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <i
            key={i === 0 ? "a" : i === 1 ? "b" : "c"}
            className={i < n ? (st === "err" && i === 2 ? "bad" : "on") : undefined}
          />
        ))}
      </span>
      <span className="ds-dtable__muted">{`${n}/3`}</span>
    </span>
  );
}

export { Docs as DemoDocs };

const COLUMNS: DataTableColumn<Row>[] = [
  {
    id: "id",
    header: "Контейнер",
    width: 150,
    sortValue: (r) => r.id,
    cell: (r) => (
      <span className="ds-dtable__idc">
        <b>{r.id}</b>
        <button
          type="button"
          className="ds-dtable__rowact"
          aria-label="Копировать номер"
          onClick={(e) => e.stopPropagation()}
        >
          <Icon name="copy" size="xs" />
        </button>
      </span>
    ),
  },
  {
    id: "client",
    header: "Клиент",
    sortValue: (r) => r.client,
    cell: (r) => (
      <span className="ds-dtable__lead">
        <DemoAvatar name={r.client} size="sm" toneIndex={avatarTone(r.client)} />
        <span className="ds-dtable__clip" title={r.client}>
          {r.client}
        </span>
      </span>
    ),
  },
  { id: "docs", header: "Документы", width: 116, cell: (r) => <Docs st={r.st} /> },
  {
    id: "day",
    header: "Прибытие",
    width: 96,
    sortValue: (r) => r.day,
    cell: (r) => `${r.day} ноя`,
  },
  {
    id: "w",
    header: "Вес, кг",
    width: 92,
    align: "end",
    sortValue: (r) => r.w,
    cell: (r) => fmt(r.w),
  },
  {
    id: "st",
    header: "Статус",
    width: 168,
    sortValue: (r) => ST_LABEL[r.st][0],
    cell: (r) => <DemoBadge tone={ST_LABEL[r.st][1]}>{ST_LABEL[r.st][0]}</DemoBadge>,
  },
];

const rowMenu = () => (
  <button
    type="button"
    className="ds-dtable__rowact ds-dtable__rowact--md"
    aria-label="Действия"
    aria-haspopup="menu"
    aria-expanded="false"
  >
    <Icon name="more" />
  </button>
);

const MINI_COLUMNS = COLUMNS.filter((c) => c.id === "id" || c.id === "st");

function useForced(
  ref: React.RefObject<HTMLElement | null>,
  marks: { selector: string; mode?: Force }[],
) {
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const applied: Element[] = [];
    for (const { selector, mode } of marks) {
      if (!mode) continue;
      const el = root.querySelector(selector);
      if (el) {
        el.setAttribute("data-force", mode);
        applied.push(el);
      }
    }
    return () => applied.forEach((el) => el.removeAttribute("data-force"));
  });
}

export function DemoDataTable({
  state: stateProp,
  density = "normal",
  lines = "h",
  tab: tabProp,
  sort: sortProp,
  picked: pickedProp,
  page: pageProp,
  query: queryProp,
  active: activeProp,
  size: sizeProp,
  forceRow,
  forceSort,
  forceFoot,
  forceTab,
  height,
  noTabs,
  noToolbar,
  retryLoading,
  mini,
  narrow,
}: {
  narrow?: boolean;
  state?: TableState;
  density?: Density;
  lines?: Lines;
  tab?: TabId;
  sort?: SortState | null;
  picked?: string[];
  page?: number;
  query?: string;
  active?: string | null;
  size?: number;
  forceRow?: { id: string; mode: Force };
  forceSort?: { col: ColId; mode: Force };
  forceTab?: { tab: TabId; mode: Force };
  forceFoot?: { page: number; mode: Force };
  height?: number;
  noTabs?: boolean;
  noToolbar?: boolean;
  retryLoading?: boolean;
  mini?: boolean;
}) {
  const [iState, setIState] = useState<TableState>("data");
  const rootRef = useRef<HTMLDivElement>(null);
  const compact = mini || narrow;
  const sort =
    sortProp === undefined
      ? undefined
      : sortProp && { column: sortProp.col, direction: sortProp.dir };

  useForced(rootRef, [
    { selector: `tr[data-row-id="${forceRow?.id}"]`, mode: forceRow?.mode },
    { selector: `th[data-column="${forceSort?.col}"] .ds-dtable__sort`, mode: forceSort?.mode },
    { selector: `[role="tab"][data-tab="${forceTab?.tab}"]`, mode: forceTab?.mode },
    {
      selector: `button[aria-label="Страница ${(forceFoot?.page ?? 0) + 1}"]`,
      mode: forceFoot?.mode,
    },
  ]);

  const retry = () => {
    setIState("loading");
    window.setTimeout(() => setIState("data"), 800);
  };

  return (
    <DataTable
      ref={rootRef}
      label="Грузы"
      columns={compact ? MINI_COLUMNS : COLUMNS}
      rows={ROWS}
      getRowId={(r) => r.id}
      state={stateProp ?? iState}
      density={density}
      lines={lines}
      fluid={compact}
      height={height}
      tabs={noTabs || mini ? undefined : narrow ? COMPACT_TABS : TABS}
      tabsLabel="Статус грузов"
      tab={tabProp}
      searchable={!noToolbar && !mini}
      searchText={(r) => `${r.id} ${r.client}`}
      searchLabel="Поиск"
      searchPlaceholder="Поиск по номеру и клиенту"
      query={queryProp}
      filters={
        noToolbar || mini ? undefined : (
          <>
            <DemoButton variant="outline" size="sm" iconEnd="chev">
              Клиент: Все
            </DemoButton>
            <DemoButton variant="outline" size="sm" iconEnd="chev">
              Статус: Все
            </DemoButton>
          </>
        )
      }
      toolbarActions={
        noToolbar || mini ? undefined : (
          <>
            <DemoButton variant="ghost" size="sm" icon="cols">
              Колонки
            </DemoButton>
            <DemoButton variant="primary" size="sm" icon="plus">
              Новый груз
            </DemoButton>
          </>
        )
      }
      sort={sort}
      selectable
      selected={pickedProp}
      selectionActions={
        <>
          <DemoButton variant="outline" size="sm" icon="dl">
            Выгрузить
          </DemoButton>
          <DemoButton variant="outline" size="sm" icon="link">
            Сверить
          </DemoButton>
          <DemoButton variant="destructive" size="sm" icon="trash">
            В архив
          </DemoButton>
        </>
      }
      defaultActiveId="MSKU4821907"
      activeId={activeProp}
      rowActions={rowMenu}
      footer={!mini}
      page={pageProp}
      pageSize={sizeProp}
      defaultPageSize={6}
      pageSizeOptions={[6, 12, 24]}
      emptyTitle="Грузов пока нет"
      emptyText="Создайте первый груз или подключите программу, чтобы они появились здесь."
      emptyActions={
        <>
          <DemoButton variant="primary" size="sm" icon="plus">
            Новый груз
          </DemoButton>
          <DemoButton variant="outline" size="sm">
            Подключить 1С
          </DemoButton>
        </>
      }
      errorTitle="Не удалось загрузить грузы"
      errorText="ПО таможни не отвечает. Ваши данные не потеряны."
      onRetry={retry}
      retrying={retryLoading}
    />
  );
}

export function CellSamples() {
  return (
    <div className="ds-dtable__cells">
      <span className="ds-dtable__idc">
        <b>MSKU4821907</b>
        <button
          type="button"
          className="ds-dtable__rowact"
          aria-label="Копировать номер"
          style={{ opacity: 1 }}
        >
          <Icon name="copy" size="xs" />
        </button>
      </span>
      <span className="ds-dtable__lead">
        <DemoAvatar name="ООО «Дальснаб»" size="sm" />
        ООО «Дальснаб»
      </span>
      <Docs st="ok" />
      <Docs st="w2" />
      <Docs st="err" />
      <Docs st="idle" />
      <DemoBadge tone="ok">Сверено</DemoBadge>
      <DemoBadge tone="warn">Ждём накладную</DemoBadge>
      <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>18 420</span>
    </div>
  );
}
