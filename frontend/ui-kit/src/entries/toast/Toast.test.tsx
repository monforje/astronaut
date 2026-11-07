/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ToastCard,
  ToastStack,
  Toaster,
  bindToast,
  createToastStore,
  defaultToastStore,
  toast,
  type ToastEntry,
} from "./index";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  act(() => defaultToastStore.clear());
  act(() => {
    vi.runAllTimers();
  });
  vi.useRealTimers();
});

function setup(options: { position?: "br" | "tc"; duration?: number } = {}) {
  const store = createToastStore();
  const api = bindToast(store);
  render(<Toaster store={store} {...options} />);
  return { store, api };
}

describe("store", () => {
  it("show кладёт новые тосты в начало и возвращает id", () => {
    const store = createToastStore();
    const first = store.show({ title: "Первый" });
    const second = store.show({ title: "Второй" });
    expect(second).toBeGreaterThan(first);
    expect(store.getSnapshot().map((t) => t.title)).toEqual(["Второй", "Первый"]);
  });

  it("dismiss сначала помечает closing, через 300 мс удаляет", () => {
    const store = createToastStore();
    const id = store.show({ title: "Х" });
    store.dismiss(id);
    expect(store.getSnapshot()[0].closing).toBe(true);
    vi.advanceTimersByTime(300);
    expect(store.getSnapshot()).toHaveLength(0);
  });

  it("update меняет тост на месте, id сохраняется", () => {
    const store = createToastStore();
    const id = store.show({ title: "Сверяем…", loading: true });
    store.update(id, { title: "Готово", loading: false, tone: "warn" });
    expect(store.getSnapshot()).toHaveLength(1);
    expect(store.getSnapshot()[0]).toMatchObject({
      id,
      title: "Готово",
      loading: false,
      tone: "warn",
    });
  });

  it("живых больше предела: лишние самые старые уходят", () => {
    const store = createToastStore(3);
    for (let i = 1; i <= 5; i++) store.show({ title: `Т${i}` });
    const live = store.getSnapshot().filter((t) => !t.closing);
    expect(live.map((t) => t.title)).toEqual(["Т5", "Т4", "Т3"]);
    vi.advanceTimersByTime(300);
    expect(store.getSnapshot()).toHaveLength(3);
  });

  it("clear закрывает все, подписчики уведомляются", () => {
    const store = createToastStore();
    const listener = vi.fn();
    store.subscribe(listener);
    store.show({ title: "А" });
    store.show({ title: "Б" });
    store.clear();
    vi.advanceTimersByTime(300);
    expect(store.getSnapshot()).toHaveLength(0);
    expect(listener).toHaveBeenCalled();
  });

  it("глобальная функция toast работает через общее хранилище", () => {
    const id = toast({ title: "Глобальный" });
    expect(defaultToastStore.getSnapshot().some((t) => t.id === id)).toBe(true);
    toast.update(id, { title: "Обновлён" });
    expect(defaultToastStore.getSnapshot().find((t) => t.id === id)?.title).toBe("Обновлён");
    toast.dismiss(id);
    expect(defaultToastStore.getSnapshot().find((t) => t.id === id)?.closing).toBe(true);
  });
});

describe("Toaster", () => {
  it("область «Уведомления» всегда в body, тосты — role=status", () => {
    const { api } = setup();
    const region = screen.getByRole("region", { name: "Уведомления" });
    expect(region.parentElement).toBe(document.body);
    expect(screen.queryByRole("status")).toBeNull();
    act(() => {
      api({ title: "Документы сверены", description: "Расхождений нет" });
    });
    const card = screen.getByRole("status");
    expect(card.textContent).toContain("Документы сверены");
    expect(card.textContent).toContain("Расхождений нет");
    expect(card.getAttribute("tabindex")).toBe("0");
  });

  it("положение попадает в data-pos", () => {
    setup({ position: "tc" });
    expect(screen.getByRole("region").getAttribute("data-pos")).toBe("tc");
  });

  it("автозакрытие через 5 секунд", () => {
    const { api } = setup();
    act(() => {
      api({ title: "Х" });
    });
    act(() => {
      vi.advanceTimersByTime(4900);
    });
    expect(screen.getByRole("status")).toBeTruthy();
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(screen.getByRole("status").hasAttribute("data-closing")).toBe(true);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("свой duration у тоста и sticky при Infinity", () => {
    const { api } = setup();
    act(() => {
      api({ title: "Короткий", duration: 1000 });
      api({ title: "Вечный", duration: Infinity });
    });
    act(() => {
      vi.advanceTimersByTime(1400);
    });
    const titles = screen.getAllByRole("status").map((c) => c.textContent);
    expect(titles.some((t) => t?.includes("Короткий"))).toBe(false);
    expect(titles.some((t) => t?.includes("Вечный"))).toBe(true);
    act(() => {
      vi.advanceTimersByTime(60000);
    });
    expect(screen.getAllByRole("status")).toHaveLength(1);
  });

  it("наведение раскрывает стопку и ставит таймеры на паузу, после ухода отсчёт заново", () => {
    const { api } = setup();
    act(() => {
      api({ title: "Х" });
    });
    const region = screen.getByRole("region");
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    fireEvent.mouseEnter(region);
    act(() => {
      vi.advanceTimersByTime(20000);
    });
    expect(screen.getByRole("status").hasAttribute("data-closing")).toBe(false);
    expect(screen.getByRole("status").hasAttribute("data-expanded")).toBe(true);
    fireEvent.mouseLeave(region);
    act(() => {
      vi.advanceTimersByTime(4900);
    });
    expect(screen.getByRole("status").hasAttribute("data-closing")).toBe(false);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.getByRole("status").hasAttribute("data-closing")).toBe(true);
  });

  it("тост «идёт» не закрывается сам, после update начинает отсчёт", () => {
    const { api } = setup();
    let id = 0;
    act(() => {
      id = api({ title: "Сверяем…", loading: true });
    });
    expect(document.querySelector(".ds-toast .ds-spinner")).not.toBeNull();
    act(() => {
      vi.advanceTimersByTime(20000);
    });
    expect(screen.getByRole("status")).toBeTruthy();
    act(() => {
      api.update(id, { loading: false, title: "Готово", tone: "warn" });
    });
    expect(document.querySelector(".ds-toast .ds-spinner")).toBeNull();
    expect(document.querySelector(".ds-toast__icon--warn")).not.toBeNull();
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByRole("status").hasAttribute("data-closing")).toBe(true);
  });

  it("действие вызывает onClick и закрывает тост (undo)", () => {
    const { api } = setup();
    const onClick = vi.fn(() => {
      api({ title: "Возвращено" });
    });
    act(() => {
      api({ title: "Груз в архиве", action: { label: "Отменить", onClick } });
    });
    fireEvent.click(screen.getByRole("button", { name: "Отменить" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    const cards = screen.getAllByRole("status");
    expect(cards).toHaveLength(2);
    expect(cards[1].hasAttribute("data-closing")).toBe(true);
    expect(cards[0].textContent).toContain("Возвращено");
  });

  it("крестик подписан и закрывает, Esc на карточке тоже", () => {
    const { api } = setup();
    act(() => {
      api({ title: "Первый" });
    });
    fireEvent.click(screen.getByRole("button", { name: "Закрыть" }));
    expect(screen.getByRole("status").hasAttribute("data-closing")).toBe(true);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    act(() => {
      api({ title: "Второй" });
    });
    fireEvent.keyDown(screen.getByRole("status"), { key: "Escape" });
    expect(screen.getByRole("status").hasAttribute("data-closing")).toBe(true);
  });

  it("не больше пяти живых, значки декоративные", () => {
    const { api } = setup();
    act(() => {
      for (let i = 0; i < 7; i++) api({ title: `Т${i}` });
    });
    const live = screen.getAllByRole("status").filter((c) => !c.hasAttribute("data-closing"));
    expect(live).toHaveLength(5);
    expect(document.querySelector(".ds-toast__icon svg")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("container: стопка рисуется внутри узла", () => {
    const host = document.createElement("div");
    document.body.append(host);
    const store = createToastStore();
    render(<Toaster store={store} container={host} />);
    expect(host.querySelector(".ds-toaster")).not.toBeNull();
    host.remove();
  });
});

describe("ToastStack и ToastCard", () => {
  const entries: ToastEntry[] = [
    { id: 2, title: "Новый" },
    { id: 1, title: "Старый", closing: true },
  ];

  it("стопка рисует карточки по списку, закрывающаяся не занимает место", () => {
    const onClose = vi.fn();
    render(<ToastStack items={entries} position="tl" onClose={onClose} />);
    const cards = screen.getAllByRole("status");
    expect(cards.map((c) => c.getAttribute("data-id"))).toEqual(["2", "1"]);
    expect(cards[0].hasAttribute("data-front")).toBe(true);
    expect(cards[1].hasAttribute("data-front")).toBe(false);
    fireEvent.click(screen.getAllByRole("button", { name: "Закрыть" })[0]);
    expect(onClose).toHaveBeenCalledWith(2);
  });

  it("expanded помечает карточки data-expanded", () => {
    render(<ToastStack items={entries} expanded />);
    expect(screen.getAllByRole("status")[0].hasAttribute("data-expanded")).toBe(true);
  });

  it("ToastCard — статичная карточка на месте, без data-force", () => {
    const { container } = render(
      <ToastCard title="Документы сверены" description="Расхождений нет" tone="info" />,
    );
    const card = container.firstChild as HTMLElement;
    expect(card.classList.contains("ds-toast--static")).toBe(true);
    expect(card.getAttribute("role")).toBe("status");
    expect(card.hasAttribute("data-force")).toBe(false);
    expect(card.querySelector(".ds-toast__icon--info")).not.toBeNull();
  });
});
