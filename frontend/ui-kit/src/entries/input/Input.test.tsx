/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { InlineInput, Input, SearchInput, Textarea } from "./index";

describe("Input", () => {
  it("рисует поле с видимой подписью и именем из неё", () => {
    render(<Input label="Номер контейнера" />);
    const control = screen.getByRole("textbox", { name: "Номер контейнера" });
    expect(control.className).toBe("ds-input__control");
    expect(control.closest(".ds-input")).toBeTruthy();
    expect(screen.getByText("Номер контейнера").className).toBe("ds-input__label");
  });

  it("без подписи имя берётся из placeholder, свой aria-label главнее", () => {
    const { rerender } = render(<Input placeholder="Найти груз" />);
    expect(screen.getByRole("textbox", { name: "Найти груз" })).toBeTruthy();
    rerender(<Input placeholder="Найти груз" aria-label="Поиск" />);
    expect(screen.getByRole("textbox", { name: "Поиск" })).toBeTruthy();
  });

  it("неуправляемый режим: defaultValue и ввод", () => {
    render(<Input aria-label="Поле" defaultValue="MSKU" />);
    const control = screen.getByRole("textbox") as HTMLInputElement;
    expect(control.value).toBe("MSKU");
    fireEvent.change(control, { target: { value: "MSKU48" } });
    expect(control.value).toBe("MSKU48");
  });

  it("управляемый режим: значение из value, onValueChange и onChange получают ввод", () => {
    const onValueChange = vi.fn();
    const onChange = vi.fn();
    render(
      <Input aria-label="Поле" value="abc" onValueChange={onValueChange} onChange={onChange} />,
    );
    const control = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.change(control, { target: { value: "abcd" } });
    expect(onValueChange).toHaveBeenCalledWith("abcd");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(control.value).toBe("abc");
  });

  it("подсказка связана через aria-describedby", () => {
    render(<Input label="Контейнер" hint="4 буквы и 7 цифр" />);
    const control = screen.getByRole("textbox");
    const hint = screen.getByText("4 буквы и 7 цифр");
    expect(hint.className).toBe("ds-input__hint");
    expect(control.getAttribute("aria-describedby")).toBe(hint.id);
    expect(control.hasAttribute("aria-invalid")).toBe(false);
  });

  it("ошибка заменяет подсказку, ставит aria-invalid и data-invalid", () => {
    render(<Input label="Контейнер" hint="Подсказка" error="Нужно 11 символов" />);
    const control = screen.getByRole("textbox");
    const error = screen.getByText("Нужно 11 символов");
    expect(screen.queryByText("Подсказка")).toBeNull();
    expect(control.getAttribute("aria-invalid")).toBe("true");
    expect(control.getAttribute("aria-describedby")).toBe(error.id);
    expect(control.closest(".ds-input")?.hasAttribute("data-invalid")).toBe(true);
  });

  it("invalid без текста ошибки тоже помечает поле", () => {
    render(<Input aria-label="Поле" invalid />);
    expect(screen.getByRole("textbox").getAttribute("aria-invalid")).toBe("true");
  });

  it("disabled отключает поле и помечает рамку", () => {
    render(<Input aria-label="Поле" disabled defaultValue="x" clearable />);
    const control = screen.getByRole("textbox") as HTMLInputElement;
    expect(control.disabled).toBe(true);
    expect(control.closest(".ds-input")?.hasAttribute("data-disabled")).toBe(true);
    expect(screen.queryByRole("button", { name: "Очистить" })).toBeNull();
  });

  it("clearable: кнопка «Очистить» есть только при значении, очищает и возвращает фокус", () => {
    const onClear = vi.fn();
    const onValueChange = vi.fn();
    render(
      <Input
        aria-label="Клиент"
        clearable
        defaultValue="Дальснаб"
        onClear={onClear}
        onValueChange={onValueChange}
      />,
    );
    const control = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.click(screen.getByRole("button", { name: "Очистить" }));
    expect(control.value).toBe("");
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith("");
    expect(document.activeElement).toBe(control);
    expect(screen.queryByRole("button", { name: "Очистить" })).toBeNull();
  });

  it("clearable: Esc очищает непустое поле", () => {
    render(<Input aria-label="Клиент" clearable defaultValue="Дальснаб" />);
    const control = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.keyDown(control, { key: "Escape" });
    expect(control.value).toBe("");
  });

  it("без clearable Esc ничего не очищает", () => {
    render(<Input aria-label="Клиент" defaultValue="Дальснаб" />);
    const control = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.keyDown(control, { key: "Escape" });
    expect(control.value).toBe("Дальснаб");
  });

  it("значок, единица и подсказка клавиш рисуются, значок скрыт от скринридера", () => {
    render(
      <Input
        aria-label="Вес"
        lead={<svg data-testid="lead" />}
        unit="кг"
        kbd="/"
        numeric
        compact
      />,
    );
    expect(screen.getByTestId("lead").parentElement?.getAttribute("aria-hidden")).toBe("true");
    expect(screen.getByText("кг").className).toBe("ds-input__unit");
    expect(screen.getByText("/").className).toBe("ds-input__kbd");
    const control = screen.getByRole("textbox");
    expect(control.classList.contains("ds-input__control--num")).toBe(true);
    expect(control.closest(".ds-input")?.classList.contains("ds-input--compact")).toBe(true);
  });

  it("type, name, ref и className попадают на input, fieldClassName на обёртку", () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <Input
        ref={ref}
        aria-label="Почта"
        type="email"
        name="mail"
        className="custom"
        fieldClassName="wrap"
      />,
    );
    const control = screen.getByRole("textbox") as HTMLInputElement;
    expect(ref.current).toBe(control);
    expect(control.type).toBe("email");
    expect(control.name).toBe("mail");
    expect(control.classList.contains("custom")).toBe(true);
    expect(control.closest(".ds-input__field")?.classList.contains("wrap")).toBe(true);
  });

  it("сам по себе не ставит data-force", () => {
    render(<Input aria-label="Поле" />);
    expect(document.querySelector("[data-force]")).toBeNull();
  });
});

describe("Textarea", () => {
  it("рисует textarea в рамке с вариантом area и 3 строками", () => {
    render(<Textarea label="Комментарий" />);
    const control = screen.getByRole("textbox", { name: "Комментарий" }) as HTMLTextAreaElement;
    expect(control.getAttribute("rows")).toBe("3");
    expect(control.closest(".ds-input")?.classList.contains("ds-input--area")).toBe(true);
  });

  it("неуправляемый и управляемый режимы", () => {
    const onValueChange = vi.fn();
    render(<Textarea aria-label="Текст" defaultValue="a" onValueChange={onValueChange} />);
    const control = screen.getByRole("textbox") as HTMLTextAreaElement;
    fireEvent.change(control, { target: { value: "ab" } });
    expect(control.value).toBe("ab");
    expect(onValueChange).toHaveBeenCalledWith("ab");
  });

  it("ошибка связывается с полем", () => {
    render(<Textarea label="Комментарий" error="Слишком коротко" />);
    const control = screen.getByRole("textbox");
    expect(control.getAttribute("aria-invalid")).toBe("true");
    expect(control.getAttribute("aria-describedby")).toBe(screen.getByText("Слишком коротко").id);
  });
});

describe("InlineInput", () => {
  it("рисует встроенное поле, ширина задаётся пропсом", () => {
    render(<InlineInput aria-label="Название" defaultValue="Дальснаб" width={90} />);
    const control = screen.getByRole("textbox", { name: "Название" }) as HTMLInputElement;
    expect(control.value).toBe("Дальснаб");
    expect(control.style.width).toBe("90px");
    expect(control.closest("label")?.className).toBe("ds-input-inline");
  });

  it("invalid ставит aria-invalid и data-invalid", () => {
    render(<InlineInput aria-label="Название" invalid />);
    const control = screen.getByRole("textbox");
    expect(control.getAttribute("aria-invalid")).toBe("true");
    expect(control.closest("label")?.hasAttribute("data-invalid")).toBe(true);
  });

  it("ввод меняет значение и сообщает наружу", () => {
    const onValueChange = vi.fn();
    render(<InlineInput aria-label="Название" onValueChange={onValueChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "x" } });
    expect(onValueChange).toHaveBeenCalledWith("x");
  });
});

describe("SearchInput", () => {
  it("рисует searchbox, имя из placeholder, по умолчанию «Поиск»", () => {
    const { rerender } = render(<SearchInput />);
    expect(screen.getByRole("searchbox", { name: "Поиск" })).toBeTruthy();
    rerender(<SearchInput placeholder="Найти груз" />);
    expect(screen.getByRole("searchbox", { name: "Найти груз" })).toBeTruthy();
  });

  it("Esc очищает непустое значение", () => {
    const onValueChange = vi.fn();
    render(<SearchInput defaultValue="MSKU" onValueChange={onValueChange} />);
    const control = screen.getByRole("searchbox") as HTMLInputElement;
    fireEvent.keyDown(control, { key: "Escape" });
    expect(control.value).toBe("");
    expect(onValueChange).toHaveBeenCalledWith("");
  });

  it("значок лупы скрыт от скринридера", () => {
    render(<SearchInput />);
    expect(document.querySelector(".ds-input-search svg")?.getAttribute("aria-hidden")).toBe(
      "true",
    );
  });
});
