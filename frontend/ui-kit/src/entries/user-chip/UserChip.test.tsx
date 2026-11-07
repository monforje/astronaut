/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Mention, UserChip } from "./index";

describe("UserChip", () => {
  it("без обработчиков это статичный чип: имя текстом, аватар скрыт от скринридера", () => {
    const { container } = render(<UserChip name="Ирина Петрова" post="Оформление" />);
    const chip = container.querySelector(".ds-uchip") as HTMLElement;
    expect(chip.tagName).toBe("SPAN");
    expect(chip.classList.contains("ds-uchip--static")).toBe(true);
    expect(screen.getByText("Ирина Петрова")).toBeTruthy();
    expect(screen.getByText("Оформление").classList.contains("ds-uchip__role")).toBe(true);
    expect(chip.querySelector(".ds-uchip__av")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("с onClick это кнопка, клик вызывает обработчик", () => {
    const onClick = vi.fn();
    render(<UserChip name="Ирина Петрова" onClick={onClick} />);
    const chip = screen.getByRole("button", { name: /Ирина Петрова/ });
    expect(chip.getAttribute("type")).toBe("button");
    fireEvent.click(chip);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("с href это ссылка", () => {
    render(<UserChip name="Ирина Петрова" href="/people/17" />);
    expect(screen.getByRole("link", { name: /Ирина Петрова/ }).getAttribute("href")).toBe(
      "/people/17",
    );
  });

  it("disabled кнопка не кликается, отключённая ссылка помечена aria-disabled", () => {
    const onClick = vi.fn();
    const { rerender } = render(<UserChip name="Ирина Петрова" onClick={onClick} disabled />);
    const button = screen.getByRole("button") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
    rerender(<UserChip name="Ирина Петрова" href="/p" onClick={onClick} disabled />);
    const link = screen.getByRole("link");
    expect(link.getAttribute("aria-disabled")).toBe("true");
    expect(link.getAttribute("tabindex")).toBe("-1");
    fireEvent.click(link);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("квадратный аватар для организации", () => {
    const { container } = render(<UserChip name="Дальснаб" square />);
    expect(container.querySelector(".ds-avatar--sqr")).not.toBeNull();
  });

  it("неизвестный: нейтральный аватар, подпись и красная рамка", () => {
    const { container } = render(<UserChip name="u-17" unknown />);
    expect(screen.getByText("Неизвестный")).toBeTruthy();
    expect(container.querySelector(".ds-avatar--muted")).not.toBeNull();
    expect(container.querySelector(".ds-uchip--error")).not.toBeNull();
  });

  it("загрузка: заглушки и aria-busy, кнопкой не становится", () => {
    const { container } = render(
      <UserChip name="Ирина Петрова" onClick={() => undefined} loading />,
    );
    const chip = container.querySelector(".ds-uchip") as HTMLElement;
    expect(chip.getAttribute("aria-busy")).toBe("true");
    expect(chip.querySelectorAll(".ds-skel").length).toBe(2);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("с onRemove есть крестик с подписью «Убрать: имя»", () => {
    const onRemove = vi.fn();
    render(<UserChip name="Ирина Петрова" onRemove={onRemove} />);
    const x = screen.getByRole("button", { name: "Убрать: Ирина Петрова" });
    fireEvent.click(x);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("Backspace и Delete на самом чипе убирают его, на других клавишах ничего", () => {
    const onRemove = vi.fn();
    render(<UserChip name="Ирина Петрова" onRemove={onRemove} />);
    const chip = screen.getByRole("group", { name: "Ирина Петрова" });
    expect(chip.getAttribute("tabindex")).toBe("0");
    fireEvent.keyDown(chip, { key: "Enter" });
    expect(onRemove).not.toHaveBeenCalled();
    fireEvent.keyDown(chip, { key: "Backspace" });
    fireEvent.keyDown(chip, { key: "Delete" });
    expect(onRemove).toHaveBeenCalledTimes(2);
  });

  it("className, атрибуты и ref пробрасываются", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<UserChip ref={ref} name="Ирина Петрова" className="custom" data-testid="chip" />);
    const chip = screen.getByTestId("chip");
    expect(ref.current).toBe(chip);
    expect(chip.classList.contains("custom")).toBe(true);
    expect(chip.hasAttribute("data-force")).toBe(false);
  });
});

describe("Mention", () => {
  it("статичное упоминание: «@имя» в span", () => {
    render(<Mention data-testid="mn">Алексей Крылов</Mention>);
    const mention = screen.getByTestId("mn");
    expect(mention.tagName).toBe("SPAN");
    expect(mention.textContent).toBe("@Алексей Крылов");
  });

  it("с href это ссылка, с onClick кнопка", () => {
    const onClick = vi.fn();
    const { rerender } = render(<Mention href="/people/17">Алексей Крылов</Mention>);
    expect(screen.getByRole("link", { name: "@Алексей Крылов" })).toBeTruthy();
    rerender(<Mention onClick={onClick}>Алексей Крылов</Mention>);
    fireEvent.click(screen.getByRole("button", { name: "@Алексей Крылов" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("«вы» и удалённый пользователь получают свои классы; удалённый не кликается", () => {
    const { rerender } = render(
      <Mention me data-testid="mn">
        Ирина Петрова
      </Mention>,
    );
    expect(screen.getByTestId("mn").classList.contains("ds-uchip-mn--me")).toBe(true);
    rerender(
      <Mention unknown href="/p" data-testid="mn">
        Бывший сотрудник
      </Mention>,
    );
    const gone = screen.getByTestId("mn");
    expect(gone.classList.contains("ds-uchip-mn--unknown")).toBe(true);
    expect(gone.tagName).toBe("SPAN");
  });
});
