/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import {
  useId,
  type ComponentPropsWithRef,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cx, Icon, useControlled } from "../../ui/internal";
import { Button } from "../button";
import { Card } from "../card";
import { Checkbox } from "../checkbox";
import { Input } from "../input";
import { Select } from "../select";
import { Skeleton } from "../skeleton";
import { Tab, TabList, Tabs } from "../tabs";
import "./data-table.css";

export type DataTableState = "data" | "loading" | "error" | "empty";
export type DataTableDensity = "compact" | "normal" | "comfort";
export type DataTableLines = "h" | "grid" | "zebra";
export type SortDirection = "asc" | "desc";

export interface DataTableSort {
  column: string;
  direction: SortDirection;
}

export interface DataTableColumn<Row> {
  id: string;
  header: ReactNode;
  cell: (row: Row) => ReactNode;
  width?: number;
  align?: "start" | "end";
  sortValue?: (row: Row) => string | number;
}

export interface DataTableTab<Row> {
  id: string;
  label: ReactNode;
  filter?: (row: Row) => boolean;
  count?: number;
  disabled?: boolean;
}

export interface DataTableFilterChip {
  id: string;
  label: string;
  value: string;
  onRemove: () => void;
}

export interface DataTableProps<Row> extends Omit<ComponentPropsWithRef<"div">, "children"> {
  label: string;
  columns: DataTableColumn<Row>[];
  rows: Row[];
  getRowId: (row: Row) => string;
  state?: DataTableState;
  density?: DataTableDensity;
  lines?: DataTableLines;
  fluid?: boolean;
  height?: number;
  tabs?: DataTableTab<Row>[];
  tabsLabel?: string;
  tab?: string;
  defaultTab?: string;
  onTabChange?: (tab: string) => void;
  searchable?: boolean;
  searchText?: (row: Row) => string;
  searchLabel?: string;
  searchPlaceholder?: string;
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  filters?: ReactNode;
  toolbarActions?: ReactNode;
  appliedFilters?: DataTableFilterChip[];
  onReset?: () => void;
  sort?: DataTableSort | null;
  defaultSort?: DataTableSort | null;
  onSortChange?: (sort: DataTableSort | null) => void;
  selectable?: boolean;
  selected?: string[];
  defaultSelected?: string[];
  onSelectedChange?: (ids: string[]) => void;
  selectionActions?: ReactNode;
  activeId?: string | null;
  defaultActiveId?: string | null;
  onActiveChange?: (id: string | null) => void;
  onRowOpen?: (row: Row) => void;
  rowActions?: (row: Row) => ReactNode;
  pagination?: boolean;
  footer?: boolean;
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  defaultPageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  skeletonRows?: number;
  emptyTitle?: string;
  emptyText?: string;
  emptyActions?: ReactNode;
  errorTitle?: string;
  errorText?: string;
  onRetry?: () => void;
  retrying?: boolean;
}

function pagesList(current: number, count: number): (number | "…")[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i);
  const list: (number | "…")[] = [0];
  if (current > 2) list.push("…");
  for (let i = Math.max(1, current - 1); i <= Math.min(count - 2, current + 1); i++) list.push(i);
  if (current < count - 3) list.push("…");
  list.push(count - 1);
  return list;
}

const fmt = (n: number) => n.toLocaleString("ru-RU");

const NO_FILTERS: DataTableFilterChip[] = [];
const NO_IDS: string[] = [];
const DEFAULT_PAGE_SIZES = [10, 25, 50];

export function DataTable<Row>({
  label,
  columns,
  rows,
  getRowId,
  state = "data",
  density = "normal",
  lines = "h",
  fluid,
  height,
  tabs,
  tabsLabel = "Фильтр по статусу",
  tab: tabProp,
  defaultTab,
  onTabChange,
  searchable,
  searchText,
  searchLabel = "Поиск",
  searchPlaceholder = "Поиск",
  query: queryProp,
  defaultQuery = "",
  onQueryChange,
  filters,
  toolbarActions,
  appliedFilters = NO_FILTERS,
  onReset,
  sort: sortProp,
  defaultSort = null,
  onSortChange,
  selectable,
  selected: selectedProp,
  defaultSelected = NO_IDS,
  onSelectedChange,
  selectionActions,
  activeId: activeProp,
  defaultActiveId = null,
  onActiveChange,
  onRowOpen,
  rowActions,
  pagination = true,
  footer = true,
  page: pageProp,
  defaultPage = 0,
  onPageChange,
  pageSize: pageSizeProp,
  defaultPageSize,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  skeletonRows = 6,
  emptyTitle = "Данных пока нет",
  emptyText = "Когда данные появятся, они будут здесь.",
  emptyActions,
  errorTitle = "Не удалось загрузить данные",
  errorText = "Ваши данные не потеряны. Попробуйте ещё раз.",
  onRetry,
  retrying,
  className,
  style,
  ...rest
}: DataTableProps<Row>) {
  const firstTab = tabs?.[0]?.id ?? "";
  const [tab, setTab] = useControlled(tabProp, defaultTab ?? firstTab, onTabChange);
  const [query, setQuery] = useControlled(queryProp, defaultQuery, onQueryChange);
  const [sort, setSort] = useControlled<DataTableSort | null>(sortProp, defaultSort, onSortChange);
  const [picked, setPicked] = useControlled(selectedProp, defaultSelected, onSelectedChange);
  const [activeId, setActiveId] = useControlled<string | null>(
    activeProp,
    defaultActiveId,
    onActiveChange,
  );
  const [pageRaw, setPage] = useControlled(pageProp, defaultPage, onPageChange);
  const [size, setSize] = useControlled(
    pageSizeProp,
    defaultPageSize ?? pageSizeOptions[0] ?? 10,
    onPageSizeChange,
  );

  const tableId = useId();

  const kind: DataTableState = state === "data" && rows.length === 0 ? "empty" : state;
  const data = kind === "data";
  const q = query.trim().toLowerCase();

  const activeTab = tabs?.find((t) => t.id === tab);
  let view = activeTab?.filter ? rows.filter(activeTab.filter) : rows;
  if (q && searchText) view = view.filter((row) => searchText(row).toLowerCase().includes(q));
  if (sort) {
    const column = columns.find((c) => c.id === sort.column);
    const value = column?.sortValue;
    if (value) {
      view = view.toSorted((a, b) => {
        const x = value(a);
        const y = value(b);
        const r =
          typeof x === "number" && typeof y === "number"
            ? x - y
            : String(x).localeCompare(String(y), "ru");
        return sort.direction === "asc" ? r : -r;
      });
    }
  }

  const pages = pagination ? Math.max(1, Math.ceil(view.length / size)) : 1;
  const page = Math.min(pageRaw, pages - 1);
  const pageRows = pagination ? view.slice(page * size, (page + 1) * size) : view;
  const pageIds = pageRows.map(getRowId);
  const pickedOnPage = pageIds.filter((id) => picked.includes(id)).length;
  const showBody = data && view.length > 0;
  const noResults = data && view.length === 0;
  const hasActions = Boolean(rowActions);
  const span = columns.length + (selectable ? 1 : 0) + (hasActions ? 1 : 0);

  const goPage = (next: number) => setPage(Math.max(0, Math.min(pages - 1, next)));
  const changeTab = (id: string) => {
    setTab(id);
    setPage(0);
  };
  const changeQuery = (next: string) => {
    setQuery(next);
    setPage(0);
  };
  const cycleSort = (column: string) => {
    setPage(0);
    setSort(
      !sort || sort.column !== column
        ? { column, direction: "asc" }
        : sort.direction === "asc"
          ? { column, direction: "desc" }
          : null,
    );
  };
  const reset = () => {
    setQuery("");
    if (tabs?.length) setTab(firstTab);
    setPage(0);
    onReset?.();
  };
  const togglePick = (id: string) =>
    setPicked(picked.includes(id) ? picked.filter((x) => x !== id) : [...picked, id]);
  const toggleAll = () =>
    setPicked(
      pickedOnPage === pageIds.length
        ? picked.filter((x) => !pageIds.includes(x))
        : [...new Set([...picked, ...pageIds])],
    );
  const changeSize = (next: string) => {
    setSize(Number(next));
    setPage(0);
  };
  const openRow = (row: Row) => {
    setActiveId(getRowId(row));
    onRowOpen?.(row);
  };
  const onRowKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, row: Row) => {
    if ((event.key === "Enter" || event.key === " ") && event.target === event.currentTarget) {
      event.preventDefault();
      openRow(row);
    }
  };

  const chips: DataTableFilterChip[] = [
    ...(q
      ? [{ id: "query", label: "Поиск", value: query.trim(), onRemove: () => changeQuery("") }]
      : []),
    ...appliedFilters,
  ];
  const showToolbar = Boolean(searchable || filters || toolbarActions);
  const sortIcon = (id: string) =>
    sort?.column === id ? (sort.direction === "asc" ? "up" : "down") : "sortb";
  const note = (children: ReactNode) => (
    <tr className="ds-dtable__static">
      <td colSpan={span}>
        <div className="ds-dtable__note">{children}</div>
      </td>
    </tr>
  );
  const rootStyle = height
    ? ({ ...style, "--ds-dtable-h": `${height}px` } as CSSProperties)
    : style;

  return (
    <Card
      {...rest}
      flush
      className={cx("ds-dtable", fluid && "ds-dtable--mini", className)}
      data-density={density}
      data-lines={lines}
      style={rootStyle}
    >
      {tabs?.length ? (
        <Tabs value={tab} onValueChange={changeTab}>
          <TabList aria-label={tabsLabel} className="ds-dtable__tabs">
            {tabs.map((t) => (
              <Tab
                key={t.id}
                value={t.id}
                disabled={t.disabled}
                count={t.count ?? (t.filter ? rows.filter(t.filter).length : undefined)}
                aria-controls={tableId}
              >
                {t.label}
              </Tab>
            ))}
          </TabList>
        </Tabs>
      ) : null}
      {showToolbar ? (
        <div className="ds-dtable__bar" role="toolbar" aria-label="Инструменты таблицы">
          {searchable ? (
            <Input
              compact
              clearable
              lead={<Icon name="search" size="sm" />}
              fieldClassName="ds-dtable__search"
              placeholder={searchPlaceholder}
              aria-label={searchLabel}
              value={query}
              onValueChange={changeQuery}
            />
          ) : null}
          {filters}
          <span className="ds-dtable__grow" />
          {toolbarActions}
        </div>
      ) : null}
      {chips.length && data ? (
        <div className="ds-dtable__chips">
          {chips.map((chip) => (
            <span className="ds-dtable__chip" key={chip.id}>
              <span>{chip.label}:</span>
              {chip.value}
              <button
                type="button"
                aria-label={`Убрать фильтр ${chip.label}`}
                onClick={chip.onRemove}
              >
                <Icon name="x" size="xs" />
              </button>
            </span>
          ))}
          <button type="button" className="ds-dtable__reset" onClick={reset}>
            Сбросить всё
          </button>
        </div>
      ) : null}
      <div className="ds-dtable__wrap" data-anim={kind === "loading" ? "wave" : undefined}>
        <table
          id={tableId}
          className="ds-dtable__table"
          // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
          role="grid"
          aria-label={label}
          aria-rowcount={data ? view.length + 1 : undefined}
          aria-busy={kind === "loading" || undefined}
        >
          <colgroup>
            {selectable ? <col style={{ width: 44 }} /> : null}
            {columns.map((c) => (
              <col key={c.id} style={c.width && !fluid ? { width: c.width } : undefined} />
            ))}
            {hasActions ? <col style={{ width: 52 }} /> : null}
          </colgroup>
          <thead>
            <tr aria-rowindex={data ? 1 : undefined}>
              {selectable ? (
                <th className="ds-dtable__chk" scope="col">
                  <Checkbox
                    aria-label="Выбрать все на странице"
                    checked={showBody && pickedOnPage === pageRows.length && pageRows.length > 0}
                    indeterminate={pickedOnPage > 0 && pickedOnPage < pageRows.length}
                    disabled={!showBody}
                    onChange={toggleAll}
                  />
                </th>
              ) : null}
              {columns.map((c) => {
                const direction = sort?.column === c.id ? sort.direction : null;
                const end = c.align === "end";
                return (
                  <th
                    key={c.id}
                    scope="col"
                    data-column={c.id}
                    className={end ? "ds-dtable__end" : undefined}
                    aria-sort={
                      direction
                        ? direction === "asc"
                          ? "ascending"
                          : "descending"
                        : c.sortValue
                          ? "none"
                          : undefined
                    }
                  >
                    {c.sortValue ? (
                      <button
                        type="button"
                        className={cx("ds-dtable__sort", end && "ds-dtable__sort--end")}
                        data-sorted={direction ? "" : undefined}
                        onClick={() => cycleSort(c.id)}
                      >
                        <span>{c.header}</span>
                        <Icon name={sortIcon(c.id)} size="sm" />
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                );
              })}
              {hasActions ? (
                <th scope="col">
                  <span className="ds-dtable__sr">Действия</span>
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {kind === "loading"
              ? Array.from({ length: skeletonRows }, (_, r) => (
                  <tr className="ds-dtable__static" aria-hidden="true" key={r}>
                    {selectable ? (
                      <td className="ds-dtable__chk" aria-label="Загрузка">
                        <Skeleton
                          width={16}
                          height={16}
                          style={{ ["--ds-dtable-d" as string]: `${r * 0.08}s` }}
                        />
                      </td>
                    ) : null}
                    {columns.map((c, i) => (
                      <td key={c.id} aria-label="Загрузка">
                        <Skeleton
                          width={i === 0 ? "70%" : c.align === "end" ? "40%" : "55%"}
                          style={{
                            marginLeft: c.align === "end" ? "auto" : undefined,
                            ["--ds-dtable-d" as string]: `${r * 0.08}s`,
                          }}
                        />
                      </td>
                    ))}
                    {hasActions ? <td aria-label="Загрузка" /> : null}
                  </tr>
                ))
              : null}
            {kind === "error"
              ? note(
                  <>
                    <span className="ds-dtable__e">
                      <Icon name="alert" />
                      {errorTitle}
                    </span>
                    <span>{errorText}</span>
                    {onRetry ? (
                      <Button variant="outline" size="sm" loading={retrying} onClick={onRetry}>
                        Повторить
                      </Button>
                    ) : null}
                  </>,
                )
              : null}
            {kind === "empty"
              ? note(
                  <>
                    <span className="ds-dtable__big">
                      <Icon name="inbox" size="xl" />
                    </span>
                    <b>{emptyTitle}</b>
                    <span>{emptyText}</span>
                    {emptyActions ? <span className="ds-dtable__acts">{emptyActions}</span> : null}
                  </>,
                )
              : null}
            {noResults
              ? note(
                  <>
                    <span className="ds-dtable__big">
                      <Icon name="search" size="xl" />
                    </span>
                    <b>Ничего не нашлось</b>
                    <span>
                      {q
                        ? `По запросу «${query.trim()}» ничего нет.`
                        : "По этим условиям строк нет."}
                    </span>
                    <Button variant="outline" size="sm" onClick={reset}>
                      Сбросить всё
                    </Button>
                  </>,
                )
              : null}
            {showBody
              ? pageRows.map((row, i) => {
                  const id = pageIds[i];
                  const isPicked = picked.includes(id);
                  const on = isPicked || activeId === id;
                  return (
                    <tr
                      key={id}
                      tabIndex={0}
                      data-row-id={id}
                      data-on={on || undefined}
                      aria-selected={on}
                      aria-rowindex={(pagination ? page * size : 0) + i + 2}
                      onClick={() => openRow(row)}
                      onKeyDown={(event) => onRowKeyDown(event, row)}
                    >
                      {selectable ? (
                        <td className="ds-dtable__chk" onClick={(event) => event.stopPropagation()}>
                          <Checkbox
                            aria-label={`Выбрать ${id}`}
                            checked={isPicked}
                            onChange={() => togglePick(id)}
                          />
                        </td>
                      ) : null}
                      {columns.map((c) => (
                        <td key={c.id} className={c.align === "end" ? "ds-dtable__end" : undefined}>
                          {c.cell(row)}
                        </td>
                      ))}
                      {hasActions ? (
                        <td className="ds-dtable__end" onClick={(event) => event.stopPropagation()}>
                          {rowActions?.(row)}
                        </td>
                      ) : null}
                    </tr>
                  );
                })
              : null}
          </tbody>
        </table>
      </div>
      {data ? (
        <span className="ds-dtable__sr" role="status">
          {`Найдено строк: ${view.length}`}
        </span>
      ) : null}
      {data && selectable && picked.length ? (
        <div className="ds-dtable__selbar" role="region" aria-label="Действия над выбранным">
          <b>Выбрано: {picked.length}</b>
          {selectionActions}
          <span className="ds-dtable__grow" />
          <Button
            variant="ghost"
            size="md"
            square
            icon={<Icon name="x" />}
            aria-label="Снять выбор"
            onClick={() => setPicked([])}
          />
        </div>
      ) : null}
      {showBody && pagination && footer ? (
        <div className="ds-dtable__foot">
          {selectable ? (
            <span className="ds-dtable__n ds-dtable__n--sel">
              Выбрано: {picked.length} из {fmt(rows.length)}
            </span>
          ) : null}
          <span className="ds-dtable__grow" />
          {pageSizeOptions.length > 1 ? (
            <Select
              variant="control"
              fieldClassName="ds-dtable__size"
              controlLabel="Строк"
              placeholder={String(size)}
              aria-label={`Строк на странице: ${size}`}
              options={pageSizeOptions.map((n) => ({ value: String(n), label: String(n) }))}
              value={String(size)}
              onValueChange={changeSize}
            />
          ) : null}
          <span className="ds-dtable__n">
            {page * size + 1}–{Math.min((page + 1) * size, view.length)} из {fmt(view.length)}
          </span>
          <button
            type="button"
            className="ds-dtable__pg"
            aria-label="Предыдущая страница"
            disabled={page === 0}
            onClick={() => goPage(page - 1)}
          >
            <Icon name="chevl" size="sm" />
          </button>
          {pagesList(page, pages).map((p, i) =>
            p === "…" ? (
              <span className="ds-dtable__muted ds-dtable__gap" key={`gap-${i === 1 ? "a" : "b"}`}>
                …
              </span>
            ) : (
              <button
                type="button"
                key={p}
                className="ds-dtable__pg"
                aria-label={`Страница ${p + 1}`}
                aria-current={p === page ? "page" : undefined}
                onClick={() => goPage(p)}
              >
                {p + 1}
              </button>
            ),
          )}
          <button
            type="button"
            className="ds-dtable__pg"
            aria-label="Следующая страница"
            disabled={page >= pages - 1}
            onClick={() => goPage(page + 1)}
          >
            <Icon name="chevr" size="sm" />
          </button>
        </div>
      ) : null}
    </Card>
  );
}
