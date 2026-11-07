/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { fireEvent, render, screen } from "@testing-library/react";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Accordion, AccordionItem, type AccordionProps } from "./index";

function Help(props: AccordionProps) {
  return (
    <Accordion {...props}>
      <AccordionItem value="how" title="Как работает сверка" hint="3 шага" icon={<svg />}>
        Тело первой
      </AccordionItem>
      <AccordionItem value="fix" title="Что делать при расхождении">
        Тело второй
      </AccordionItem>
      <AccordionItem value="acl" title="Права доступа" disabled>
        Закрыто
      </AccordionItem>
      <AccordionItem value="int" title="Интеграции">
        Тело четвёртой
      </AccordionItem>
    </Accordion>
  );
}

function Controlled() {
  const [value, setValue] = useState<string[]>([]);
  return <Help value={value} onValueChange={setValue} />;
}

const trigger = (name: RegExp | string) => screen.getByRole("button", { name });

describe("Accordion", () => {
  it("рендерит заголовки-кнопки внутри h4, все секции закрыты", () => {
    render(<Help />);
    expect(screen.getAllByRole("heading", { level: 4 })).toHaveLength(4);
    for (const button of screen.getAllByRole("button")) {
      expect(button.getAttribute("aria-expanded")).toBe("false");
    }
  });

  it("уровень заголовка меняется через headingLevel", () => {
    render(<Help headingLevel={3} />);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(4);
  });

  it("клик раскрывает секцию, aria-expanded и data-open обновляются", () => {
    const { container } = render(<Help />);
    fireEvent.click(trigger(/Как работает/));
    expect(trigger(/Как работает/).getAttribute("aria-expanded")).toBe("true");
    expect(container.querySelector(".ds-acc__i")?.hasAttribute("data-open")).toBe(true);
  });

  it("заголовок связан с панелью: aria-controls и region с aria-labelledby", () => {
    render(<Help defaultValue={["how"]} />);
    const button = trigger(/Как работает/);
    const region = screen.getByRole("region", { name: /Как работает/ });
    expect(button.getAttribute("aria-controls")).toBe(region.id);
    expect(region.getAttribute("aria-labelledby")).toBe(button.id);
  });

  it("закрытая панель inert, открытая нет", () => {
    const { container } = render(<Help defaultValue={["how"]} />);
    const panels = container.querySelectorAll(".ds-acc__p");
    expect(panels[0].hasAttribute("inert")).toBe(false);
    expect(panels[1].hasAttribute("inert")).toBe(true);
  });

  it("single: открытие второй закрывает первую, повторный клик сворачивает", () => {
    render(<Help />);
    fireEvent.click(trigger(/Как работает/));
    fireEvent.click(trigger(/Что делать/));
    expect(trigger(/Как работает/).getAttribute("aria-expanded")).toBe("false");
    expect(trigger(/Что делать/).getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(trigger(/Что делать/));
    expect(trigger(/Что делать/).getAttribute("aria-expanded")).toBe("false");
  });

  it("multiple: можно держать несколько открытыми", () => {
    render(<Help type="multiple" />);
    fireEvent.click(trigger(/Как работает/));
    fireEvent.click(trigger(/Что делать/));
    expect(trigger(/Как работает/).getAttribute("aria-expanded")).toBe("true");
    expect(trigger(/Что делать/).getAttribute("aria-expanded")).toBe("true");
  });

  it("onValueChange получает новый список открытых", () => {
    const onValueChange = vi.fn();
    render(<Help type="multiple" onValueChange={onValueChange} />);
    fireEvent.click(trigger(/Как работает/));
    fireEvent.click(trigger(/Интеграции/));
    expect(onValueChange).toHaveBeenLastCalledWith(["how", "int"]);
  });

  it("управляемый режим: value определяет раскрытые, без обработчика не меняется", () => {
    render(<Help value={["fix"]} />);
    expect(trigger(/Что делать/).getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(trigger(/Как работает/));
    expect(trigger(/Как работает/).getAttribute("aria-expanded")).toBe("false");
    expect(trigger(/Что делать/).getAttribute("aria-expanded")).toBe("true");
  });

  it("управляемый режим с состоянием родителя", () => {
    render(<Controlled />);
    fireEvent.click(trigger(/Интеграции/));
    expect(trigger(/Интеграции/).getAttribute("aria-expanded")).toBe("true");
  });

  it("disabled-секция не раскрывается", () => {
    render(<Help />);
    const button = trigger(/Права доступа/) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    fireEvent.click(button);
    expect(button.getAttribute("aria-expanded")).toBe("false");
  });

  it("стрелки двигают фокус по заголовкам по кругу, disabled пропускается", () => {
    render(<Help />);
    const first = trigger(/Как работает/);
    first.focus();
    fireEvent.keyDown(first, { key: "ArrowDown" });
    expect(document.activeElement).toBe(trigger(/Что делать/));
    fireEvent.keyDown(document.activeElement as Element, { key: "ArrowDown" });
    expect(document.activeElement).toBe(trigger(/Интеграции/));
    fireEvent.keyDown(document.activeElement as Element, { key: "ArrowDown" });
    expect(document.activeElement).toBe(first);
    fireEvent.keyDown(first, { key: "ArrowUp" });
    expect(document.activeElement).toBe(trigger(/Интеграции/));
  });

  it("Home и End переходят на первый и последний доступный заголовок", () => {
    render(<Help />);
    const first = trigger(/Как работает/);
    first.focus();
    fireEvent.keyDown(first, { key: "End" });
    expect(document.activeElement).toBe(trigger(/Интеграции/));
    fireEvent.keyDown(document.activeElement as Element, { key: "Home" });
    expect(document.activeElement).toBe(first);
  });

  it("при раскрытии фокус остаётся на заголовке", () => {
    render(<Help />);
    const button = trigger(/Как работает/);
    button.focus();
    fireEvent.click(button);
    expect(document.activeElement).toBe(button);
  });

  it("вариант cards добавляет класс", () => {
    render(<Help variant="cards" data-testid="root" className="custom" />);
    const root = screen.getByTestId("root");
    expect(root.classList.contains("ds-acc--cards")).toBe(true);
    expect(root.classList.contains("custom")).toBe(true);
  });

  it("подсказка рисуется, значок скрыт от скринридера", () => {
    const { container } = render(<Help />);
    expect(container.querySelector(".ds-acc__ad")?.textContent).toBe("3 шага");
    expect(container.querySelector(".ds-acc__ico")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("статусы панели заменяют содержимое", () => {
    const { container } = render(
      <Accordion defaultValue={["a", "b", "c"]} type="multiple">
        <AccordionItem value="a" title="А" status="loading">
          тело
        </AccordionItem>
        <AccordionItem value="b" title="Б" status="error">
          тело
        </AccordionItem>
        <AccordionItem value="c" title="В" status="empty">
          тело
        </AccordionItem>
      </Accordion>,
    );
    expect(container.querySelector(".ds-acc__sk-wrap")?.getAttribute("aria-busy")).toBe("true");
    expect(screen.getByText(/Не удалось загрузить/)).toBeTruthy();
    expect(screen.getByText("Здесь пока ничего нет.")).toBeTruthy();
    expect(screen.queryByText("тело")).toBeNull();
  });

  it("ref, className и атрибуты пробрасываются, data-force по умолчанию нет", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <Accordion ref={ref} aria-label="Справка">
        <AccordionItem value="a" title="А" data-x="1" className="item">
          тело
        </AccordionItem>
      </Accordion>,
    );
    expect(ref.current?.getAttribute("aria-label")).toBe("Справка");
    const item = container.querySelector(".ds-acc__i");
    expect(item?.getAttribute("data-x")).toBe("1");
    expect(item?.classList.contains("item")).toBe(true);
    expect(container.querySelector("[data-force]")).toBeNull();
  });
});
