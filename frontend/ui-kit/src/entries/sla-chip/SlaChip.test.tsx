/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { SlaChip } from "./index";
import { slaText, slaTone } from "./SlaChip";

describe("SlaChip", () => {
  it("текст срока: минуты, часы с минутами, дни", () => {
    expect(slaText(45)).toBe("45 м");
    expect(slaText(380)).toBe("6 ч 20 м");
    expect(slaText(2 * 1440 + 4 * 60 + 15)).toBe("2 д 4 ч");
    expect(slaText(-45)).toBe("−45 м");
  });

  it("тон: просрочен, меньше порога, запас", () => {
    expect(slaTone(-1)).toBe("err");
    expect(slaTone(0)).toBe("err");
    expect(slaTone(65)).toBe("warn");
    expect(slaTone(380)).toBe("ok");
    expect(slaTone(130, 180)).toBe("warn");
  });

  it("читается как «До срока SLA осталось …», видимый текст скрыт от скринридера", () => {
    render(<SlaChip minutes={380} />);
    const chip = screen.getByRole("button", { name: "До срока SLA осталось 6 ч 20 м" });
    expect(chip.querySelector(".ds-sla__badge")?.getAttribute("aria-hidden")).toBe("true");
    expect(chip.querySelector(".ds-badge--ok")).not.toBeNull();
  });

  it("просроченный срок: тон err и текст «просрочен»", () => {
    render(<SlaChip minutes={-45} />);
    expect(screen.getByRole("button", { name: "SLA просрочен на 45 м" })).toBeTruthy();
    expect(document.querySelector(".ds-badge--err")).not.toBeNull();
  });

  it("пауза: серый тон и подпись «Пауза»", () => {
    render(<SlaChip minutes={95} paused />);
    const chip = screen.getByRole("button", { name: "SLA на паузе" });
    expect(chip.textContent).toContain("Пауза");
    expect(chip.querySelector(".ds-badge--idle")).not.toBeNull();
  });

  it("размер sm и подпись-префикс", () => {
    render(<SlaChip minutes={380} size="sm" label="SLA" />);
    const chip = screen.getByRole("button");
    expect(chip.querySelector(".ds-badge--sm")).not.toBeNull();
    expect(chip.textContent).toContain("SLA 6 ч 20 м");
  });

  it("загрузка: заглушка с aria-busy и без кнопки", () => {
    render(<SlaChip minutes={380} loading />);
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByRole("status").getAttribute("aria-busy")).toBe("true");
  });

  it("нет срока: тире с подписью; ошибка: «Нет срока»", () => {
    const { rerender } = render(<SlaChip minutes={null} />);
    expect(screen.getByRole("img", { name: "Срока нет" }).textContent).toBe("—");
    rerender(<SlaChip error />);
    expect(screen.getByText("Нет срока")).toBeTruthy();
  });

  it("подсказка со сроком связана через aria-describedby, Esc её скрывает", () => {
    render(<SlaChip minutes={65} deadline="сегодня, 18:00" />);
    const chip = screen.getByRole("button");
    const tip = screen.getByRole("tooltip", { hidden: true });
    expect(tip.textContent).toContain("Срок: сегодня, 18:00");
    expect(chip.getAttribute("aria-describedby")).toBe(tip.id);
    fireEvent.keyDown(chip, { key: "Escape" });
    expect(chip.hasAttribute("data-dismissed")).toBe(true);
    fireEvent.blur(chip);
    expect(chip.hasAttribute("data-dismissed")).toBe(false);
  });

  it("без срока подсказки нет, data-force по умолчанию нет", () => {
    render(<SlaChip minutes={65} />);
    expect(screen.queryByRole("tooltip", { hidden: true })).toBeNull();
    expect(screen.getByRole("button").hasAttribute("data-force")).toBe(false);
  });

  it("className, атрибуты и ref пробрасываются", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<SlaChip ref={ref} minutes={65} className="custom" data-testid="sla" />);
    const chip = screen.getByTestId("sla");
    expect(ref.current).toBe(chip);
    expect(chip.classList.contains("custom")).toBe(true);
    expect(chip.getAttribute("type")).toBe("button");
  });
});
