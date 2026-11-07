/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DocPage } from "@/engine/DocPage";
import { entryById } from "@/engine/registry";
import { entryPath, parseEntryRest, readLastTab, writeLastTab } from "@/engine/route";
import { Sidebar } from "./Sidebar";
import { EntryRoute } from "./pages";

const scrollIntoView = vi.fn();

class FakeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", FakeObserver);
  Element.prototype.scrollIntoView = scrollIntoView;
  window.scrollTo = vi.fn();
  localStorage.clear();
});

afterEach(() => {
  scrollIntoView.mockClear();
  vi.unstubAllGlobals();
});

function Where() {
  return <output data-testid="where">{useLocation().pathname}</output>;
}

function open(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path=":id/*" element={<EntryRoute />} />
      </Routes>
      <Where />
    </MemoryRouter>,
  );
}

const selectedTab = () => screen.getByRole("tab", { selected: true }).textContent;
const tocLinks = () =>
  within(screen.getByRole("navigation", { name: "На этой странице" }))
    .getAllByRole("link")
    .map((a) => a.textContent);

describe("маршруты вкладок", () => {
  it("разбор адреса: старые ссылки с секцией остаются спецификацией", () => {
    expect(parseEntryRest(undefined)).toEqual({ tab: "spec", section: undefined });
    expect(parseEntryRest("states")).toEqual({ tab: "spec", section: "states" });
    expect(parseEntryRest("component")).toEqual({ tab: "component", section: undefined });
    expect(parseEntryRest("component/props")).toEqual({ tab: "component", section: "props" });
  });

  it("сборка адреса", () => {
    expect(entryPath("button", "spec")).toBe("/button");
    expect(entryPath("button", "spec", "states")).toBe("/button/states");
    expect(entryPath("button", "component")).toBe("/button/component");
    expect(entryPath("button", "component", "props")).toBe("/button/component/props");
  });

  it("последняя вкладка хранится в localStorage и не падает без него", () => {
    expect(readLastTab()).toBe("spec");
    writeLastTab("component");
    expect(readLastTab()).toBe("component");
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    });
    expect(readLastTab()).toBe("spec");
    expect(() => writeLastTab("spec")).not.toThrow();
  });
});

describe("страница записи с вкладками", () => {
  it("#/button открывает «Хореография» с подтекстом «Спецификация»", () => {
    open("/button");
    expect(selectedTab()).toContain("Хореография");
    expect(selectedTab()).toContain("Спецификация");
    expect(screen.getByRole("tabpanel")).toBeTruthy();
    expect(tocLinks()).toContain("Анатомия");
    expect(tocLinks()).not.toContain("Установка");
  });

  it("старая ссылка #/button/states прокручивает к секции спецификации", () => {
    open("/button/states");
    expect(selectedTab()).toContain("Хореография");
    const target = scrollIntoView.mock.contexts.at(-1) as HTMLElement;
    expect(target.id).toBe("s-states");
  });

  it("#/button/component открывает «Компонент»: импорт, примеры, пропсы", async () => {
    open("/button/component");
    expect(selectedTab()).toContain("Компонент");
    const install = await screen.findByRole("heading", { name: "Установка" });
    expect(install.closest("section")?.querySelector(".dx-codeblock__code")?.textContent).toBe(
      'import { Button, ButtonGroup, LinkButton } from "@/ui";',
    );
    expect(screen.getByRole("heading", { name: "Живые примеры" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Пропсы и использование" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Доступность" })).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "Копировать" }).length).toBeGreaterThan(1);
    expect(tocLinks()).toEqual([
      "Установка",
      "Живые примеры",
      "Пропсы и использование",
      "Доступность",
    ]);
  });

  it("якорь внутри вкладки «Компонент» работает после загрузки README", async () => {
    open("/button/component/props");
    await screen.findByRole("heading", { name: "Пропсы и использование" });
    const target = scrollIntoView.mock.contexts.at(-1) as HTMLElement;
    expect(target.id).toBe("s-props");
  });

  it("клик по вкладке меняет адрес и запоминает выбор", () => {
    open("/button");
    fireEvent.click(screen.getByRole("tab", { name: /Компонент/ }));
    expect(screen.getByTestId("where").textContent).toBe("/button/component");
    expect(readLastTab()).toBe("component");
    fireEvent.click(screen.getByRole("tab", { name: /Хореография/ }));
    expect(screen.getByTestId("where").textContent).toBe("/button");
    expect(readLastTab()).toBe("spec");
  });

  it("стрелки, Home и End переключают вкладки и переносят фокус", () => {
    open("/button");
    const tabs = screen.getAllByRole("tab");
    tabs[0].focus();
    fireEvent.keyDown(tabs[0], { key: "ArrowRight" });
    expect(screen.getByTestId("where").textContent).toBe("/button/component");
    expect(document.activeElement).toBe(screen.getByRole("tab", { name: /Компонент/ }));
    fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" });
    expect(screen.getByTestId("where").textContent).toBe("/button");
    fireEvent.keyDown(document.activeElement!, { key: "End" });
    expect(screen.getByTestId("where").textContent).toBe("/button/component");
    fireEvent.keyDown(document.activeElement!, { key: "Home" });
    expect(screen.getByTestId("where").textContent).toBe("/button");
    fireEvent.keyDown(document.activeElement!, { key: "ArrowLeft" });
    expect(screen.getByTestId("where").textContent).toBe("/button/component");
  });

  it("aria вкладок: выбранная в Tab-порядке, панель подписана вкладкой", () => {
    open("/button");
    const [spec, component] = screen.getAllByRole("tab");
    expect(spec.getAttribute("aria-selected")).toBe("true");
    expect(spec.tabIndex).toBe(0);
    expect(component.getAttribute("aria-selected")).toBe("false");
    expect(component.tabIndex).toBe(-1);
    const panel = screen.getByRole("tabpanel");
    expect(panel.getAttribute("aria-labelledby")).toBe(spec.id);
    expect(spec.getAttribute("aria-controls")).toBe(panel.id);
  });

  it("у основ без реализации вкладки «Компонент» нет", () => {
    open("/colors/component");
    expect(screen.queryByRole("tablist")).toBeNull();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(entryById("colors")!.title);
    expect(tocLinks()).toContain("Описание");
  });

  it("запись без реализации показывает заглушку и демо словаря", () => {
    const doc = { ...entryById("button")!.doc!, id: "no-such-entry", foundation: false };
    render(
      <MemoryRouter>
        <DocPage doc={doc} tab="component" />
      </MemoryRouter>,
    );
    expect(screen.getByText("Компонент ещё не реализован")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Демо словаря" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Установка" })).toBeNull();
  });
});

describe("сайдбар", () => {
  const renderSidebar = (path: string) =>
    render(
      <MemoryRouter initialEntries={[path]}>
        <Sidebar onNavigate={() => {}} />
      </MemoryRouter>,
    );

  it("подсвечивает активную запись на любой вкладке", () => {
    renderSidebar("/button/component");
    expect(screen.getByRole("link", { name: "Button" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "Badge" }).getAttribute("aria-current")).toBeNull();
  });

  it("ссылки ведут на запомненную вкладку, у основ — на спецификацию", () => {
    writeLastTab("component");
    renderSidebar("/");
    expect(screen.getByRole("link", { name: "Button" }).getAttribute("href")).toBe(
      "/button/component",
    );
    expect(screen.getByRole("link", { name: "Цвета" }).getAttribute("href")).toBe("/colors");
  });

  it("поиск находит записи как раньше", () => {
    renderSidebar("/");
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "кнопк" } });
    expect(screen.queryByRole("link", { name: "Badge" })).toBeNull();
  });
});
