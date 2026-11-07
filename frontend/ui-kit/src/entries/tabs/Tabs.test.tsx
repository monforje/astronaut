/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { fireEvent, render, screen } from "@testing-library/react";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Tab, TabList, TabPanel, Tabs } from "./index";

function Cargo({ onValueChange }: { onValueChange?: (v: string) => void }) {
  return (
    <Tabs defaultValue="all" onValueChange={onValueChange} data-testid="root">
      <TabList aria-label="Фильтр грузов">
        <Tab value="all" count={128}>
          Все
        </Tab>
        <Tab value="err" count={8}>
          С расхождениями
        </Tab>
        <Tab value="arch" disabled>
          Архив
        </Tab>
        <Tab value="draft" count={0}>
          Черновики
        </Tab>
      </TabList>
      <TabPanel value="all">Список</TabPanel>
      <TabPanel value="err">Расхождения</TabPanel>
      <TabPanel value="draft">Черновики</TabPanel>
    </Tabs>
  );
}

function Controlled() {
  const [value, setValue] = useState("err");
  return (
    <Tabs value={value} onValueChange={setValue}>
      <TabList aria-label="Вкладки">
        <Tab value="all">Все</Tab>
        <Tab value="err">Ошибки</Tab>
      </TabList>
      <TabPanel value="all">Список</TabPanel>
      <TabPanel value="err">Ошибки подробно</TabPanel>
    </Tabs>
  );
}

describe("Tabs", () => {
  it("рендерит tablist с подписью и вкладки с ролями", () => {
    render(<Cargo />);
    expect(screen.getByRole("tablist", { name: "Фильтр грузов" })).toBeTruthy();
    expect(screen.getAllByRole("tab")).toHaveLength(4);
    expect(screen.getByTestId("root").className).toBe("ds-tabs");
  });

  it("выбрана вкладка из defaultValue, у неё tabindex 0, у остальных -1", () => {
    render(<Cargo />);
    const [all, err] = screen.getAllByRole("tab");
    expect(all.getAttribute("aria-selected")).toBe("true");
    expect(all.tabIndex).toBe(0);
    expect(err.getAttribute("aria-selected")).toBe("false");
    expect(err.tabIndex).toBe(-1);
  });

  it("без значения выбирается первая доступная вкладка", () => {
    render(
      <Tabs>
        <TabList aria-label="Вкладки">
          <Tab value="a" disabled>
            А
          </Tab>
          <Tab value="b">Б</Tab>
        </TabList>
      </Tabs>,
    );
    expect(screen.getByRole("tab", { name: "Б" }).getAttribute("aria-selected")).toBe("true");
  });

  it("клик выбирает вкладку и показывает панель", () => {
    const onValueChange = vi.fn();
    render(<Cargo onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole("tab", { name: /С расхождениями/ }));
    expect(onValueChange).toHaveBeenCalledWith("err");
    expect(screen.getByRole("tabpanel").textContent).toBe("Расхождения");
  });

  it("повторный клик по выбранной вкладке не вызывает onValueChange", () => {
    const onValueChange = vi.fn();
    render(<Cargo onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole("tab", { name: /Все/ }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("disabled-вкладка не выбирается кликом", () => {
    render(<Cargo />);
    const arch = screen.getByRole("tab", { name: "Архив" });
    expect((arch as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(arch);
    expect(arch.getAttribute("aria-selected")).toBe("false");
  });

  it("стрелка вправо переносит фокус и выбор, пропуская disabled, и идёт по кругу", () => {
    render(<Cargo />);
    const tabs = screen.getAllByRole("tab");
    tabs[0].focus();
    fireEvent.keyDown(tabs[0], { key: "ArrowRight" });
    expect(document.activeElement).toBe(tabs[1]);
    expect(tabs[1].getAttribute("aria-selected")).toBe("true");
    fireEvent.keyDown(tabs[1], { key: "ArrowRight" });
    expect(document.activeElement).toBe(tabs[3]);
    fireEvent.keyDown(tabs[3], { key: "ArrowRight" });
    expect(document.activeElement).toBe(tabs[0]);
  });

  it("стрелка влево с первой вкладки уходит на последнюю доступную", () => {
    render(<Cargo />);
    const tabs = screen.getAllByRole("tab");
    tabs[0].focus();
    fireEvent.keyDown(tabs[0], { key: "ArrowLeft" });
    expect(document.activeElement).toBe(tabs[3]);
  });

  it("Home и End выбирают первую и последнюю доступные", () => {
    render(<Cargo />);
    const tabs = screen.getAllByRole("tab");
    tabs[0].focus();
    fireEvent.keyDown(tabs[0], { key: "End" });
    expect(tabs[3].getAttribute("aria-selected")).toBe("true");
    fireEvent.keyDown(tabs[3], { key: "Home" });
    expect(tabs[0].getAttribute("aria-selected")).toBe("true");
  });

  it("вкладка связана с панелью через aria-controls и aria-labelledby", () => {
    render(<Cargo />);
    const tab = screen.getByRole("tab", { name: /Все/ });
    const panel = screen.getByRole("tabpanel");
    expect(tab.getAttribute("aria-controls")).toBe(panel.id);
    expect(panel.getAttribute("aria-labelledby")).toBe(tab.id);
    expect(panel.tabIndex).toBe(0);
  });

  it("aria-controls вкладки можно заменить своим значением", () => {
    render(
      <Tabs defaultValue="a">
        <TabList aria-label="Вкладки">
          <Tab value="a" aria-controls="grid">
            Все
          </Tab>
        </TabList>
      </Tabs>,
    );
    expect(screen.getByRole("tab").getAttribute("aria-controls")).toBe("grid");
  });

  it("без defaultValue выбирается первая доступная вкладка и onValueChange молчит", () => {
    const onValueChange = vi.fn();
    render(
      <Tabs onValueChange={onValueChange}>
        <TabList aria-label="Вкладки">
          <Tab value="a" disabled>
            Первая
          </Tab>
          <Tab value="b">Вторая</Tab>
        </TabList>
      </Tabs>,
    );
    expect(screen.getByRole("tab", { name: "Вторая" }).getAttribute("aria-selected")).toBe("true");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("невыбранные панели скрыты и пусты", () => {
    const { container } = render(<Cargo />);
    const hidden = container.querySelectorAll(".ds-tabs__panel[hidden]");
    expect(hidden).toHaveLength(2);
    expect(hidden[0].textContent).toBe("");
  });

  it("управляемый режим: значение приходит из value", () => {
    render(<Controlled />);
    expect(screen.getByRole("tabpanel").textContent).toBe("Ошибки подробно");
    fireEvent.click(screen.getByRole("tab", { name: "Все" }));
    expect(screen.getByRole("tabpanel").textContent).toBe("Список");
  });

  it("управляемый режим без обработчика не меняет значение", () => {
    render(
      <Tabs value="all">
        <TabList aria-label="Вкладки">
          <Tab value="all">Все</Tab>
          <Tab value="err">Ошибки</Tab>
        </TabList>
      </Tabs>,
    );
    fireEvent.click(screen.getByRole("tab", { name: "Ошибки" }));
    expect(screen.getByRole("tab", { name: "Все" }).getAttribute("aria-selected")).toBe("true");
  });

  it("счётчик: число, ноль приглушён, загрузка с подписью", () => {
    const { container } = render(
      <Tabs defaultValue="a">
        <TabList aria-label="Вкладки">
          <Tab value="a" count={8}>
            А
          </Tab>
          <Tab value="b" count={0}>
            Б
          </Tab>
          <Tab value="c" count="loading">
            В
          </Tab>
        </TabList>
      </Tabs>,
    );
    const counts = container.querySelectorAll(".ds-tabs__cn");
    expect(counts[0].textContent).toBe("8");
    expect(counts[1].getAttribute("data-zero")).toBe("true");
    expect(counts[2].classList.contains("ds-tabs__cn--load")).toBe(true);
    expect(screen.getByLabelText("загрузка")).toBeTruthy();
  });

  it("error ставит метку с подписью и data-error", () => {
    render(
      <Tabs defaultValue="a">
        <TabList aria-label="Вкладки">
          <Tab value="a" error>
            А
          </Tab>
        </TabList>
      </Tabs>,
    );
    expect(screen.getByLabelText("есть ошибка")).toBeTruthy();
    expect(screen.getByRole("tab").getAttribute("data-error")).toBe("true");
  });

  it("размер sm и scroll выражены классом и атрибутом", () => {
    render(
      <Tabs size="sm" className="custom" data-testid="root">
        <TabList aria-label="Вкладки" scroll>
          <Tab value="a">А</Tab>
        </TabList>
      </Tabs>,
    );
    const root = screen.getByTestId("root");
    expect(root.classList.contains("ds-tabs--sm")).toBe(true);
    expect(root.classList.contains("custom")).toBe(true);
    expect(screen.getByRole("tablist").getAttribute("data-scroll")).toBe("true");
  });

  it("ref и нативные атрибуты пробрасываются, data-force по умолчанию нет", () => {
    const ref = createRef<HTMLButtonElement>();
    const listRef = createRef<HTMLDivElement>();
    render(
      <Tabs defaultValue="a">
        <TabList aria-label="Вкладки" ref={listRef}>
          <Tab value="a" ref={ref} title="Первая" data-x="1">
            А
          </Tab>
        </TabList>
      </Tabs>,
    );
    const tab = screen.getByRole("tab");
    expect(ref.current).toBe(tab);
    expect(listRef.current).toBe(screen.getByRole("tablist"));
    expect(tab.getAttribute("title")).toBe("Первая");
    expect(tab.getAttribute("data-x")).toBe("1");
    expect(tab.hasAttribute("data-force")).toBe(false);
  });

  it("Tab вне Tabs выдаёт понятную ошибку", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Tab value="a">А</Tab>)).toThrow("Tab нужно размещать внутри Tabs");
    spy.mockRestore();
  });
});
