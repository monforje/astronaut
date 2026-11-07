/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Button, ButtonGroup } from "./index";

describe("Button", () => {
  it("рисует подпись и по умолчанию primary md с type=button", () => {
    render(<Button>Сохранить</Button>);
    const button = screen.getByRole("button", { name: "Сохранить" });
    expect(button.className).toBe("ds-btn ds-btn--primary ds-btn--md");
    expect(button.getAttribute("type")).toBe("button");
    expect(button.querySelector(".ds-btn__label")?.textContent).toBe("Сохранить");
  });

  it("вид, размер, квадратная и широкая формы выражены классами", () => {
    render(
      <Button variant="outline" size="lg" square block>
        Ещё
      </Button>,
    );
    const button = screen.getByRole("button");
    for (const name of ["ds-btn--outline", "ds-btn--lg", "ds-btn--sq", "ds-btn--block"]) {
      expect(button.classList.contains(name), name).toBe(true);
    }
    expect(button.classList.contains("ds-btn--md")).toBe(false);
  });

  it("className добавляется к классам компонента", () => {
    render(<Button className="custom">Ок</Button>);
    const button = screen.getByRole("button");
    expect(button.classList.contains("custom")).toBe(true);
    expect(button.classList.contains("ds-btn")).toBe(true);
  });

  it("disabled блокирует клик", () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Сохранить
      </Button>,
    );
    const button = screen.getByRole("button") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("обычный клик вызывает onClick", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Сохранить</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("loading ставит aria-busy, показывает спиннер, не отключает кнопку и глушит клик", () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Отправляем
      </Button>,
    );
    const button = screen.getByRole("button") as HTMLButtonElement;
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(button.disabled).toBe(false);
    expect(button.querySelector(".ds-btn__spin")?.getAttribute("aria-hidden")).toBe("true");
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("loading не даёт отправить форму, без loading форма отправляется", () => {
    const onSubmit = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    const { rerender } = render(
      <form onSubmit={onSubmit}>
        <Button type="submit" loading>
          Отправить
        </Button>
      </form>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onSubmit).not.toHaveBeenCalled();
    rerender(
      <form onSubmit={onSubmit}>
        <Button type="submit">Отправить</Button>
      </form>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("без loading нет aria-busy", () => {
    render(<Button>Сохранить</Button>);
    expect(screen.getByRole("button").hasAttribute("aria-busy")).toBe(false);
  });

  it("спиннер заменяет значок слева, значок справа остаётся", () => {
    render(
      <Button loading icon={<svg data-testid="start" />} iconEnd={<svg data-testid="end" />}>
        Ждём
      </Button>,
    );
    expect(screen.queryByTestId("start")).toBeNull();
    expect(screen.getByTestId("end")).toBeTruthy();
  });

  it("значки скрыты от скринридера", () => {
    render(
      <Button icon={<svg data-testid="start" />} iconEnd={<svg data-testid="end" />}>
        Далее
      </Button>,
    );
    expect(screen.getByTestId("start").parentElement?.getAttribute("aria-hidden")).toBe("true");
    expect(screen.getByTestId("end").parentElement?.className).toBe("ds-btn__end");
    expect(screen.getByTestId("end").parentElement?.getAttribute("aria-hidden")).toBe("true");
  });

  it("кнопка без подписи не рисует label, имя берётся из aria-label", () => {
    render(<Button square aria-label="Скачать" icon={<svg />} />);
    const button = screen.getByRole("button", { name: "Скачать" });
    expect(button.querySelector(".ds-btn__label")).toBeNull();
  });

  it("aria-pressed, aria-expanded и data-атрибуты пробрасываются на кнопку", () => {
    render(
      <Button aria-pressed="true" aria-expanded="false" data-testid="btn" name="save" value="1">
        Фильтр
      </Button>,
    );
    const button = screen.getByTestId("btn") as HTMLButtonElement;
    expect(button.getAttribute("aria-pressed")).toBe("true");
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(button.name).toBe("save");
    expect(button.value).toBe("1");
  });

  it("type можно переопределить", () => {
    render(<Button type="submit">Отправить</Button>);
    expect(screen.getByRole("button").getAttribute("type")).toBe("submit");
  });

  it("ref указывает на элемент button", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ок</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("сам по себе не ставит data-force", () => {
    render(<Button>Ок</Button>);
    expect(screen.getByRole("button").hasAttribute("data-force")).toBe(false);
  });
});

describe("ButtonGroup", () => {
  it("объединяет кнопки в группу с подписью", () => {
    render(
      <ButtonGroup aria-label="Период">
        <Button variant="outline">День</Button>
        <Button variant="outline">Неделя</Button>
      </ButtonGroup>,
    );
    const group = screen.getByRole("group", { name: "Период" });
    expect(group.classList.contains("ds-btn-group")).toBe(true);
    expect(group.querySelectorAll("button")).toHaveLength(2);
  });
});
