/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Avatar } from "./index";
import { initials, toneOf } from "./Avatar";

describe("Avatar", () => {
  it("рисует инициалы человека и подписывает его именем", () => {
    render(<Avatar name="Ирина Петрова" />);
    const avatar = screen.getByRole("img", { name: "Ирина Петрова" });
    expect(avatar.textContent).toBe("ИП");
    expect(avatar.classList.contains("ds-avatar")).toBe(true);
  });

  it("цвет имени выбирается по названию, toneIndex его переопределяет", () => {
    const { rerender } = render(<Avatar name="Ирина Петрова" />);
    const auto = `ds-avatar--tone-${toneOf("Ирина Петрова")}`;
    expect(screen.getByRole("img").classList.contains(auto)).toBe(true);
    rerender(<Avatar name="Ирина Петрова" toneIndex={4} />);
    expect(screen.getByRole("img").classList.contains("ds-avatar--tone-4")).toBe(true);
  });

  it("инициалы пропускают юрформу и кавычки", () => {
    expect(initials("ООО «Транс Логистик»")).toBe("ТЛ");
    expect(initials("")).toBe("?");
  });

  it("размер и квадратная форма выражены классами", () => {
    render(<Avatar name="Ольга Ким" size="lg" square />);
    const avatar = screen.getByRole("img");
    expect(avatar.classList.contains("ds-avatar--lg")).toBe(true);
    expect(avatar.classList.contains("ds-avatar--sqr")).toBe(true);
  });

  it("you, muted и more красятся своими классами без цвета имени", () => {
    const { rerender } = render(<Avatar kind="you" name="Вы" />);
    expect(screen.getByRole("img").classList.contains("ds-avatar--accent")).toBe(true);
    rerender(<Avatar kind="muted" name="Неизвестный" />);
    expect(screen.getByRole("img").textContent).toBe("?");
    expect(screen.getByRole("img").classList.contains("ds-avatar--muted")).toBe(true);
    rerender(<Avatar kind="more" count={5} />);
    const more = screen.getByRole("img", { name: "ещё 5" });
    expect(more.textContent).toBe("+5");
    expect(more.className).not.toMatch(/tone-/);
  });

  it("агент: картинка-знак и подпись «Агент»", () => {
    render(<Avatar kind="agent" />);
    const avatar = screen.getByRole("img", { name: "Агент" });
    expect(avatar.classList.contains("ds-avatar--ai")).toBe(true);
    expect(avatar.querySelector("img.ds-avatar__mark")?.getAttribute("alt")).toBe("");
  });

  it("присутствие попадает в data-status и в подпись, точка скрыта от скринридера", () => {
    render(<Avatar name="Ирина Петрова" status="busy" />);
    const avatar = screen.getByRole("img", { name: "Ирина Петрова, занят" });
    expect(avatar.getAttribute("data-status")).toBe("busy");
    expect(avatar.querySelector(".ds-avatar__st")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("свой aria-label заменяет имя, статус дописывается", () => {
    render(<Avatar name="Ирина Петрова" aria-label="Ответственный" status="on" />);
    expect(screen.getByRole("img", { name: "Ответственный, в сети" })).toBeTruthy();
  });

  it("без статуса нет точки и data-status", () => {
    render(<Avatar name="Ирина Петрова" />);
    const avatar = screen.getByRole("img");
    expect(avatar.querySelector(".ds-avatar__st")).toBeNull();
    expect(avatar.hasAttribute("data-status")).toBe(false);
  });

  it("className, data-атрибуты и ref пробрасываются", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Avatar ref={ref} name="Ольга Ким" className="custom" data-testid="av" />);
    const avatar = screen.getByTestId("av");
    expect(ref.current).toBe(avatar);
    expect(avatar.classList.contains("custom")).toBe(true);
  });
});
