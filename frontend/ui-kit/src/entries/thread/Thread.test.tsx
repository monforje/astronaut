/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { createRef, useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Thread, type ThreadDraft, type ThreadMessage } from "./index";

const ME = "Ирина Петрова";
const PEOPLE = [
  { name: "Ирина Петрова", role: "Оформление" },
  { name: "Алексей Крылов", role: "Брокер" },
  { name: "Мария Новикова", role: "Оформление" },
];

const MESSAGES: ThreadMessage[] = [
  { id: 1, kind: "system", day: "Вчера", time: "17:05", text: "Агент нашёл <b>180 кг</b>" },
  {
    id: 2,
    author: "Мария Новикова",
    day: "Вчера",
    time: "17:31",
    text: "@Алексей Крылов проверьте вес",
    reactions: { "👀": ["Ирина Петрова"], "👍": ["Алексей Крылов", "Мария Новикова"] },
  },
  {
    id: 3,
    author: "Алексей Крылов",
    day: "Вчера",
    time: "17:34",
    text: "Тара 12 кг.",
    replyTo: 2,
  },
  { id: 4, author: ME, day: "Сегодня", time: "10:44", text: "Позвонила брокеру." },
  { id: 5, author: ME, day: "Сегодня", time: "10:45", text: "Оставляю открытым." },
  { id: 6, author: "Алексей Крылов", day: "Сегодня", time: "11:02", text: "Принято." },
];

const log = () => screen.getByRole("log");
const msg = (id: number) => log().querySelector<HTMLElement>(`.ds-thread__msg[data-id="${id}"]`)!;
const input = () => screen.getByRole("combobox", { name: "Комментарий" }) as HTMLTextAreaElement;
const send = () => screen.getByRole("button", { name: "Отправить" }) as HTMLButtonElement;
const open = (id: number, name: string) =>
  fireEvent.click(within(msg(id)).getByRole("button", { name }));

function renderThread(props: Partial<React.ComponentProps<typeof Thread>> = {}) {
  return render(<Thread messages={MESSAGES} me={ME} people={PEOPLE} {...props} />);
}

describe("Thread: лента", () => {
  it("лента — role=log с aria-live, секция подписана", () => {
    renderThread({ label: "Обсуждение груза" });
    expect(screen.getByRole("region", { name: "Обсуждение груза" })).toBeTruthy();
    expect(log().getAttribute("aria-live")).toBe("polite");
    expect(log().getAttribute("aria-relevant")).toBe("additions");
    expect(log().getAttribute("tabindex")).toBe("0");
  });

  it("разделители дней, системное сообщение с выделением и время", () => {
    renderThread();
    expect(screen.getByText("Вчера")).toBeTruthy();
    expect(screen.getByText("Сегодня")).toBeTruthy();
    const sys = log().querySelector(".ds-thread__sys")!;
    expect(sys.querySelector("b")?.textContent).toBe("180 кг");
    expect(sys.textContent).toContain("17:05");
  });

  it("автор, метка «вы» только у своих, упоминание подсвечено", () => {
    renderThread();
    expect(within(msg(4)).getByText("вы")).toBeTruthy();
    expect(within(msg(2)).queryByText("вы")).toBeNull();
    expect(msg(2).querySelector(".ds-thread__mn")?.textContent).toBe("@Алексей Крылов");
  });

  it("подряд идущие сообщения одного автора склеиваются, первое и чужое — нет", () => {
    renderThread();
    expect(msg(5).hasAttribute("data-cont")).toBe(true);
    expect(msg(4).hasAttribute("data-cont")).toBe(false);
    expect(msg(6).hasAttribute("data-cont")).toBe(false);
    expect(msg(3).hasAttribute("data-cont")).toBe(false);
  });

  it("цитата показывает автора и текст исходного, клик подсвечивает его", () => {
    vi.useFakeTimers();
    renderThread();
    const quote = within(msg(3)).getByRole("button", {
      name: "Перейти к сообщению: Мария Новикова",
    });
    expect(quote.textContent).toContain("Мария Новикова");
    expect(quote.textContent).toContain("@Алексей Крылов проверьте вес");
    fireEvent.click(quote);
    expect(msg(2).hasAttribute("data-flash")).toBe(true);
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(msg(2).hasAttribute("data-flash")).toBe(false);
    vi.useRealTimers();
  });

  it("цитата удалённого сообщения подписана «удалено»", () => {
    renderThread({ messages: MESSAGES.filter((m) => m.id !== 2) });
    expect(within(msg(3)).getByText("удалено")).toBeTruthy();
  });

  it("новое сообщение появляется с data-enter, начальные — без", () => {
    const { rerender } = renderThread();
    expect(msg(6).hasAttribute("data-enter")).toBe(false);
    rerender(
      <Thread
        messages={[
          ...MESSAGES,
          { id: 7, author: ME, day: "Сегодня", time: "11:10", text: "Новое" },
        ]}
        me={ME}
        people={PEOPLE}
      />,
    );
    expect(msg(7).hasAttribute("data-enter")).toBe(true);
    expect(msg(6).hasAttribute("data-enter")).toBe(false);
  });

  it("ref, className, атрибуты, data-force по умолчанию нет", () => {
    const ref = createRef<HTMLElement>();
    const { container } = renderThread({ ref, className: "own", id: "t1" });
    expect(ref.current?.classList.contains("own")).toBe(true);
    expect(ref.current?.id).toBe("t1");
    expect(container.querySelector("[data-force]")).toBeNull();
  });
});

describe("Thread: состояния", () => {
  it("loading: aria-busy и заглушки", () => {
    const { container } = renderThread({ state: "loading" });
    expect(log().getAttribute("aria-busy")).toBe("true");
    expect(container.querySelectorAll(".ds-thread__skel")).toHaveLength(3);
  });

  it("empty: приглашение написать первым", () => {
    renderThread({ messages: [], state: "empty", emptyText: "Напишите первым" });
    expect(screen.getByText("Здесь пока тихо")).toBeTruthy();
    expect(screen.getByText("Напишите первым")).toBeTruthy();
  });

  it("error: alert и «Повторить»", () => {
    const onRetryLoad = vi.fn();
    renderThread({ state: "error", onRetryLoad });
    expect(screen.getByRole("alert").textContent).toContain("Не удалось загрузить сообщения");
    fireEvent.click(screen.getByRole("button", { name: "Повторить" }));
    expect(onRetryLoad).toHaveBeenCalledTimes(1);
  });

  it("typing показывает «печатает…»", () => {
    renderThread({ typing: "Алексей Крылов" });
    expect(screen.getByText(/Алексей Крылов печатает/)).toBeTruthy();
  });

  it("showComposer=false убирает поле ввода", () => {
    renderThread({ showComposer: false });
    expect(screen.queryByRole("combobox")).toBeNull();
  });

  it("не отправлено: alert, повтор и удаление; отправляется: индикатор", () => {
    const onRetry = vi.fn();
    const onDiscard = vi.fn();
    const failed: ThreadMessage = { ...MESSAGES[3], id: 9, status: "failed" };
    const sending: ThreadMessage = { ...MESSAGES[3], id: 10, status: "sending" };
    renderThread({ messages: [failed, sending], onRetry, onDiscard });
    expect(within(msg(9)).getByRole("alert").textContent).toContain("Не отправлено");
    fireEvent.click(within(msg(9)).getByRole("button", { name: "Повторить" }));
    fireEvent.click(within(msg(9)).getByRole("button", { name: "Удалить" }));
    expect(onRetry).toHaveBeenCalledWith(failed);
    expect(onDiscard).toHaveBeenCalledWith(failed);
    expect(within(msg(10)).getByText("Отправляется…")).toBeTruthy();
  });
});

describe("Thread: реакции и меню", () => {
  it("чип реакции: счётчик, aria-pressed для своей, подпись со списком людей", () => {
    renderThread();
    const mine = within(msg(2)).getByRole("button", { name: "👀: Ирина Петрова" });
    const other = within(msg(2)).getByRole("button", {
      name: "👍: Алексей Крылов, Мария Новикова",
    });
    expect(mine.getAttribute("aria-pressed")).toBe("true");
    expect(other.getAttribute("aria-pressed")).toBe("false");
    expect(other.textContent).toBe("👍 2");
  });

  it("клик по чипу вызывает onReact", () => {
    const onReact = vi.fn();
    renderThread({ onReact });
    fireEvent.click(within(msg(2)).getByRole("button", { name: /^👍/ }));
    expect(onReact).toHaveBeenCalledWith(MESSAGES[1], "👍");
  });

  it("«Реакция» открывает палитру, выбор эмодзи вызывает onReact и закрывает меню", () => {
    const onReact = vi.fn();
    renderThread({ onReact });
    open(4, "Реакция");
    const menu = screen.getByRole("menu", { name: "Реакции" });
    expect(within(menu).getAllByRole("menuitem")).toHaveLength(6);
    fireEvent.click(within(menu).getByRole("menuitem", { name: "🎉" }));
    expect(onReact).toHaveBeenCalledWith(MESSAGES[3], "🎉");
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("«Ещё» у своего сообщения: копировать, изменить, удалить; у чужого только копировать", () => {
    renderThread();
    open(4, "Ещё");
    expect(
      within(screen.getByRole("menu"))
        .getAllByRole("menuitem")
        .map((i) => i.textContent),
    ).toEqual(["Копировать текст", "Изменить", "Удалить"]);
    open(6, "Ещё");
    expect(screen.getAllByRole("menu")).toHaveLength(1);
    expect(
      within(screen.getByRole("menu"))
        .getAllByRole("menuitem")
        .map((i) => i.textContent),
    ).toEqual(["Копировать текст"]);
  });

  it("кнопка «Ещё»: aria-expanded; Escape закрывает меню и возвращает фокус на неё", () => {
    renderThread();
    const more = within(msg(4)).getByRole("button", { name: "Ещё" });
    expect(more.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(more);
    expect(more.getAttribute("aria-expanded")).toBe("true");
    expect(document.activeElement?.textContent).toBe("Копировать текст");
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: "Escape" });
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(more);
  });

  it("стрелки в меню переключают пункты", () => {
    renderThread();
    open(4, "Ещё");
    const menu = screen.getByRole("menu");
    fireEvent.keyDown(menu, { key: "ArrowDown" });
    expect(document.activeElement?.textContent).toBe("Изменить");
    fireEvent.keyDown(menu, { key: "ArrowUp" });
    expect(document.activeElement?.textContent).toBe("Копировать текст");
  });

  it("клик снаружи закрывает меню, controlled menu сообщает onMenuChange", () => {
    const onMenuChange = vi.fn();
    const { rerender } = renderThread({ menu: null, onMenuChange });
    open(4, "Ещё");
    expect(onMenuChange).toHaveBeenCalledWith({ id: 4, kind: "more" });
    expect(screen.queryByRole("menu")).toBeNull();
    rerender(
      <Thread
        messages={MESSAGES}
        me={ME}
        people={PEOPLE}
        menu={{ id: 4, kind: "more" }}
        onMenuChange={onMenuChange}
      />,
    );
    expect(screen.getByRole("menu")).toBeTruthy();
    fireEvent.mouseDown(document.body);
    expect(onMenuChange).toHaveBeenLastCalledWith(null);
  });

  it("копирование пишет в буфер и сообщает onCopyText", () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
    const onCopyText = vi.fn();
    renderThread({ onCopyText });
    open(4, "Ещё");
    fireEvent.click(screen.getByRole("menuitem", { name: "Копировать текст" }));
    expect(writeText).toHaveBeenCalledWith("Позвонила брокеру.");
    expect(onCopyText).toHaveBeenCalledWith(MESSAGES[3]);
    vi.unstubAllGlobals();
  });
});

describe("Thread: поле ввода", () => {
  it("кнопка отправки неактивна для пустого текста, Enter отправляет, Shift+Enter нет", () => {
    const onSend = vi.fn();
    renderThread({ onSend });
    expect(send().disabled).toBe(true);
    fireEvent.keyDown(input(), { key: "Enter" });
    expect(onSend).not.toHaveBeenCalled();
    fireEvent.change(input(), { target: { value: "  Загрузила накладную  " } });
    expect(send().disabled).toBe(false);
    fireEvent.keyDown(input(), { key: "Enter", shiftKey: true });
    expect(onSend).not.toHaveBeenCalled();
    fireEvent.keyDown(input(), { key: "Enter" });
    expect(onSend).toHaveBeenCalledWith({
      text: "Загрузила накладную",
      replyTo: undefined,
      editing: undefined,
      file: undefined,
    });
    expect(input().value).toBe("");
  });

  it("кнопка «Отправить» отправляет так же", () => {
    const onSend = vi.fn();
    renderThread({ onSend });
    fireEvent.change(input(), { target: { value: "Готово" } });
    fireEvent.click(send());
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it("«Ответить»: превью над полем, фокус в поле, отправка с replyTo, Escape отменяет", () => {
    const onSend = vi.fn();
    renderThread({ onSend });
    open(6, "Ответить");
    expect(screen.getByText("Ответ: Алексей Крылов")).toBeTruthy();
    expect(document.activeElement).toBe(input());
    fireEvent.keyDown(input(), { key: "Escape" });
    expect(screen.queryByText("Ответ: Алексей Крылов")).toBeNull();
    open(6, "Ответить");
    fireEvent.change(input(), { target: { value: "Жду" } });
    fireEvent.keyDown(input(), { key: "Enter" });
    expect(onSend.mock.calls[0][0]).toMatchObject({ text: "Жду", replyTo: 6 });
    expect(screen.queryByText("Ответ: Алексей Крылов")).toBeNull();
  });

  it("«Изменить»: текст попадает в поле, отправка сообщает editing", () => {
    const onSend = vi.fn();
    renderThread({ onSend });
    open(4, "Ещё");
    fireEvent.click(screen.getByRole("menuitem", { name: "Изменить" }));
    expect(screen.getByText("Изменение сообщения")).toBeTruthy();
    expect(input().value).toBe("Позвонила брокеру.");
    expect(document.activeElement).toBe(input());
    fireEvent.change(input(), { target: { value: "Позвонила брокеру, всё верно." } });
    fireEvent.click(send());
    expect(onSend.mock.calls[0][0]).toMatchObject({
      text: "Позвонила брокеру, всё верно.",
      editing: 4,
    });
  });

  it("отмена правки очищает поле", () => {
    renderThread();
    open(4, "Ещё");
    fireEvent.click(screen.getByRole("menuitem", { name: "Изменить" }));
    fireEvent.click(screen.getByRole("button", { name: "Отмена" }));
    expect(input().value).toBe("");
    expect(screen.queryByText("Изменение сообщения")).toBeNull();
  });

  it("вложение: onAttach возвращает файл, превью и «Убрать файл», отправка с file", () => {
    const onSend = vi.fn();
    const onAttach = vi.fn(() => ({ name: "Накладная.pdf", size: "PDF · 188 КБ" }));
    renderThread({ onSend, onAttach });
    fireEvent.click(screen.getByRole("button", { name: "Прикрепить файл" }));
    expect(screen.getByText("Накладная.pdf")).toBeTruthy();
    expect(send().disabled).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Убрать файл" }));
    expect(screen.queryByText("Накладная.pdf")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Прикрепить файл" }));
    fireEvent.click(send());
    expect(onSend.mock.calls[0][0]).toMatchObject({ text: "", file: { name: "Накладная.pdf" } });
  });

  it("кнопка @ добавляет упоминание и открывает список", () => {
    renderThread();
    fireEvent.change(input(), { target: { value: "Проверьте" } });
    fireEvent.click(screen.getByRole("button", { name: "Упомянуть" }));
    expect(input().value).toBe("Проверьте @");
    expect(screen.getByRole("listbox", { name: "Упомянуть" })).toBeTruthy();
  });

  it("закрытое обсуждение: поле заблокировано с пояснением, кнопки неактивны", () => {
    renderThread({ composerDisabled: true });
    expect(input().disabled).toBe(true);
    expect(input().placeholder).toBe("Обсуждение закрыто");
    expect(send().disabled).toBe(true);
  });

  it("ошибка и занятость: alert под полем, спиннер вместо стрелки", () => {
    const { container } = renderThread({ composerError: "Нет сети", composerBusy: true });
    expect(screen.getByText("Нет сети").getAttribute("role")).toBe("alert");
    expect(container.querySelector(".ds-thread__send .ds-thread__spin")).not.toBeNull();
    expect(send().disabled).toBe(true);
  });
});

describe("Thread: упоминания @", () => {
  it("«@» открывает список людей, буквы сужают, aria-связи заданы", () => {
    renderThread();
    fireEvent.change(input(), { target: { value: "@" } });
    const list = screen.getByRole("listbox", { name: "Упомянуть" });
    expect(within(list).getAllByRole("option")).toHaveLength(3);
    expect(input().getAttribute("aria-expanded")).toBe("true");
    expect(input().getAttribute("aria-controls")).toBe(list.id);
    expect(input().getAttribute("aria-activedescendant")).toBeTruthy();
    fireEvent.change(input(), { target: { value: "@мар" } });
    expect(within(screen.getByRole("listbox")).getAllByRole("option")).toHaveLength(1);
  });

  it("стрелки выбирают, Enter вставляет имя и не отправляет", () => {
    const onSend = vi.fn();
    renderThread({ onSend });
    fireEvent.change(input(), { target: { value: "@" } });
    fireEvent.keyDown(input(), { key: "ArrowDown" });
    expect(screen.getAllByRole("option")[1].getAttribute("aria-selected")).toBe("true");
    fireEvent.keyDown(input(), { key: "Enter" });
    expect(input().value).toBe("@Алексей Крылов ");
    expect(onSend).not.toHaveBeenCalled();
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("Tab вставляет первого, Escape закрывает список без отмены текста", () => {
    renderThread();
    fireEvent.change(input(), { target: { value: "@" } });
    fireEvent.keyDown(input(), { key: "Escape" });
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(input().value).toBe("@");
    fireEvent.change(input(), { target: { value: "@кры" } });
    fireEvent.keyDown(input(), { key: "Tab" });
    expect(input().value).toBe("@Алексей Крылов ");
  });

  it("клик по пункту вставляет имя", () => {
    renderThread();
    fireEvent.change(input(), { target: { value: "см. @" } });
    fireEvent.click(screen.getByRole("option", { name: /Мария Новикова/ }));
    expect(input().value).toBe("см. @Мария Новикова ");
  });
});

describe("Thread: контролируемый черновик", () => {
  it("draft и onDraftChange управляют полем", () => {
    const onDraftChange = vi.fn();
    const draft: ThreadDraft = { text: "Черновик" };
    renderThread({ draft, onDraftChange });
    expect(input().value).toBe("Черновик");
    fireEvent.change(input(), { target: { value: "Черновик!" } });
    expect(onDraftChange).toHaveBeenCalledWith(expect.objectContaining({ text: "Черновик!" }));
    expect(input().value).toBe("Черновик");
  });

  it("defaultDraft задаёт начальный текст", () => {
    renderThread({ defaultDraft: { text: "Привет" } });
    expect(input().value).toBe("Привет");
  });

  it("жизненный цикл в родителе: отправка добавляет сообщение", () => {
    function Host() {
      const [list, setList] = useState(MESSAGES);
      return (
        <Thread
          messages={list}
          me={ME}
          people={PEOPLE}
          onSend={({ text }) =>
            setList((l) => [...l, { id: 99, author: ME, day: "Сегодня", time: "11:30", text }])
          }
        />
      );
    }
    render(<Host />);
    fireEvent.change(input(), { target: { value: "Новое сообщение" } });
    fireEvent.keyDown(input(), { key: "Enter" });
    expect(within(msg(99)).getByText("Новое сообщение")).toBeTruthy();
    expect(input().value).toBe("");
  });
});

describe("Thread: удаление с отменой", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("сообщение гаснет, затем onDelete, тост с «Отменить»", () => {
    const onDelete = vi.fn();
    const onRestore = vi.fn();
    renderThread({ onDelete, onRestore });
    open(5, "Ещё");
    fireEvent.click(screen.getByRole("menuitem", { name: "Удалить" }));
    expect(msg(5).hasAttribute("data-leave")).toBe(true);
    expect(onDelete).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(onDelete).toHaveBeenCalledWith(MESSAGES[4]);
    const toast = screen.getByRole("status");
    expect(toast.textContent).toContain("Сообщение удалено");
    fireEvent.click(within(toast).getByRole("button", { name: "Отменить" }));
    expect(onRestore).toHaveBeenCalledWith(MESSAGES[4], 4);
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("тост исчезает сам через 5 секунд", () => {
    renderThread({ onDelete: vi.fn(), onRestore: vi.fn() });
    open(5, "Ещё");
    fireEvent.click(screen.getByRole("menuitem", { name: "Удалить" }));
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(screen.getByRole("status")).toBeTruthy();
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("без onRestore тост без кнопки отмены", () => {
    renderThread({ onDelete: vi.fn() });
    open(5, "Ещё");
    fireEvent.click(screen.getByRole("menuitem", { name: "Удалить" }));
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(within(screen.getByRole("status")).queryByRole("button")).toBeNull();
  });

  it("при reduced-motion удаление не ждёт анимации", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("reduce"),
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    }));
    const onDelete = vi.fn();
    renderThread({ onDelete });
    open(5, "Ещё");
    fireEvent.click(screen.getByRole("menuitem", { name: "Удалить" }));
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onDelete).toHaveBeenCalledTimes(1);
    vi.unstubAllGlobals();
  });
});

describe("Thread: ответ агента", () => {
  const agent = (phase: "think" | "text" | "done", liked?: boolean): ThreadMessage => ({
    id: 30,
    kind: "agent",
    day: "Сегодня",
    time: "11:05",
    text: "",
    stream: {
      phase,
      text: "Нашёл расхождение",
      liked,
      thinking: "Анализирую…",
      summary: "Проверил 128",
    },
  });

  it("думает: строка-заглушка без текста и кнопок", () => {
    renderThread({ messages: [agent("think")] });
    expect(within(msg(30)).getByText("Анализирую…")).toBeTruthy();
    expect(within(msg(30)).queryByText("Нашёл расхождение")).toBeNull();
    expect(within(msg(30)).getByText("ИИ")).toBeTruthy();
    expect(within(msg(30)).queryByRole("toolbar")).toBeNull();
  });

  it("печатает: итог и текст с курсором, кнопок ещё нет", () => {
    renderThread({ messages: [agent("text")] });
    expect(within(msg(30)).getByText("Проверил 128")).toBeTruthy();
    expect(msg(30).querySelector(".ds-thread__cur")?.textContent).toBe("Нашёл расхождение");
    expect(within(msg(30)).queryByRole("button", { name: "Копировать" })).toBeNull();
  });

  it("готово: четыре действия вызывают onAgentAction, «Хороший ответ» нажат при liked", () => {
    const onAgentAction = vi.fn();
    renderThread({ messages: [agent("done", true)], onAgentAction });
    const good = within(msg(30)).getByRole("button", { name: "Хороший ответ" });
    expect(good.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(good);
    fireEvent.click(within(msg(30)).getByRole("button", { name: "Плохой ответ" }));
    fireEvent.click(within(msg(30)).getByRole("button", { name: "Ответить заново" }));
    fireEvent.click(within(msg(30)).getByRole("button", { name: "Копировать" }));
    expect(onAgentAction.mock.calls.map((c) => c[1])).toEqual(["up", "down", "regen", "copy"]);
  });

  it("у ответа агента нет панели действий над сообщением", () => {
    renderThread({ messages: [agent("done")] });
    expect(within(msg(30)).queryByRole("toolbar", { name: "Действия с сообщением" })).toBeNull();
  });
});
