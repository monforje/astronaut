/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Skeleton, SkeletonChart, SkeletonGroup, SkeletonRow } from "./index";

describe("Skeleton", () => {
  it("блок скрыт от скринридера, размеры и форма по умолчанию", () => {
    render(<Skeleton data-testid="sk" />);
    const block = screen.getByTestId("sk");
    expect(block.getAttribute("aria-hidden")).toBe("true");
    expect(block.classList.contains("ds-skel--rect")).toBe(true);
    expect(block.style.width).toBe("100%");
    expect(block.style.height).toBe("12px");
  });

  it("форма и размеры задаются пропсами, свой стиль сохраняется", () => {
    render(
      <Skeleton data-testid="sk" shape="round" width={32} height={32} style={{ margin: 2 }} />,
    );
    const block = screen.getByTestId("sk");
    expect(block.classList.contains("ds-skel--round")).toBe(true);
    expect(block.style.width).toBe("32px");
    expect(block.style.margin).toBe("2px");
  });

  it("className и ref пробрасываются", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Skeleton ref={ref} className="custom" data-testid="sk" />);
    expect(ref.current).toBe(screen.getByTestId("sk"));
    expect(ref.current?.classList.contains("custom")).toBe(true);
  });
});

describe("SkeletonGroup", () => {
  it("в загрузке: aria-busy, анимация-волна и скрытая подпись", () => {
    render(
      <SkeletonGroup data-testid="g">
        <Skeleton />
      </SkeletonGroup>,
    );
    const group = screen.getByTestId("g");
    expect(group.getAttribute("aria-busy")).toBe("true");
    expect(group.getAttribute("data-anim")).toBe("wave");
    expect(screen.getByText("Загрузка…").classList.contains("ds-skel-sr")).toBe(true);
  });

  it("после загрузки aria-busy и подпись снимаются", () => {
    render(
      <SkeletonGroup data-testid="g" loading={false}>
        <span>данные</span>
      </SkeletonGroup>,
    );
    expect(screen.getByTestId("g").hasAttribute("aria-busy")).toBe(false);
    expect(screen.queryByText("Загрузка…")).toBeNull();
  });

  it("анимация pulse и своя подпись", () => {
    render(
      <SkeletonGroup data-testid="g" animation="pulse" label="Грузим грузы">
        <Skeleton />
      </SkeletonGroup>,
    );
    expect(screen.getByTestId("g").getAttribute("data-anim")).toBe("pulse");
    expect(screen.getByText("Грузим грузы")).toBeTruthy();
  });
});

describe("пресеты", () => {
  it("строка: круг, две строки текста и плашка", () => {
    const { container } = render(<SkeletonRow />);
    expect(container.querySelectorAll(".ds-skel").length).toBe(4);
    expect(container.querySelector(".ds-skel--round")).not.toBeNull();
    expect(container.querySelector(".ds-skel--item")).not.toBeNull();
  });

  it("узкая строка делает первую строку текста короче", () => {
    const { container } = render(<SkeletonRow narrow />);
    expect((container.querySelector(".ds-skel-col .ds-skel") as HTMLElement).style.width).toBe(
      "55%",
    );
  });

  it("график: по столбцу на каждое значение", () => {
    const { container } = render(<SkeletonChart bars={[10, 20, 30]} />);
    expect(container.querySelectorAll(".ds-skel--item").length).toBe(3);
  });
});
