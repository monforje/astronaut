/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { fireEvent, render, screen, within } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { DataTable, type DataTableColumn, type DataTableTab } from "./index";

interface Cargo {
  id: string;
  client: string;
  weight: number;
  status: "ok" | "err" | "draft";
}

const ROWS: Cargo[] = [
  { id: "MSKU1", client: "Дальснаб", weight: 300, status: "err" },
  { id: "TGHU2", client: "Порт-Трейд", weight: 100, status: "ok" },
  { id: "CAIU3", client: "Восток-Карго", weight: 200, status: "ok" },
  { id: "TCLU4", client: "Кравец", weight: 50, status: "draft" },
  { id: "FCIU5", client: "Лозовой", weight: 400, status: "ok" },
];

const COLUMNS: DataTableColumn<Cargo>[] = [
  { id: "id", header: "Контейнер", sortValue: (r) => r.id, cell: (r) => r.id },
  { id: "client", header: "Клиент", sortValue: (r) => r.client, cell: (r) => r.client },
  {
    id: "weight",
    header: "Вес",
    align: "end",
    sortValue: (r) => r.weight,
    cell: (r) => String(r.weight),
  },
  { id: "note", header: "Заметка", cell: () => "—" },
];

const TABS: DataTableTab<Cargo>[] = [
  { id: "all", label: "Все" },
  { id: "err", label: "Расхождения", filter: (r) => r.status === "err" },
  { id: "draft", label: "Черновики", filter: (r) => r.status === "draft" },
  { id: "archive", label: "Архив", disabled: true },
];

function setup(props: Partial<Parameters<typeof DataTable<Cargo>>[0]> = {}) {
  return render(
    <DataTable
      label="Грузы"
      columns={COLUMNS}
      rows={ROWS}
      getRowId={(r) => r.id}
      pageSizeOptions={[2, 4]}
      {...props}
    />,
  );
}

const bodyIds = () =>
  screen
    .getAllByRole("row")
    .slice(1)
    .map((row) => row.getAttribute("data-row-id"));

describe("DataTable: рендер", () => {
  it("таблица role=grid с подписью, шапкой scope=col и числом строк", () => {
    setup({ pageSize: 10 });
    const grid = screen.getByRole("grid", { name: "Грузы" });
    expect(grid.getAttribute("aria-rowcount")).toBe("6");
    expect(screen.getAllByRole("columnheader").length).toBe(4);
    expect(screen.getByText("MSKU1")).toBeTruthy();
  });

  it("плотность и линии выражены атрибутами корня, fluid — классом", () => {
    const { container } = setup({ density: "compact", lines: "zebra", fluid: true });
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute("data-density")).toBe("compact");
    expect(root.getAttribute("data-lines")).toBe("zebra");
    expect(root.classList.contains("ds-dtable--mini")).toBe(true);
  });

  it("правая колонка выравнивается классом end", () => {
    const { container } = setup({ pageSize: 10 });
    expect(container.querySelectorAll("th.ds-dtable__end").length).toBe(1);
    expect(container.querySelectorAll("td.ds-dtable__end").length).toBe(5);
  });

  it("без selectable и rowActions нет колонок флажков и действий", () => {
    const { container } = setup();
    expect(container.querySelector("input[type=checkbox]")).toBeNull();
    expect(screen.queryByText("Действия")).toBeNull();
  });

  it("className, ref и атрибуты пробрасываются, data-force нет", () => {
    const ref = createRef<HTMLDivElement>();
    setup({ ref, className: "custom", "data-testid": "dt" } as never);
    const root = screen.getByTestId("dt");
    expect(ref.current).toBe(root);
    expect(root.classList.contains("custom")).toBe(true);
    expect(root.hasAttribute("data-force")).toBe(false);
  });

  it("высота ограничивает прокрутку через css-переменную", () => {
    const { container } = setup({ height: 260 });
    expect(
      (container.firstElementChild as HTMLElement).style.getPropertyValue("--ds-dtable-h"),
    ).toBe("260px");
  });
});

describe("DataTable: сортировка", () => {
  it("цикл asc → desc → сброс и aria-sort у заголовка", () => {
    setup({ pageSize: 10 });
    const header = screen.getByRole("columnheader", { name: /Вес/ });
    expect(header.getAttribute("aria-sort")).toBe("none");
    const button = within(header).getByRole("button");
    fireEvent.click(button);
    expect(header.getAttribute("aria-sort")).toBe("ascending");
    expect(bodyIds()).toEqual(["TCLU4", "TGHU2", "CAIU3", "MSKU1", "FCIU5"]);
    fireEvent.click(button);
    expect(header.getAttribute("aria-sort")).toBe("descending");
    expect(bodyIds()[0]).toBe("FCIU5");
    fireEvent.click(button);
    expect(header.getAttribute("aria-sort")).toBe("none");
    expect(bodyIds()[0]).toBe("MSKU1");
  });

  it("колонка без sortValue не сортируется и не получает aria-sort", () => {
    setup();
    const header = screen.getByRole("columnheader", { name: "Заметка" });
    expect(header.hasAttribute("aria-sort")).toBe(false);
    expect(within(header).queryByRole("button")).toBeNull();
  });

  it("строки сортируются по-русски, управляемая сортировка вызывает onSortChange", () => {
    const onSort = vi.fn();
    setup({ pageSize: 10, sort: { column: "client", direction: "asc" }, onSortChange: onSort });
    expect(bodyIds()).toEqual(["CAIU3", "MSKU1", "TCLU4", "FCIU5", "TGHU2"]);
    fireEvent.click(
      within(screen.getByRole("columnheader", { name: /Клиент/ })).getByRole("button"),
    );
    expect(onSort).toHaveBeenCalledWith({ column: "client", direction: "desc" });
    expect(bodyIds()[0]).toBe("CAIU3");
  });
});

describe("DataTable: выбор строк", () => {
  it("флажок строки и «выбрать все на странице» с промежуточным состоянием", () => {
    const onSelected = vi.fn();
    setup({ selectable: true, onSelectedChange: onSelected });
    const all = screen.getByRole("checkbox", {
      name: "Выбрать все на странице",
    }) as HTMLInputElement;
    fireEvent.click(screen.getByRole("checkbox", { name: "Выбрать MSKU1" }));
    expect(onSelected).toHaveBeenLastCalledWith(["MSKU1"]);
    expect(all.indeterminate).toBe(true);
    fireEvent.click(all);
    expect(onSelected).toHaveBeenLastCalledWith(["MSKU1", "TGHU2"]);
    expect(all.checked).toBe(true);
    expect(all.indeterminate).toBe(false);
    fireEvent.click(all);
    expect(onSelected).toHaveBeenLastCalledWith([]);
  });

  it("панель выбора: счётчик, действия и «Снять выбор»", () => {
    setup({
      selectable: true,
      defaultSelected: ["MSKU1", "TGHU2"],
      selectionActions: <button type="button">Выгрузить</button>,
    });
    const bar = screen.getByRole("region", { name: "Действия над выбранным" });
    expect(bar.textContent).toContain("Выбрано: 2");
    expect(within(bar).getByRole("button", { name: "Выгрузить" })).toBeTruthy();
    fireEvent.click(within(bar).getByRole("button", { name: "Снять выбор" }));
    expect(screen.queryByRole("region", { name: "Действия над выбранным" })).toBeNull();
  });

  it("выбранная строка помечена aria-selected и data-on, клик по флажку не открывает строку", () => {
    const onOpen = vi.fn();
    setup({ selectable: true, defaultSelected: ["TGHU2"], onRowOpen: onOpen });
    const rows = screen.getAllByRole("row");
    expect(rows[2].getAttribute("aria-selected")).toBe("true");
    expect(rows[2].hasAttribute("data-on")).toBe(true);
    fireEvent.click(screen.getByRole("checkbox", { name: "Выбрать MSKU1" }));
    expect(onOpen).not.toHaveBeenCalled();
  });
});

describe("DataTable: активная строка", () => {
  it("клик и Enter открывают строку, Space тоже; клавиши на вложенных контролах не открывают", () => {
    const onOpen = vi.fn();
    setup({
      pageSize: 10,
      onRowOpen: onOpen,
      rowActions: () => <button type="button">Меню</button>,
    });
    const row = screen.getAllByRole("row")[1];
    fireEvent.click(row);
    expect(onOpen).toHaveBeenLastCalledWith(ROWS[0]);
    expect(row.getAttribute("aria-selected")).toBe("true");
    fireEvent.keyDown(screen.getAllByRole("row")[2], { key: "Enter" });
    expect(onOpen).toHaveBeenLastCalledWith(ROWS[1]);
    fireEvent.keyDown(screen.getAllByRole("row")[3], { key: " " });
    expect(onOpen).toHaveBeenLastCalledWith(ROWS[2]);
    const calls = onOpen.mock.calls.length;
    fireEvent.keyDown(screen.getAllByRole("button", { name: "Меню" })[0], { key: "Enter" });
    expect(onOpen.mock.calls.length).toBe(calls);
  });

  it("клик по ячейке действий строку не открывает", () => {
    const onOpen = vi.fn();
    setup({ onRowOpen: onOpen, rowActions: () => <button type="button">Меню</button> });
    fireEvent.click(screen.getAllByRole("button", { name: "Меню" })[0]);
    expect(onOpen).not.toHaveBeenCalled();
  });

  it("activeId=null снимает подсветку", () => {
    setup({ activeId: null });
    expect(screen.getAllByRole("row")[1].getAttribute("aria-selected")).toBe("false");
  });

  it("строки в Tab: tabindex=0", () => {
    setup();
    expect(screen.getAllByRole("row")[1].getAttribute("tabindex")).toBe("0");
  });
});

describe("DataTable: вкладки", () => {
  it("вкладки со счётчиками, фильтр по выбранной, стрелки переключают", () => {
    const onTab = vi.fn();
    setup({ tabs: TABS, pageSize: 10, onTabChange: onTab });
    const tablist = screen.getByRole("tablist", { name: "Фильтр по статусу" });
    const tabs = within(tablist).getAllByRole("tab");
    expect(tabs[0].getAttribute("aria-selected")).toBe("true");
    expect(tabs[1].textContent).toBe("Расхождения1");
    expect((tabs[3] as HTMLButtonElement).disabled).toBe(true);
    tabs[0].focus();
    fireEvent.keyDown(tabs[0], { key: "ArrowRight" });
    expect(onTab).toHaveBeenLastCalledWith("err");
    expect(bodyIds()).toEqual(["MSKU1"]);
    expect(document.activeElement).toBe(tabs[1]);
    fireEvent.keyDown(tabs[1], { key: "End" });
    expect(onTab).toHaveBeenLastCalledWith("draft");
    fireEvent.keyDown(tabs[2], { key: "ArrowRight" });
    expect(onTab).toHaveBeenLastCalledWith("all");
  });

  it("вкладки управляют таблицей через aria-controls", () => {
    setup({ tabs: TABS });
    const grid = screen.getByRole("grid", { name: "Грузы" });
    for (const tab of screen.getAllByRole("tab")) {
      expect(tab.getAttribute("aria-controls")).toBe(grid.id);
    }
  });

  it("у выбранной вкладки tabindex=0, у остальных -1", () => {
    setup({ tabs: TABS, defaultTab: "draft" });
    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((t) => t.getAttribute("tabindex"))).toEqual(["-1", "-1", "0", "-1"]);
  });
});

describe("DataTable: поиск и сброс", () => {
  it("поиск фильтрует по searchText, показывает чип и очищается", () => {
    setup({
      searchable: true,
      searchText: (r) => `${r.id} ${r.client}`,
      pageSize: 10,
    });
    const input = screen.getByRole("textbox", { name: "Поиск" });
    fireEvent.change(input, { target: { value: "порт" } });
    expect(bodyIds()).toEqual(["TGHU2"]);
    expect(screen.getByText("Поиск:")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Убрать фильтр Поиск" }));
    expect(bodyIds().length).toBe(5);
  });

  it("ничего не нашлось: сообщение и «Сбросить всё» возвращает данные и первую вкладку", () => {
    setup({
      searchable: true,
      searchText: (r) => r.id,
      tabs: TABS,
      defaultTab: "draft",
      defaultQuery: "ZZZ",
      pageSize: 10,
    });
    expect(screen.getByText("Ничего не нашлось")).toBeTruthy();
    expect(screen.getByText("По запросу «ZZZ» ничего нет.")).toBeTruthy();
    fireEvent.click(screen.getAllByRole("button", { name: "Сбросить всё" })[0]);
    expect(bodyIds().length).toBe(5);
    expect(screen.getAllByRole("tab")[0].getAttribute("aria-selected")).toBe("true");
  });

  it("внешние фильтры рисуются чипами с удалением", () => {
    const onRemove = vi.fn();
    setup({ appliedFilters: [{ id: "c", label: "Клиент", value: "Дальснаб", onRemove }] });
    fireEvent.click(screen.getByRole("button", { name: "Убрать фильтр Клиент" }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});

describe("DataTable: страницы", () => {
  it("диапазон, переходы, aria-current и размер страницы из списка", () => {
    setup();
    expect(screen.getByText(/1–2 из 5/)).toBeTruthy();
    expect(bodyIds()).toEqual(["MSKU1", "TGHU2"]);
    const prev = screen.getByRole("button", { name: "Предыдущая страница" }) as HTMLButtonElement;
    expect(prev.disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Страница 2" }));
    expect(bodyIds()).toEqual(["CAIU3", "TCLU4"]);
    expect(screen.getByRole("button", { name: "Страница 2" }).getAttribute("aria-current")).toBe(
      "page",
    );
    fireEvent.click(screen.getByRole("button", { name: "Следующая страница" }));
    expect(bodyIds()).toEqual(["FCIU5"]);
    expect(
      (screen.getByRole("button", { name: "Следующая страница" }) as HTMLButtonElement).disabled,
    ).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: /Строк на странице: 2/ }));
    fireEvent.click(screen.getByRole("option", { name: "4" }));
    expect(screen.getByText(/1–4 из 5/)).toBeTruthy();
  });

  it("управляемая страница: onPageChange вызывается, страница не уходит за край", () => {
    const onPage = vi.fn();
    setup({ page: 99, onPageChange: onPage });
    expect(bodyIds()).toEqual(["FCIU5"]);
    fireEvent.click(screen.getByRole("button", { name: "Предыдущая страница" }));
    expect(onPage).toHaveBeenCalledWith(1);
  });

  it("footer=false скрывает подвал, но страницы остаются; pagination=false показывает всё", () => {
    const { rerender } = setup({ footer: false });
    expect(screen.queryByRole("button", { name: "Следующая страница" })).toBeNull();
    expect(bodyIds().length).toBe(2);
    rerender(
      <DataTable
        label="Грузы"
        columns={COLUMNS}
        rows={ROWS}
        getRowId={(r) => r.id}
        pagination={false}
      />,
    );
    expect(bodyIds().length).toBe(5);
  });

  it("при многих страницах между краями ставится многоточие", () => {
    const many = Array.from({ length: 40 }, (_, i) => ({
      id: `R${i}`,
      client: "x",
      weight: i,
      status: "ok" as const,
    }));
    const { container } = render(
      <DataTable
        label="Грузы"
        columns={COLUMNS}
        rows={many}
        getRowId={(r) => r.id}
        defaultPageSize={4}
        pageSizeOptions={[4]}
        defaultPage={4}
      />,
    );
    expect(container.querySelectorAll(".ds-dtable__gap").length).toBe(2);
  });
});

describe("DataTable: состояния", () => {
  it("loading: aria-busy и скелетон-строки вместо данных", () => {
    const { container } = setup({ state: "loading", skeletonRows: 3 });
    expect(screen.getByRole("grid").getAttribute("aria-busy")).toBe("true");
    expect(container.querySelectorAll("tbody tr.ds-dtable__static").length).toBe(3);
    expect(screen.queryByText("MSKU1")).toBeNull();
  });

  it("error: заголовок, текст и «Повторить», при retrying кнопка занята", () => {
    const onRetry = vi.fn();
    const { rerender } = setup({
      state: "error",
      errorTitle: "Не удалось загрузить грузы",
      onRetry,
    });
    expect(screen.getByText("Не удалось загрузить грузы")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Повторить" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    rerender(
      <DataTable
        label="Грузы"
        columns={COLUMNS}
        rows={ROWS}
        getRowId={(r) => r.id}
        state="error"
        onRetry={onRetry}
        retrying
      />,
    );
    expect(screen.getByRole("button", { name: "Повторить" }).getAttribute("aria-busy")).toBe(
      "true",
    );
  });

  it("empty: явное состояние и пустой rows показывают заглушку с действиями", () => {
    const { rerender } = setup({
      state: "empty",
      emptyTitle: "Грузов пока нет",
      emptyActions: <button type="button">Новый груз</button>,
    });
    expect(screen.getByText("Грузов пока нет")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Новый груз" })).toBeTruthy();
    rerender(<DataTable label="Грузы" columns={COLUMNS} rows={[]} getRowId={(r) => r.id} />);
    expect(screen.getByText("Данных пока нет")).toBeTruthy();
  });

  it("в состояниях без данных нет подвала, выбора и флажок «все» отключён", () => {
    setup({ state: "error", selectable: true, defaultSelected: ["MSKU1"] });
    expect(screen.queryByRole("region", { name: "Действия над выбранным" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Следующая страница" })).toBeNull();
    expect(
      (screen.getByRole("checkbox", { name: "Выбрать все на странице" }) as HTMLInputElement)
        .disabled,
    ).toBe(true);
  });

  it("результат поиска объявляется в области status", () => {
    setup({ pageSize: 10 });
    expect(screen.getByRole("status").textContent).toBe("Найдено строк: 5");
  });
});

describe("DataTable: тулбар", () => {
  it("фильтры и действия рисуются в панели инструментов", () => {
    setup({
      searchable: true,
      filters: <button type="button">Клиент: Все</button>,
      toolbarActions: <button type="button">Новый груз</button>,
    });
    const toolbar = screen.getByRole("toolbar", { name: "Инструменты таблицы" });
    expect(within(toolbar).getByRole("button", { name: "Клиент: Все" })).toBeTruthy();
    expect(within(toolbar).getByRole("button", { name: "Новый груз" })).toBeTruthy();
  });

  it("без поиска, фильтров и действий панели нет", () => {
    setup();
    expect(screen.queryByRole("toolbar")).toBeNull();
  });
});
