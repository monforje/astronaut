/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Radio, RadioGroup } from "./index";

const radio = (name: string) =>
  screen.getByRole("radio", { name: new RegExp(name) }) as HTMLInputElement;

function Transport(props: Partial<React.ComponentProps<typeof RadioGroup>> = {}) {
  return (
    <RadioGroup label="Тип перевозки" {...props}>
      <Radio value="sea" hint="Контейнеры из Китая">
        Морской импорт
      </Radio>
      <Radio value="rail">Железная дорога</Radio>
      <Radio value="air" disabled>
        Авиа
      </Radio>
    </RadioGroup>
  );
}

describe("Radio", () => {
  it("без подписи рисует голый input type=radio с классом ds-radio", () => {
    render(<Radio aria-label="Обычный" />);
    const control = radio("Обычный");
    expect(control.className).toBe("ds-radio");
    expect(control.closest("label")).toBeNull();
  });

  it("с подписью и пояснением оборачивает в label", () => {
    render(<Radio hint="Пояснение">Подпись</Radio>);
    const control = radio("Подпись");
    expect(control.closest("label")?.className).toBe("ds-radio__opt");
    expect(document.querySelector("small")?.textContent).toBe("Пояснение");
  });

  it("одиночный: defaultChecked и checked пробрасываются", () => {
    const { unmount } = render(<Radio aria-label="Один" defaultChecked />);
    expect(radio("Один").checked).toBe(true);
    unmount();
    render(<Radio aria-label="Два" checked={false} />);
    expect(radio("Два").checked).toBe(false);
  });

  it("invalid ставит data-invalid", () => {
    render(<Radio aria-label="Ошибка" invalid />);
    expect(radio("Ошибка").hasAttribute("data-invalid")).toBe(true);
  });

  it("disabled блокирует выбор", () => {
    const onChange = vi.fn();
    render(<Radio aria-label="Недоступный" disabled onChange={onChange} />);
    fireEvent.click(radio("Недоступный"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("className, name и ref пробрасываются", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Radio ref={ref} aria-label="Один" name="n" value="1" className="custom" />);
    expect(ref.current).toBe(radio("Один"));
    expect(ref.current?.name).toBe("n");
    expect(ref.current?.classList.contains("custom")).toBe(true);
  });

  it("сам по себе не ставит data-force", () => {
    render(<Radio aria-label="Один" />);
    expect(radio("Один").hasAttribute("data-force")).toBe(false);
  });
});

describe("RadioGroup", () => {
  it("рисует radiogroup с подписью и общим name у пунктов", () => {
    render(<Transport />);
    const group = screen.getByRole("radiogroup", { name: "Тип перевозки" });
    expect(group.className).toBe("ds-radio__group");
    const names = new Set(screen.getAllByRole("radio").map((r) => (r as HTMLInputElement).name));
    expect(names.size).toBe(1);
    expect([...names][0]).not.toBe("");
  });

  it("variant задаёт раскладку: row и cards", () => {
    const { rerender } = render(<Transport variant="row" />);
    expect(screen.getByRole("radiogroup").classList.contains("ds-radio__group--row")).toBe(true);
    rerender(<Transport variant="cards" />);
    expect(screen.getByRole("radiogroup").classList.contains("ds-radio__cards")).toBe(true);
    expect(document.querySelectorAll(".ds-radio__card")).toHaveLength(3);
  });

  it("неуправляемый режим: defaultValue и выбор кликом", () => {
    render(<Transport defaultValue="sea" />);
    expect(radio("Морской").checked).toBe(true);
    fireEvent.click(radio("Железная"));
    expect(radio("Железная").checked).toBe(true);
    expect(radio("Морской").checked).toBe(false);
  });

  it("управляемый режим: значение из value, onValueChange получает новое", () => {
    const onValueChange = vi.fn();
    render(<Transport value="sea" onValueChange={onValueChange} />);
    fireEvent.click(radio("Железная"));
    expect(onValueChange).toHaveBeenCalledWith("rail");
    expect(radio("Морской").checked).toBe(true);
  });

  it("недоступный пункт нельзя выбрать", () => {
    const onValueChange = vi.fn();
    render(<Transport onValueChange={onValueChange} />);
    expect(radio("Авиа").disabled).toBe(true);
    fireEvent.click(radio("Авиа"));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("invalid и error: aria-invalid на группе, связь с текстом ошибки, data-invalid у кружков", () => {
    render(<Transport invalid error="Выберите тип перевозки" />);
    const group = screen.getByRole("radiogroup");
    expect(group.getAttribute("aria-invalid")).toBe("true");
    const error = screen.getByText("Выберите тип перевозки");
    expect(group.getAttribute("aria-describedby")).toBe(error.id);
    expect(radio("Морской").hasAttribute("data-invalid")).toBe(true);
  });

  it("без ошибки нет aria-invalid и aria-describedby", () => {
    render(<Transport />);
    const group = screen.getByRole("radiogroup");
    expect(group.hasAttribute("aria-invalid")).toBe(false);
    expect(group.hasAttribute("aria-describedby")).toBe(false);
  });

  it("свой name и ref пробрасываются", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Transport ref={ref} name="transport" className="custom" />);
    expect(radio("Морской").name).toBe("transport");
    expect(ref.current).toBe(screen.getByRole("radiogroup"));
    expect(ref.current?.classList.contains("custom")).toBe(true);
  });
});
