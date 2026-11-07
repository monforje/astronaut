/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { fireEvent, render, screen } from "@testing-library/react";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { AgentPanel, type AgentMessage } from "./index";

const done: AgentMessage = {
  id: 1,
  question: "Какие грузы с расхождениями?",
  phase: "done",
  answer: <p>Нашёл 8 грузов</p>,
  summary: "Проверил 128 грузов",
  steps: ["Загрузил накладные", "Сравнил вес"],
  attachment: <div data-testid="card">карточка</div>,
};

describe("AgentPanel: пустой чат", () => {
  it("приветствие, подсказки и поле; без сообщений лога нет ответов", () => {
    render(
      <AgentPanel
        messages={[]}
        greeting="Чем помочь, Ирина?"
        intro="Спросите про грузы"
        suggestions={[{ title: "Какие грузы с расхождениями?", hint: "Найдёт разницу" }]}
      />,
    );
    expect(screen.getByRole("region", { name: "Агент" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Чем помочь, Ирина?" })).toBeTruthy();
    expect(screen.getByText("Спросите про грузы")).toBeTruthy();
    expect(
      screen.getByRole("log", { name: "Переписка" }).querySelector(".ds-agent-panel__reply"),
    ).toBeNull();
    expect(screen.getByRole("textbox", { name: "Сообщение" })).toBeTruthy();
  });

  it("клик по подсказке вызывает onAsk с её заголовком", () => {
    const onAsk = vi.fn();
    render(<AgentPanel messages={[]} onAsk={onAsk} suggestions={[{ title: "Выгрузить отчёт" }]} />);
    fireEvent.click(screen.getByRole("button", { name: "Выгрузить отчёт" }));
    expect(onAsk).toHaveBeenCalledWith("Выгрузить отчёт");
  });

  it("slotProps.suggestion отдаёт атрибуты конкретной подсказке", () => {
    render(
      <AgentPanel
        messages={[]}
        suggestions={[{ title: "Раз" }, { title: "Два" }]}
        slotProps={{ suggestion: (i) => (i === 1 ? ({ "data-mark": "x" } as object) : undefined) }}
      />,
    );
    expect(screen.getByRole("button", { name: "Два" }).getAttribute("data-mark")).toBe("x");
    expect(screen.getByRole("button", { name: "Раз" }).hasAttribute("data-mark")).toBe(false);
  });
});

describe("AgentPanel: ввод и отправка", () => {
  it("кнопка отправки отключена при пустом поле, Enter и кнопка отправляют обрезанный текст", () => {
    const onSend = vi.fn();
    render(<AgentPanel messages={[]} onSend={onSend} />);
    const field = screen.getByRole("textbox", { name: "Сообщение" }) as HTMLTextAreaElement;
    const send = screen.getByRole("button", { name: "Отправить" }) as HTMLButtonElement;
    expect(send.disabled).toBe(true);
    fireEvent.change(field, { target: { value: "  Привет  " } });
    expect(send.disabled).toBe(false);
    fireEvent.keyDown(field, { key: "Enter" });
    expect(onSend).toHaveBeenCalledWith("Привет");
    expect(field.value).toBe("");
    fireEvent.change(field, { target: { value: "Ещё" } });
    fireEvent.click(send);
    expect(onSend).toHaveBeenLastCalledWith("Ещё");
  });

  it("Shift+Enter не отправляет", () => {
    const onSend = vi.fn();
    render(<AgentPanel messages={[]} onSend={onSend} defaultValue="Текст" />);
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter", shiftKey: true });
    expect(onSend).not.toHaveBeenCalled();
  });

  it("управляемое значение: value и onValueChange", () => {
    const onValueChange = vi.fn();
    function Controlled() {
      const [value, setValue] = useState("Привет");
      return (
        <AgentPanel
          messages={[]}
          value={value}
          onValueChange={(next) => {
            onValueChange(next);
            setValue(next);
          }}
        />
      );
    }
    render(<Controlled />);
    const field = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(field.value).toBe("Привет");
    fireEvent.change(field, { target: { value: "Пока" } });
    expect(onValueChange).toHaveBeenLastCalledWith("Пока");
    expect(field.value).toBe("Пока");
  });

  it("во время ответа вместо отправки кнопка «Остановить», Enter не отправляет", () => {
    const onStop = vi.fn();
    const onSend = vi.fn();
    render(
      <AgentPanel
        messages={[{ ...done, phase: "streaming" }]}
        onStop={onStop}
        onSend={onSend}
        defaultValue="Следующий"
      />,
    );
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(onSend).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Остановить" }));
    expect(onStop).toHaveBeenCalledTimes(1);
  });

  it("чипы переключаются и сообщают aria-pressed", () => {
    render(<AgentPanel messages={[]} chips={["Сверка"]} />);
    const chip = screen.getByRole("button", { name: "Сверка" });
    expect(chip.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(chip);
    expect(chip.getAttribute("aria-pressed")).toBe("true");
  });
});

describe("AgentPanel: сообщения", () => {
  it("вопрос, ответ и подробности готового ответа", () => {
    render(<AgentPanel messages={[done]} />);
    expect(screen.getByText("Какие грузы с расхождениями?")).toBeTruthy();
    expect(screen.getByText("Нашёл 8 грузов")).toBeTruthy();
    expect(screen.getByTestId("card")).toBeTruthy();
    for (const name of ["Копировать", "Хороший ответ", "Плохой ответ", "Ответить заново"]) {
      expect(screen.getAllByRole("button", { name }).length).toBeGreaterThan(0);
    }
  });

  it("думает: подпись-мерцание, без ответа и действий", () => {
    const { container } = render(
      <AgentPanel messages={[{ ...done, phase: "thinking", thinkingText: "Анализирую грузы…" }]} />,
    );
    expect(container.querySelector(".ds-agent-panel__shimmer")?.textContent).toBe(
      "Анализирую грузы…",
    );
    expect(screen.queryByText("Нашёл 8 грузов")).toBeNull();
    expect(screen.queryByRole("button", { name: "Хороший ответ" })).toBeNull();
  });

  it("печатает: курсор data-typing, действий ещё нет, ответ виден", () => {
    const { container } = render(<AgentPanel messages={[{ ...done, phase: "streaming" }]} />);
    expect(container.querySelector(".ds-agent-panel__text")?.hasAttribute("data-typing")).toBe(
      true,
    );
    expect(screen.getByText("Нашёл 8 грузов")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Хороший ответ" })).toBeNull();
    expect(screen.queryByTestId("card")).toBeNull();
  });

  it("ответ дан: курсора нет, ссылка на источники раскрывает шаги", () => {
    const onToggleSteps = vi.fn();
    const { container, rerender } = render(
      <AgentPanel messages={[done]} onToggleSteps={onToggleSteps} />,
    );
    expect(container.querySelector(".ds-agent-panel__text")?.hasAttribute("data-typing")).toBe(
      false,
    );
    const toggle = screen.getByRole("button", { name: /Проверил 128 грузов/ });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("Сравнил вес")).toBeNull();
    fireEvent.click(toggle);
    expect(onToggleSteps).toHaveBeenCalledWith(1);
    rerender(
      <AgentPanel messages={[{ ...done, stepsOpen: true }]} onToggleSteps={onToggleSteps} />,
    );
    expect(screen.getByText("Сравнил вес")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Проверил/ }).getAttribute("aria-expanded")).toBe(
      "true",
    );
  });

  it("оценка, повтор и копирование вызывают обработчики", () => {
    const onFeedback = vi.fn();
    const onRegenerate = vi.fn();
    const onCopy = vi.fn();
    render(
      <AgentPanel
        messages={[{ ...done, feedback: "up" }]}
        onFeedback={onFeedback}
        onRegenerate={onRegenerate}
        onCopy={onCopy}
      />,
    );
    expect(screen.getByRole("button", { name: "Хороший ответ" }).getAttribute("aria-pressed")).toBe(
      "true",
    );
    expect(screen.getByRole("button", { name: "Плохой ответ" }).getAttribute("aria-pressed")).toBe(
      "false",
    );
    fireEvent.click(screen.getByRole("button", { name: "Плохой ответ" }));
    expect(onFeedback).toHaveBeenCalledWith(1, "down");
    fireEvent.click(screen.getByRole("button", { name: "Ответить заново" }));
    expect(onRegenerate).toHaveBeenCalledWith(1);
    fireEvent.click(screen.getAllByRole("button", { name: "Копировать" })[1]);
    expect(onCopy).toHaveBeenCalledWith(1);
  });

  it("ошибка: плашка с повтором вместо ответа", () => {
    const onRegenerate = vi.fn();
    render(<AgentPanel messages={[{ ...done, phase: "error" }]} onRegenerate={onRegenerate} />);
    expect(screen.getByRole("alert").textContent).toContain("Не удалось получить ответ");
    fireEvent.click(screen.getByRole("button", { name: "Повторить" }));
    expect(onRegenerate).toHaveBeenCalledWith(1);
    expect(screen.queryByText("Нашёл 8 грузов")).toBeNull();
  });

  it("«Изменить» кладёт вопрос в поле и сообщает onEdit", () => {
    const onEdit = vi.fn();
    render(<AgentPanel messages={[done]} onEdit={onEdit} />);
    fireEvent.click(screen.getByRole("button", { name: "Изменить" }));
    expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe(done.question);
    expect(onEdit).toHaveBeenCalledWith(1, done.question);
  });
});

describe("AgentPanel: оболочка", () => {
  it("история чатов по группам, текущий отмечен aria-current, выбор вызывает onSelectChat", () => {
    const onSelectChat = vi.fn();
    render(
      <AgentPanel
        messages={[]}
        onSelectChat={onSelectChat}
        chats={[
          { id: 1, title: "Расхождения", group: "Сегодня", current: true },
          { id: 2, title: "Сверка", group: "Сегодня" },
          { id: 3, title: "Без накладных", group: "Вчера" },
        ]}
      />,
    );
    const nav = screen.getByRole("navigation", { name: "История чатов" });
    expect(nav.querySelectorAll(".ds-agent-panel__hist-group")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Расхождения" }).getAttribute("aria-current")).toBe(
      "true",
    );
    fireEvent.click(screen.getByRole("button", { name: "Без накладных" }));
    expect(onSelectChat).toHaveBeenCalledWith(3);
  });

  it("размер в data-size, кнопки шапки, режим показывается только если задан", () => {
    const onClose = vi.fn();
    const onResize = vi.fn();
    const onNewChat = vi.fn();
    const { container, rerender } = render(
      <AgentPanel
        size="wide"
        messages={[]}
        onClose={onClose}
        onResize={onResize}
        onNewChat={onNewChat}
      />,
    );
    expect(container.querySelector(".ds-agent-panel")?.getAttribute("data-size")).toBe("wide");
    expect(container.querySelector(".ds-agent-panel__lbl")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Закрыть" }));
    fireEvent.click(screen.getByRole("button", { name: "Развернуть" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Новый чат" })[0]);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onResize).toHaveBeenCalledTimes(1);
    expect(onNewChat).toHaveBeenCalledTimes(1);
    rerender(<AgentPanel messages={[]} mode="Быстрый" />);
    expect(screen.getByText("Быстрый")).toBeTruthy();
  });

  it("ref, className, атрибуты, disclaimer; data-force нет", () => {
    const ref = createRef<HTMLElement>();
    render(
      <AgentPanel
        ref={ref}
        messages={[]}
        className="custom"
        data-testid="p"
        disclaimer="Агент может ошибаться"
      />,
    );
    expect(ref.current?.classList.contains("custom")).toBe(true);
    expect(ref.current?.getAttribute("data-testid")).toBe("p");
    expect(ref.current?.hasAttribute("data-force")).toBe(false);
    expect(screen.getByText("Агент может ошибаться")).toBeTruthy();
  });
});
