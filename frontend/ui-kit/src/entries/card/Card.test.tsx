/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Card, CardBar, CardBody, CardFooter, CardHeader, KpiCard } from "./index";

describe("Card", () => {
  it("рисует div с классом outline по умолчанию", () => {
    render(<Card data-testid="c">Текст</Card>);
    const card = screen.getByTestId("c");
    expect(card.tagName).toBe("DIV");
    expect(card.className).toBe("ds-card");
    expect(card.textContent).toBe("Текст");
  });

  it("варианты, размер, flush, тон и KPI выражены классами", () => {
    render(
      <Card data-testid="c" variant="solid" size="sm" flush tone="err" kpi>
        x
      </Card>,
    );
    const card = screen.getByTestId("c");
    for (const cls of [
      "ds-card--solid",
      "ds-card--sm",
      "ds-card--flush",
      "ds-card--tone-err",
      "ds-card--kpi",
    ]) {
      expect(card.classList.contains(cls)).toBe(true);
    }
  });

  it("as меняет тег корня", () => {
    render(
      <Card as="article" data-testid="c">
        x
      </Card>,
    );
    expect(screen.getByTestId("c").tagName).toBe("ARTICLE");
  });

  it("обычная карточка не попадает в Tab и не имеет роли", () => {
    render(<Card data-testid="c">x</Card>);
    const card = screen.getByTestId("c");
    expect(card.hasAttribute("tabindex")).toBe(false);
    expect(card.hasAttribute("role")).toBe(false);
  });

  it("интерактивная: role=link, tabindex=0, Enter вызывает onClick", () => {
    const onClick = vi.fn();
    render(
      <Card interactive aria-label="Открыть" onClick={onClick}>
        x
      </Card>,
    );
    const card = screen.getByRole("link", { name: "Открыть" });
    expect(card.getAttribute("tabindex")).toBe("0");
    fireEvent.keyDown(card, { key: "Enter" });
    expect(onClick).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(card, { key: " " });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("недоступная карточка: aria-disabled и выходит из Tab", () => {
    const onClick = vi.fn();
    render(
      <Card interactive disabled onClick={onClick} data-testid="c">
        x
      </Card>,
    );
    const card = screen.getByTestId("c");
    expect(card.getAttribute("aria-disabled")).toBe("true");
    expect(card.hasAttribute("tabindex")).toBe(false);
    fireEvent.keyDown(card, { key: "Enter" });
    expect(onClick).not.toHaveBeenCalled();
  });

  it("выбранная карточка: aria-current и класс selected", () => {
    render(
      <Card selected data-testid="c">
        x
      </Card>,
    );
    const card = screen.getByTestId("c");
    expect(card.getAttribute("aria-current")).toBe("true");
    expect(card.classList.contains("ds-card--selected")).toBe(true);
  });

  it("className, ref и data-атрибуты пробрасываются, data-force нет", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Card ref={ref} className="custom" data-testid="c">
        x
      </Card>,
    );
    const card = screen.getByTestId("c");
    expect(ref.current).toBe(card);
    expect(card.classList.contains("custom")).toBe(true);
    expect(card.hasAttribute("data-force")).toBe(false);
  });
});

describe("части карточки", () => {
  it("заголовок: скрытый значок, название и действие", () => {
    const { container } = render(
      <CardHeader icon={<svg data-testid="i" />} action={<button type="button">Меню</button>}>
        Расхождение
      </CardHeader>,
    );
    expect(container.querySelector(".ds-card__ico")?.getAttribute("aria-hidden")).toBe("true");
    expect(screen.getByText("Расхождение").classList.contains("ds-card__title")).toBe(true);
    expect(screen.getByRole("button", { name: "Меню" })).toBeTruthy();
  });

  it("приглушённый заголовок и подвал на две кнопки", () => {
    const { container } = render(
      <>
        <CardHeader muted>Груз</CardHeader>
        <CardFooter two>
          <button type="button">Да</button>
        </CardFooter>
      </>,
    );
    expect(container.querySelector(".ds-card__title--muted")).not.toBeNull();
    expect(container.querySelector(".ds-card__foot--two")).not.toBeNull();
  });

  it("плашка заголовка с пояснением и тело", () => {
    const { container } = render(
      <>
        <CardBar sub="128 строк">Таблица</CardBar>
        <CardBody>Тело</CardBody>
      </>,
    );
    expect(container.querySelector(".ds-card__h-sub")?.textContent).toBe("128 строк");
    expect(container.querySelector(".ds-card__b")?.textContent).toBe("Тело");
  });
});

describe("KpiCard", () => {
  it("значение, подпись, дельта, график и пояснение", () => {
    const { container } = render(
      <KpiCard
        label="Грузов за месяц"
        value="412"
        delta="+8,4%"
        deltaDir="up"
        data={[1, 2, 3]}
        note="к октябрю: 380"
      />,
    );
    expect(screen.getByText("412").classList.contains("ds-card__value")).toBe(true);
    expect(screen.getByText("Грузов за месяц")).toBeTruthy();
    expect(screen.getByText("+8,4%").classList.contains("ds-chart__delta--good")).toBe(true);
    expect(screen.getByRole("img", { name: "Грузов за месяц: динамика" })).toBeTruthy();
    expect(screen.getByText("к октябрю: 380")).toBeTruthy();
    expect(container.querySelector(".ds-card--kpi.ds-card--sm")).not.toBeNull();
  });

  it("без данных график не рисуется, тон дельты задаётся", () => {
    render(<KpiCard label="Срок" value="3" delta="+2" deltaTone="bad" />);
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.getByText("+2").classList.contains("ds-chart__delta--bad")).toBe(true);
  });
});
