/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { fireEvent, render, screen } from "@testing-library/react";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Checkbox, CheckboxGroup } from "./index";

const box = (name: string) =>
  screen.getByRole("checkbox", { name: new RegExp(name) }) as HTMLInputElement;

describe("Checkbox", () => {
  it("без подписи рисует голый input с классом ds-check", () => {
    render(<Checkbox aria-label="Сверять вес" />);
    const control = box("Сверять вес");
    expect(control.className).toBe("ds-check");
    expect(control.closest("label")).toBeNull();
  });

  it("с подписью оборачивает в label, имя берётся из подписи", () => {
    render(<Checkbox>Сверять вес</Checkbox>);
    const control = box("Сверять вес");
    expect(control.closest("label")?.className).toBe("ds-check__opt");
  });

  it("variant=card рисует карточку с заголовком b", () => {
    render(
      <Checkbox variant="card" hint="Сводка на почту">
        Письмо
      </Checkbox>,
    );
    const card = document.querySelector(".ds-check__card");
    expect(card?.querySelector("b")?.textContent).toBe("Письмо");
    expect(card?.querySelector("small")?.textContent).toBe("Сводка на почту");
  });

  it("неуправляемый режим: клик переключает checked", () => {
    render(<Checkbox>Сверять вес</Checkbox>);
    const control = box("Сверять вес");
    fireEvent.click(control);
    expect(control.checked).toBe(true);
    fireEvent.click(control);
    expect(control.checked).toBe(false);
  });

  it("defaultChecked задаёт начальное положение", () => {
    render(<Checkbox defaultChecked>Сверять вес</Checkbox>);
    expect(box("Сверять вес").checked).toBe(true);
  });

  it("управляемый режим: значение из checked, onCheckedChange получает новое", () => {
    const onCheckedChange = vi.fn();
    render(
      <Checkbox checked={false} onCheckedChange={onCheckedChange}>
        Сверять вес
      </Checkbox>,
    );
    fireEvent.click(box("Сверять вес"));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(box("Сверять вес").checked).toBe(false);
  });

  it("indeterminate выставляет свойство, а не атрибут, и снимается", () => {
    const { rerender } = render(<Checkbox indeterminate aria-label="Все" />);
    expect(box("Все").indeterminate).toBe(true);
    expect(box("Все").hasAttribute("indeterminate")).toBe(false);
    rerender(<Checkbox aria-label="Все" />);
    expect(box("Все").indeterminate).toBe(false);
  });

  it("invalid ставит aria-invalid и связывает пояснение через aria-describedby", () => {
    render(
      <Checkbox invalid hint="Нужно подтвердить">
        Я подтверждаю
      </Checkbox>,
    );
    const control = box("Я подтверждаю");
    expect(control.getAttribute("aria-invalid")).toBe("true");
    const hint = document.querySelector("small");
    expect(hint?.hasAttribute("data-error")).toBe(true);
    expect(control.getAttribute("aria-describedby")).toBe(hint?.id);
  });

  it("без invalid нет aria-invalid и пояснение не красное", () => {
    render(<Checkbox hint="Подсказка">Пункт</Checkbox>);
    expect(box("Пункт").hasAttribute("aria-invalid")).toBe(false);
    expect(document.querySelector("small")?.hasAttribute("data-error")).toBe(false);
  });

  it("свой aria-describedby сохраняется вместе с пояснением", () => {
    render(
      <Checkbox hint="Подсказка" aria-describedby="extra">
        Пункт
      </Checkbox>,
    );
    expect(box("Пункт").getAttribute("aria-describedby")?.split(" ")).toContain("extra");
  });

  it("disabled блокирует переключение", () => {
    const onCheckedChange = vi.fn();
    render(
      <Checkbox disabled onCheckedChange={onCheckedChange}>
        Сверять стоимость
      </Checkbox>,
    );
    fireEvent.click(box("Сверять стоимость"));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it("className добавляется на корень: input без подписи, label с подписью", () => {
    const { rerender } = render(<Checkbox aria-label="Один" className="custom" />);
    expect(box("Один").classList.contains("custom")).toBe(true);
    rerender(<Checkbox className="custom">Два</Checkbox>);
    expect(box("Два").closest("label")?.classList.contains("custom")).toBe(true);
  });

  it("name, value и ref пробрасываются на input", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Checkbox ref={ref} name="docs" value="invoice" aria-label="Инвойс" />);
    expect(ref.current).toBe(box("Инвойс"));
    expect(ref.current?.name).toBe("docs");
    expect(ref.current?.value).toBe("invoice");
  });

  it("сам по себе не ставит data-force", () => {
    render(<Checkbox aria-label="Один" />);
    expect(box("Один").hasAttribute("data-force")).toBe(false);
  });
});

function Docs({ selectAll }: { selectAll?: boolean }) {
  const [value, setValue] = useState<string[]>(["a"]);
  return (
    <>
      <CheckboxGroup label="Документы" value={value} onValueChange={setValue} selectAll={selectAll}>
        <Checkbox value="a">Накладная</Checkbox>
        <Checkbox value="b">Декларация</Checkbox>
        <Checkbox value="c" disabled>
          Инвойс
        </Checkbox>
      </CheckboxGroup>
      <output>{value.join(",")}</output>
    </>
  );
}

describe("CheckboxGroup", () => {
  it("рисует group с подписью и отмечает пункты по значению", () => {
    render(<Docs />);
    expect(screen.getByRole("group", { name: "Документы" })).toBeTruthy();
    expect(box("Накладная").checked).toBe(true);
    expect(box("Декларация").checked).toBe(false);
  });

  it("клик по пункту меняет значение группы", () => {
    render(<Docs />);
    fireEvent.click(box("Декларация"));
    expect(screen.getByRole("status").textContent).toBe("a,b");
    fireEvent.click(box("Накладная"));
    expect(screen.getByRole("status").textContent).toBe("b");
  });

  it("неуправляемый режим держит значение сам и сообщает об изменении", () => {
    const onValueChange = vi.fn();
    render(
      <CheckboxGroup label="Документы" defaultValue={["a"]} onValueChange={onValueChange}>
        <Checkbox value="a">Накладная</Checkbox>
        <Checkbox value="b">Декларация</Checkbox>
      </CheckboxGroup>,
    );
    fireEvent.click(box("Декларация"));
    expect(box("Декларация").checked).toBe(true);
    expect(onValueChange).toHaveBeenCalledWith(["a", "b"]);
  });

  it("selectAll показывает неполное состояние и счётчик", () => {
    render(<Docs selectAll />);
    const all = box("Выбрать все");
    expect(all.indeterminate).toBe(true);
    expect(screen.getByText("Выбрано 1 из 2")).toBeTruthy();
  });

  it("клик по родителю в неполном состоянии выбирает все доступные, повторный снимает", () => {
    render(<Docs selectAll />);
    fireEvent.click(box("Выбрать все"));
    expect(screen.getByRole("status").textContent).toBe("a,b");
    expect(box("Выбрать все").checked).toBe(true);
    expect(box("Выбрать все").indeterminate).toBe(false);
    fireEvent.click(box("Выбрать все"));
    expect(screen.getByRole("status").textContent).toBe("");
  });

  it("недоступный пункт не входит в «выбрать все»", () => {
    render(<Docs selectAll />);
    fireEvent.click(box("Выбрать все"));
    expect(box("Инвойс").checked).toBe(false);
  });
});
