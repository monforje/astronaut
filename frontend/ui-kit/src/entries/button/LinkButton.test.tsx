/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { LinkButton } from "./index";

describe("LinkButton", () => {
  it("по умолчанию dashed md и type=button", () => {
    render(<LinkButton>Сбросить фильтры</LinkButton>);
    const button = screen.getByRole("button", { name: "Сбросить фильтры" });
    expect(button.className).toBe("ds-btn-link ds-btn-link--dashed ds-btn-link--md");
    expect(button.getAttribute("type")).toBe("button");
  });

  it("next и ext рисуют скрытую от скринридера стрелку", () => {
    const { rerender } = render(<LinkButton kind="next">Открыть</LinkButton>);
    expect(
      screen.getByRole("button", { name: "Открыть" }).querySelector(".ds-btn-link__ar"),
    ).toBeTruthy();
    rerender(<LinkButton kind="ext">Открыть</LinkButton>);
    const arrow = screen.getByRole("button", { name: "Открыть" }).querySelector(".ds-btn-link__ar");
    expect(arrow?.getAttribute("aria-hidden")).toBe("true");
  });

  it("disabled блокирует клик", () => {
    const onClick = vi.fn();
    render(
      <LinkButton disabled onClick={onClick}>
        Открыть
      </LinkButton>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("loading ставит aria-busy, рисует спиннер и глушит клик", () => {
    const onClick = vi.fn();
    render(
      <LinkButton loading onClick={onClick}>
        Открыть
      </LinkButton>,
    );
    const button = screen.getByRole("button");
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(button.querySelector(".ds-btn-link__spin")).toBeTruthy();
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("ref и атрибуты пробрасываются", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <LinkButton ref={ref} data-testid="link">
        Назад
      </LinkButton>,
    );
    expect(ref.current).toBe(screen.getByTestId("link"));
  });
});
