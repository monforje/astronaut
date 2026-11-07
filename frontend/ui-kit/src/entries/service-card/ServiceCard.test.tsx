/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { ServiceCard, type ServiceCardProps } from "./index";

const base: ServiceCardProps = {
  name: "1С:Предприятие",
  category: "Бухгалтерия",
  status: "ok",
  brand: { color: "#F5B400", onColor: "#3a2800", glyph: "1С" },
  lastSync: "12 мин назад",
  metrics: [
    { label: "Записей", value: "12 480" },
    { label: "Задержка", value: "4 мин" },
  ],
  activity: [40, 60, 80, 50],
  capabilities: ["Контрагенты", "Накладные"],
};

describe("ServiceCard", () => {
  it("article с подписью «Название: статус», бейдж статуса текстом", () => {
    render(<ServiceCard {...base} />);
    const card = screen.getByRole("article", { name: "1С:Предприятие: Работает" });
    expect(card.classList.contains("ds-svc--ok")).toBe(true);
    expect(card.classList.contains("ds-card--flush")).toBe(true);
    expect(screen.getByText("Работает")).toBeTruthy();
  });

  it("заголовок: категория и время синхронизации, плитка скрыта от скринридера", () => {
    const { container } = render(<ServiceCard {...base} />);
    expect(screen.getByText("Бухгалтерия · 12 мин назад")).toBeTruthy();
    const tile = container.querySelector(".ds-svc__tile") as HTMLElement;
    expect(tile.getAttribute("aria-hidden")).toBe("true");
    expect(tile.textContent).toBe("1С");
  });

  it("цвет, форма и цвет глифа попадают в css-переменные", () => {
    render(<ServiceCard {...base} brand={{ color: "red", shape: "50%" }} data-testid="c" />);
    const card = screen.getByTestId("c");
    expect(card.style.getPropertyValue("--ds-svc-c")).toBe("red");
    expect(card.style.getPropertyValue("--ds-svc-shape")).toBe("50%");
    expect(card.style.getPropertyValue("--ds-svc-on")).toBe("white");
  });

  it("метрики, возможности и график активности", () => {
    const { container } = render(<ServiceCard {...base} />);
    expect(screen.getByText("12 480")).toBeTruthy();
    expect(screen.getByText("Накладные")).toBeTruthy();
    expect(screen.getByRole("img", { name: "Активность за 24 часа" })).toBeTruthy();
    expect(container.querySelectorAll(".ds-svc__bars i").length).toBe(4);
  });

  it("переключатель: switch с именем программы, включён у работающей", () => {
    render(<ServiceCard {...base} />);
    const sw = screen.getByRole("switch", { name: "1С:Предприятие" }) as HTMLInputElement;
    expect(sw.checked).toBe(true);
  });

  it("выключенная и ненастроенная: переключатель выключен, столбцы серые", () => {
    const { container, rerender } = render(<ServiceCard {...base} status="off" />);
    expect((screen.getByRole("switch") as HTMLInputElement).checked).toBe(false);
    expect(container.querySelectorAll(".ds-svc__bar--z").length).toBe(4);
    rerender(<ServiceCard {...base} status="unset" />);
    expect(screen.getByText("Бухгалтерия · нет ключа доступа")).toBeTruthy();
    expect(screen.getByText("Не настроено")).toBeTruthy();
  });

  it("onEnabledChange получает новое значение", () => {
    const onEnabledChange = vi.fn();
    render(<ServiceCard {...base} enabled={false} onEnabledChange={onEnabledChange} />);
    fireEvent.click(screen.getByRole("switch"));
    expect(onEnabledChange).toHaveBeenCalledWith(true);
  });

  it("ошибка: role=alert с текстом, красные столбцы с позиции activityErrorFrom", () => {
    const { container } = render(
      <ServiceCard
        {...base}
        status="err"
        error="Ошибка авторизации (401)."
        activityErrorFrom={2}
      />,
    );
    expect(screen.getByRole("alert").textContent).toContain("Ошибка авторизации (401).");
    expect(container.querySelectorAll(".ds-svc__bar--e").length).toBe(2);
  });

  it("синхронизация: progressbar со значением и подписью процентов", () => {
    render(<ServiceCard {...base} status="syncing" progress={64} />);
    const bar = screen.getByRole("progressbar", { name: "Синхронизация" });
    expect(bar.getAttribute("aria-valuenow")).toBe("64");
    expect(screen.getByText("64%")).toBeTruthy();
  });

  it("синхронизация без процентов: aria-valuetext «выполняется»", () => {
    render(<ServiceCard {...base} status="syncing" />);
    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-valuetext")).toBe("выполняется");
    expect(bar.hasAttribute("aria-valuenow")).toBe(false);
  });

  it("действия рисуются в подвале карточки, без них подвала нет", () => {
    const { container, rerender } = render(
      <ServiceCard {...base} actions={<button type="button">Настроить</button>} />,
    );
    expect(container.querySelector(".ds-card__foot--two")).not.toBeNull();
    expect(screen.getByRole("button", { name: "Настроить" })).toBeTruthy();
    rerender(<ServiceCard {...base} />);
    expect(container.querySelector(".ds-card__foot")).toBeNull();
  });

  it("свои подписи статусов и aria-label", () => {
    render(
      <ServiceCard
        {...base}
        statusLabels={{ ok: "Online" }}
        aria-label="Бухгалтерия"
        data-testid="c"
      />,
    );
    expect(screen.getByText("Online")).toBeTruthy();
    expect(screen.getByTestId("c").getAttribute("aria-label")).toBe("Бухгалтерия");
  });

  it("className, ref и атрибуты пробрасываются, data-force нет", () => {
    const ref = createRef<HTMLDivElement>();
    render(<ServiceCard {...base} ref={ref} className="custom" data-testid="c" />);
    const card = screen.getByTestId("c");
    expect(ref.current).toBe(card);
    expect(card.classList.contains("custom")).toBe(true);
    expect(card.hasAttribute("data-force")).toBe(false);
  });
});
