/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { SectionHeader, Separator } from "./index";

describe("Separator", () => {
  it("по умолчанию горизонтальная линия hr с классом ds-sep", () => {
    render(<Separator data-testid="s" />);
    const sep = screen.getByTestId("s");
    expect(sep.tagName).toBe("HR");
    expect(sep.className).toBe("ds-sep");
    expect(sep.getAttribute("aria-orientation")).toBeNull();
  });

  it("strong добавляет класс усиленной линии", () => {
    render(<Separator strong data-testid="s" />);
    expect(screen.getByTestId("s").classList.contains("ds-sep--strong")).toBe(true);
  });

  it("вертикальная линия с aria-orientation", () => {
    render(<Separator orientation="vertical" data-testid="s" />);
    const sep = screen.getByTestId("s");
    expect(sep.className).toBe("ds-sep-v");
    expect(sep.getAttribute("aria-orientation")).toBe("vertical");
  });

  it("decorative даёт role none и убирает aria-orientation", () => {
    render(<Separator orientation="vertical" decorative data-testid="s" />);
    const sep = screen.getByTestId("s");
    expect(sep.getAttribute("role")).toBe("none");
    expect(sep.getAttribute("aria-orientation")).toBeNull();
  });

  it("с подписью рисуется div role=separator", () => {
    render(<Separator>или</Separator>);
    const sep = screen.getByRole("separator");
    expect(sep.tagName).toBe("DIV");
    expect(sep.className).toBe("ds-sep-l");
    expect(sep.textContent).toBe("или");
  });

  it("className, ref и атрибуты пробрасываются", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Separator ref={ref} className="custom" data-testid="s" aria-label="Граница" />);
    const sep = screen.getByTestId("s");
    expect(ref.current).toBe(sep);
    expect(sep.classList.contains("custom")).toBe(true);
    expect(sep.getAttribute("aria-label")).toBe("Граница");
  });
});

describe("SectionHeader", () => {
  it("рендерит заголовок и содержимое, по умолчанию раскрыт", () => {
    render(<SectionHeader title="Документы груза">Тело</SectionHeader>);
    expect(screen.getByRole("heading", { name: "Документы груза", level: 3 })).toBeTruthy();
    const button = screen.getByRole("button", { name: "Свернуть: Документы груза" });
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("Тело")).toBeTruthy();
  });

  it("клик сворачивает и разворачивает, меняя aria-label и вызывая onOpenChange", () => {
    const onOpenChange = vi.fn();
    const { container } = render(
      <SectionHeader title="Раздел" onOpenChange={onOpenChange}>
        Тело
      </SectionHeader>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Свернуть: Раздел" }));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(container.querySelector(".ds-sep-sec")?.hasAttribute("data-open")).toBe(false);
    const button = screen.getByRole("button", { name: "Развернуть: Раздел" });
    expect(button.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(button);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
  });

  it("свёрнутая панель inert, кнопка связана с ней через aria-controls", () => {
    const { container } = render(
      <SectionHeader title="Раздел" defaultOpen={false}>
        Тело
      </SectionHeader>,
    );
    const panel = container.querySelector(".ds-sep-sec__p") as HTMLElement;
    expect(panel.hasAttribute("inert")).toBe(true);
    expect(screen.getByRole("button").getAttribute("aria-controls")).toBe(panel.id);
  });

  it("управляемый режим: open задаёт состояние", () => {
    render(
      <SectionHeader title="Раздел" open={false}>
        Тело
      </SectionHeader>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("button").getAttribute("aria-expanded")).toBe("false");
  });

  it("сводка видна у свёрнутого раздела, summaryAlways оставляет её у раскрытого", () => {
    const { container, rerender } = render(
      <SectionHeader title="Раздел" summary="3 документа">
        Тело
      </SectionHeader>,
    );
    expect(container.querySelector(".ds-sep-sec__s")?.textContent).toBe("3 документа");
    expect(container.querySelector(".ds-sep-sec")?.hasAttribute("data-summary")).toBe(false);
    rerender(
      <SectionHeader title="Раздел" summary="3 документа" summaryAlways>
        Тело
      </SectionHeader>,
    );
    expect(container.querySelector(".ds-sep-sec")?.hasAttribute("data-summary")).toBe(true);
  });

  it("без summary сводки нет", () => {
    const { container } = render(<SectionHeader title="Раздел">Тело</SectionHeader>);
    expect(container.querySelector(".ds-sep-sec__s")).toBeNull();
  });

  it("collapsible=false не рисует кнопку и держит раздел раскрытым", () => {
    render(
      <SectionHeader title="Раздел" collapsible={false}>
        Тело
      </SectionHeader>,
    );
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByText("Тело")).toBeTruthy();
  });

  it("disabled блокирует кнопку, animated и headingLevel влияют на разметку", () => {
    const { container } = render(
      <SectionHeader title="Раздел" disabled animated headingLevel={2} className="custom">
        Тело
      </SectionHeader>,
    );
    expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByRole("heading", { level: 2 })).toBeTruthy();
    const section = container.querySelector(".ds-sep-sec");
    expect(section?.hasAttribute("data-animate")).toBe(true);
    expect(section?.classList.contains("custom")).toBe(true);
    expect(section?.hasAttribute("data-force")).toBe(false);
  });
});
