/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ReactNode } from "react";
import { Marks } from "@/engine/Callout";
import { Playback } from "@/engine/Playback";
import { defineDoc } from "@/engine/types";
import { AGENT_TEXT, DemoComposer, DemoMsg, LiveThread, SEED, ThreadView, type Msg } from "./demo";

const BASE = SEED.slice(4);
const TAIL = SEED.slice(5);
const own = (id: number, text: string, extra: Partial<Msg> = {}): Msg => ({
  id,
  author: "Ирина Петрова",
  day: "Сегодня",
  time: "11:06",
  text,
  ...extra,
});
const Pad = ({ children }: { children: ReactNode }) => (
  <div style={{ width: "100%", maxWidth: 440, paddingTop: 22 }}>{children}</div>
);
const WIDE = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
  gap: 12,
  alignItems: "start",
} as const;
const Cards = ({ items }: { items: [string, string, ReactNode][] }) => (
  <div style={WIDE}>
    {items.map(([t, note, demo]) => (
      <article className="dx-state" key={t}>
        <div className="dx-canvas">{demo}</div>
        <div className="dx-state__cap">
          <b>{t}</b>
          <small>{note}</small>
        </div>
      </article>
    ))}
  </div>
);

function SendDemo() {
  const full = "Загрузила накладную в 1С";
  type S = { n: number; sent: 0 | 1 | 2; typing: boolean; rep: boolean };
  const steps = [
    ...Array.from({ length: full.length }, (_, i) => ({
      at: 400 + i * 50,
      set: { n: i + 1 } as Partial<S>,
    })),
    { at: 1900, set: { n: 0, sent: 1 } as Partial<S> },
    { at: 2300, set: { typing: true } as Partial<S> },
    { at: 2700, set: { sent: 2 } as Partial<S> },
    { at: 4100, set: { typing: false, rep: true } as Partial<S> },
  ];
  return (
    <Playback<S>
      initial={{ n: 0, sent: 0, typing: false, rep: false }}
      script={steps}
      tail={900}
      hint="Набор, Enter, «Отправляется…», «печатает…», ответ коллеги."
      render={(s) => {
        const mine = own(20, full, { status: s.sent === 1 ? "sending" : undefined });
        const answer: Msg = {
          id: 21,
          author: "Алексей Крылов",
          day: "Сегодня",
          time: "11:07",
          text: "Спасибо, принял.",
        };
        const list = [...BASE, ...(s.sent ? [mine] : []), ...(s.rep ? [answer] : [])];
        return (
          <ThreadView
            messages={list}
            height={400}
            typing={s.typing ? "Алексей Крылов" : null}
            enterId={s.rep ? 21 : s.sent ? 20 : null}
            composer={{
              text: full.slice(0, s.n),
              force: s.n > 0 ? "focus" : undefined,
              sendForce: s.n === full.length ? "hover" : undefined,
            }}
          />
        );
      }}
    />
  );
}

function ReplyDemo() {
  type S = {
    hover: number | null;
    reply: boolean;
    text: string;
    sent: boolean;
    qf?: "hover";
    flash: boolean;
  };
  return (
    <Playback<S>
      initial={{ hover: null, reply: false, text: "", sent: false, flash: false }}
      script={[
        { at: 400, set: { hover: 8 } },
        { at: 1000, set: { reply: true, hover: null } },
        { at: 1500, set: { text: "Загрузите, как только придёт" } },
        { at: 2300, set: { sent: true, reply: false, text: "" } },
        { at: 3000, set: { qf: "hover" } },
        { at: 3500, set: { flash: true, qf: undefined } },
        { at: 5000, set: { flash: false } },
      ]}
      tail={600}
      hint="Ответить → превью над полем → цитата в сообщении → клик по цитате подсвечивает исходное."
      render={(s) => {
        const reply = BASE.find((m) => m.id === 8)!;
        const mine = own(20, "Загрузите, как только придёт", { replyTo: 8 });
        return (
          <ThreadView
            messages={s.sent ? [...BASE, mine] : BASE}
            height={400}
            hoverId={s.hover}
            flashId={s.flash ? 8 : null}
            enterId={s.sent ? 20 : null}
            quoteForce={s.qf ? { id: 20, force: s.qf } : undefined}
            composer={{
              text: s.text,
              reply: s.reply ? reply : null,
              force: s.reply ? "focus" : undefined,
            }}
          />
        );
      }}
    />
  );
}

function MentionDemo() {
  type S = { text: string; q: string | null; hi: number };
  return (
    <Playback<S>
      initial={{ text: "", q: null, hi: 0 }}
      script={[
        { at: 400, set: { text: "@", q: "" } },
        { at: 900, set: { text: "@А", q: "А" } },
        { at: 1300, set: { text: "@Ал", q: "Ал" } },
        { at: 1900, set: { text: "@Алексей Крылов ", q: null } },
        { at: 2400, set: { text: "@Алексей Крылов проверьте вес тары?" } },
      ]}
      tail={900}
      hint="«@» открывает список, буквы его сужают, Enter или Tab вставляет первого."
      render={(s) => (
        <ThreadView
          messages={TAIL}
          height={420}
          composer={{
            text: s.text,
            force: s.text ? "focus" : undefined,
            mention: s.q === null ? null : { query: s.q, hi: s.hi },
          }}
        />
      )}
    />
  );
}

function DeleteDemo() {
  type S = {
    hover: number | null;
    menu: boolean;
    leave: boolean;
    gone: boolean;
    toast: boolean;
    uf?: "hover";
    back: boolean;
  };
  return (
    <Playback<S>
      initial={{ hover: null, menu: false, leave: false, gone: false, toast: false, back: false }}
      script={[
        { at: 400, set: { hover: 7 } },
        { at: 900, set: { menu: true } },
        { at: 1800, set: { menu: false, leave: true, hover: null } },
        { at: 2000, set: { leave: false, gone: true, toast: true } },
        { at: 3200, set: { uf: "hover" } },
        { at: 3700, set: { gone: false, toast: false, uf: undefined, back: true } },
      ]}
      tail={900}
      hint="Ещё → Удалить: сообщение гаснет, снизу тост «Отменить»; отмена возвращает на то же место."
      render={(s) => (
        <ThreadView
          messages={s.gone ? BASE.filter((m) => m.id !== 7) : BASE}
          height={400}
          hoverId={s.hover}
          menu={s.menu ? { id: 7, kind: "more" } : null}
          leaveId={s.leave ? 7 : null}
          enterId={s.back ? 7 : null}
          toast={
            s.toast ? { text: "Сообщение удалено", action: "Отменить", actionForce: s.uf } : null
          }
          composer={{ text: "" }}
        />
      )}
    />
  );
}

function StreamDemo() {
  const words = AGENT_TEXT.split(" ");
  type S = { phase: "none" | "think" | "text" | "done"; n: number; liked?: boolean };
  const per = 3;
  const chunks = Math.ceil(words.length / per);
  const steps = [
    { at: 400, set: { phase: "think" } as Partial<S> },
    ...Array.from({ length: chunks }, (_, i) => ({
      at: 1500 + i * 110,
      set: { phase: "text", n: Math.min(words.length, (i + 1) * per) } as Partial<S>,
    })),
    { at: 1500 + chunks * 110 + 200, set: { phase: "done" } as Partial<S> },
  ];
  return (
    <Playback<S>
      initial={{ phase: "none", n: 0 }}
      script={steps}
      tail={1200}
      hint="«Анализирую…», строка «Проверил…», текст по три слова с курсором, затем кнопки."
      render={(s) => {
        const agent: Msg = {
          id: 30,
          kind: "agent",
          day: "Сегодня",
          time: "11:05",
          text: "",
          stream:
            s.phase === "none"
              ? undefined
              : { phase: s.phase, text: words.slice(0, s.n).join(" "), liked: s.liked },
        };
        return (
          <ThreadView
            messages={s.phase === "none" ? TAIL : [...TAIL, agent]}
            height={440}
            enterId={s.phase === "think" ? 30 : null}
            composer={{ text: "" }}
          />
        );
      }}
    />
  );
}

function ReactionDemo() {
  type S = { me: boolean; f?: "hover" | "active" };
  return (
    <Playback<S>
      initial={{ me: true }}
      script={[
        { at: 400, set: { f: "hover" } },
        { at: 900, set: { f: "active" } },
        { at: 1100, set: { me: false, f: "hover" } },
        { at: 2000, set: { f: "active" } },
        { at: 2200, set: { me: true, f: "hover" } },
        { at: 3000, set: { f: undefined } },
      ]}
      tail={700}
      hint="Клик по своей реакции снимает её, клик по чужой — ставит вашу; счётчик меняется сразу."
      render={(s) => {
        const m4: Msg = {
          ...SEED[3],
          reactions: { "👍": s.me ? ["Мария Новикова", "Ирина Петрова"] : ["Мария Новикова"] },
        };
        return (
          <div style={{ width: "100%", maxWidth: 440 }}>
            <ThreadView
              messages={[SEED[2], m4]}
              bare
              noComposer
              rxForce={s.f ? { id: 4, emoji: "👍", force: s.f } : undefined}
            />
          </div>
        );
      }}
    />
  );
}

function RetryDemo() {
  type S = { st: "sending" | "failed" | "sent" };
  return (
    <Playback<S>
      initial={{ st: "sending" }}
      script={[
        { at: 1200, set: { st: "failed" } },
        { at: 2600, set: { st: "sending" } },
        { at: 3500, set: { st: "sent" } },
      ]}
      tail={900}
      hint="Предложение: сеть упала → «Не отправлено», «Повторить» → снова «Отправляется…» → отправлено."
      render={(s) => (
        <div style={{ width: "100%", maxWidth: 440 }}>
          <ThreadView
            messages={[
              ...TAIL.slice(0, 2),
              own(20, "Загрузила накладную в 1С", { status: s.st === "sent" ? undefined : s.st }),
            ]}
            bare
            noComposer
          />
        </div>
      )}
    />
  );
}

export default defineDoc({
  id: "thread",
  title: "Thread / Comments",
  group: "people",
  cssPrefix: "ds-thread",
  order: 40,
  keywords: [
    "комментарии",
    "чат",
    "обсуждение",
    "сообщения",
    "сообщение",
    "переписка",
    "лента",
    "диалог",
    "ответ",
    "цитата",
    "упоминание",
    "реакции",
    "эмодзи",
    "вложение",
    "агент",
    "ИИ",
    "thread",
    "comments",
    "comment",
    "chat",
    "messages",
    "message",
    "mention",
    "reply",
    "reaction",
    "composer",
    "feed",
    "discussion",
    "agent",
  ],
  summary:
    "Обсуждение как чат без пузырей: аватар, имя, время, ответ с цитатой, @упоминания, файлы, реакции, системные события, ответы агента, поле ввода.",
  purpose:
    "Thread показывает комментарии к грузу, документу или расхождению так, как люди привыкли общаться: сверху вниз, новое снизу. Здесь же агент отвечает на вопросы, и его ответы приходят потоком. Компонент состоит из ленты, строки «печатает…» и поля ввода; сообщения не лежат в пузырях, а склеиваются в серии одного автора. В чате нет моноширинного шрифта: номера груза и суммы набираются обычным шрифтом.",
  related: [
    "avatar",
    "avatar-group",
    "user-chip",
    "relative-time",
    "toast",
    "tooltip",
    "agent-panel",
  ],
  anatomy: {
    demo: (
      <div
        className="ds-thread__anat"
        style={{ display: "grid", gap: 24, width: "100%", maxWidth: 480 }}
      >
        <Marks
          block
          items={[
            { n: 1, anchor: '.ds-thread__msg[data-id="4"]', side: "l" },
            { n: 2, anchor: '.ds-thread__msg[data-id="4"] .ds-thread__acts', side: "r" },
            { n: 3, anchor: ".ds-thread__quote", side: "r" },
            { n: 4, anchor: '.ds-thread__msg[data-id="4"] .ds-thread__body > span', side: "r" },
            { n: 5, anchor: '.ds-thread__msg[data-id="4"] .ds-thread__rxs', side: "r" },
          ]}
        >
          <DemoMsg ids={[4]} hoverId={4} />
        </Marks>
        <Marks
          block
          items={[
            { n: 6, anchor: ".ds-thread__typing", side: "r" },
            { n: 7, anchor: ".ds-thread__box", side: "r" },
          ]}
        >
          <DemoComposer text="" typing="Алексей Крылов" />
        </Marks>
      </div>
    ),
    parts: [
      {
        name: "Аватар и шапка",
        description:
          "Аватар md (32) слева, справа имя Onest 700, метка «вы» у своих, время 11 px. У сообщения агента: логотип и метка «ИИ».",
      },
      {
        name: "Панель действий",
        description:
          "Всплывает над правым верхним углом на hover и фокус: реакция, ответить, ещё (копировать, изменить, удалить). Кнопки 28 px.",
      },
      {
        name: "Цитата ответа",
        description:
          "Кнопка-плашка над текстом: значок ответа, имя автора и первые 90 символов исходного. Клик переносит к исходному сообщению.",
      },
      {
        name: "Текст",
        description:
          "13,5 px / 1,5. @Упоминание — плашка --selected с текстом --link-strong. Пометка «изменено» серым после текста.",
      },
      {
        name: "Вложение и реакции",
        description:
          "Карточка файла (плитка PDF, имя, размер) и чипы реакций 22 px со счётчиком; свои подсвечены; последняя — «добавить».",
      },
      {
        name: "Строка «печатает…»",
        description:
          "Под лентой: три точки и «Алексей Крылов печатает…», 22 px высотой, всегда занимает место.",
      },
      {
        name: "Поле ввода",
        description:
          "Рамка поля, превью ответа или файла, textarea от 44 до 140 px, строка кнопок (@, скрепка, эмодзи), подсказка «Enter — отправить» и «Отправить».",
      },
    ],
  },
  variants: [
    {
      id: "live",
      title: "Живое обсуждение",
      description:
        "Пишите, ставьте реакции, отвечайте с цитатой, набирайте «@», удаляйте с «Отменить». Серии одного автора (до 5 минут) склеены, время видно по наведению.",
      when: "комментарии к грузу, расхождению, документу.",
      demo: <LiveThread />,
    },
    {
      id: "quote",
      title: "Ответ с цитатой",
      description:
        "Ответ на сообщение цитирует исходное над своим текстом. Ответ никогда не склеивается с предыдущим сообщением того же автора.",
      demo: <DemoMsg ids={[4]} />,
    },
    {
      id: "mention",
      title: "Упоминание",
      description: "Плашка @Имя в тексте. Выбор по «@» из списка людей обсуждения.",
      demo: <DemoMsg ids={[3]} />,
    },
    {
      id: "file",
      title: "Вложение",
      description:
        "Карточка файла под текстом: плитка типа (PDF красная), имя, тип и размер. Клик открывает файл.",
      demo: <DemoMsg ids={[2]} />,
    },
    {
      id: "reactions",
      title: "Реакции",
      description:
        "Чипы со счётчиком; свои подсвечены teal. Клик ставит и снимает; подсказка — кто поставил. Набор в макете: 👍 ✅ 👀 ❗ 🙏 🎉.",
      demo: <DemoMsg ids={[3, 4]} />,
    },
    {
      id: "system",
      title: "Системное событие",
      description:
        "Серая центрированная строка со значком молнии: не от лица человека. День отделён линией «Сегодня», «Вчера».",
      demo: <DemoMsg ids={[1, 5]} />,
    },
    {
      id: "agent",
      title: "Ответ агента",
      description:
        "Логотип агента вместо инициалов, метка «ИИ», строка «Проверил 128 грузов · 3 источника», текст, ниже кнопки: копировать, хороший ответ, плохой ответ, заново. Пока идёт ответ, в конце текста мигает курсор.",
      demo: (
        <DemoMsg
          ids={[]}
          extra={[
            {
              id: 30,
              kind: "agent",
              day: "Сегодня",
              time: "11:05",
              text: "",
              stream: { phase: "done", text: AGENT_TEXT },
            },
          ]}
        />
      ),
    },
  ],
  extra: [
    {
      id: "thread-states",
      title: "Состояния ленты",
      content: (
        <Cards
          items={[
            [
              "Загрузка",
              "Предложение: три заглушки сообщения (аватар, имя, строка); мерцание 1,4 с; поле ввода доступно.",
              <div key="l" style={{ width: "100%" }}>
                <ThreadView messages={[]} state="loading" height={220} noComposer />
              </div>,
            ],
            [
              "Пусто",
              "Предложение: логотип агента, «Здесь пока тихо» и совет написать или спросить агента.",
              <div key="e" style={{ width: "100%" }}>
                <ThreadView messages={[]} state="empty" height={220} noComposer />
              </div>,
            ],
            [
              "Ошибка загрузки",
              "Предложение: красная плашка «Не удалось загрузить сообщения» с «Повторить»; поле ввода остаётся.",
              <div key="r" style={{ width: "100%" }}>
                <ThreadView messages={[]} state="error" height={110} noComposer />
              </div>,
            ],
          ]}
        />
      ),
    },
    {
      id: "composer-states",
      title: "Состояния поля ввода",
      content: (
        <Cards
          items={[
            [
              "Обычное",
              "Рамка --border, placeholder --text-ph; «Отправить» неактивна, пока пусто.",
              <DemoComposer key="a" text="" />,
            ],
            ["Hover", "Рамка --text-3.", <DemoComposer key="b" text="" force="hover" />],
            [
              "Focus",
              "Рамка --focus и кольцо 3 px --selected.",
              <DemoComposer key="c" text="Позвонила брокеру" force="focus" sendForce="hover" />,
            ],
            [
              "Ответ",
              "Превью «Ответ: Алексей Крылов» с крестиком над полем; рамка фокуса.",
              <DemoComposer key="d" text="" force="focus" reply={SEED[7]} />,
            ],
            [
              "Правка",
              "Превью «Изменение сообщения»; текст подставлен в поле; Enter сохраняет, Esc и крестик отменяют.",
              <DemoComposer
                key="e"
                text="Пока оставляю расхождение открытым."
                force="focus"
                editing={SEED[6]}
              />,
            ],
            [
              "С файлом",
              "Превью файла с именем и размером; отправка доступна и без текста.",
              <DemoComposer
                key="f"
                text=""
                file={{ name: "Накладная_исправленная.pdf", size: "PDF · 188 КБ" }}
              />,
            ],
            [
              "Отправляется",
              "Предложение: кнопка с индикатором, повторные нажатия игнорируются; текст уже в ленте со статусом «Отправляется…».",
              <DemoComposer key="g" text="Загрузила накладную" force="focus" busy />,
            ],
            [
              "Ошибка",
              "Предложение: рамка --danger и текст причины под полем (role=alert), например «Файл больше 25 МБ».",
              <DemoComposer
                key="h"
                text=""
                invalid
                error="Файл больше 25 МБ"
                file={{ name: "Выгрузка_1С.zip", size: "ZIP · 31 МБ" }}
              />,
            ],
            [
              "Закрыто",
              "Предложение: обсуждение закрыто или нет прав. Рамка --divider, placeholder «Обсуждение закрыто», кнопки недоступны.",
              <DemoComposer key="i" text="" disabled />,
            ],
            [
              "@ — список",
              "Список людей над полем: аватар sm, имя, роль. Стрелки, Enter или Tab — выбор.",
              <div key="j" style={{ paddingTop: 150, width: "100%", maxWidth: 440 }}>
                <DemoComposer text="@А" force="focus" mention={{ query: "А", hi: 0 }} />
              </div>,
            ],
          ]}
        />
      ),
    },
  ],
  states: [
    {
      id: "default",
      kind: "default",
      title: "Сообщение",
      note: "Без фона; панель действий скрыта.",
      demo: <DemoMsg ids={[7]} />,
    },
    {
      id: "hover",
      kind: "hover",
      title: "Hover",
      note: "Слой 4 % на строке, над правым углом появляется панель действий. У склеенной серии показывается время слева.",
      forced: true,
      demo: (
        <Pad>
          <DemoMsg ids={[7]} hoverId={7} />
        </Pad>
      ),
    },
    {
      id: "active",
      kind: "active",
      title: "Active",
      note: "Нажатая кнопка панели («Ответить») — слой 12 %.",
      forced: true,
      demo: (
        <Pad>
          <DemoMsg ids={[7]} hoverId={7} replyForce={{ id: 7, force: "active" }} />
        </Pad>
      ),
    },
    {
      id: "focus",
      kind: "focus",
      title: "Focus",
      note: "Фокус на кнопке панели: панель видна (focus-within), кольцо --focus 2 px.",
      forced: true,
      demo: (
        <Pad>
          <DemoMsg ids={[7]} hoverId={7} replyForce={{ id: 7, force: "focus" }} />
        </Pad>
      ),
    },
    {
      id: "disabled",
      kind: "disabled",
      title: "Disabled",
      note: "Предложение: обсуждение закрыто. Лента остаётся, поле ввода и кнопки недоступны, реакции только читаются.",
      demo: <DemoComposer text="" disabled />,
    },
    {
      id: "loading",
      kind: "loading",
      title: "Loading",
      note: "Предложение: заглушки сообщений, мерцание.",
      demo: (
        <div style={{ width: "100%" }}>
          <ThreadView messages={[]} state="loading" height={170} noComposer />
        </div>
      ),
    },
    {
      id: "error",
      kind: "error",
      title: "Error",
      note: "Предложение: плашка «Не удалось загрузить сообщения» и «Повторить». Ошибка отправки — на самом сообщении (ниже).",
      demo: (
        <div style={{ width: "100%" }}>
          <ThreadView messages={[]} state="error" height={110} noComposer />
        </div>
      ),
    },
    {
      id: "empty",
      kind: "empty",
      title: "Empty",
      note: "Предложение: логотип агента, «Здесь пока тихо», подсказка.",
      demo: (
        <div style={{ width: "100%" }}>
          <ThreadView messages={[]} state="empty" height={210} noComposer />
        </div>
      ),
    },
    {
      id: "sending",
      kind: "other",
      title: "Отправляется",
      note: "Предложение: текст --text с прозрачностью 60 % и строка «Отправляется…» с индикатором 10 px.",
      demo: (
        <DemoMsg ids={[]} extra={[own(20, "Загрузила накладную в 1С", { status: "sending" })]} />
      ),
    },
    {
      id: "failed",
      kind: "error",
      title: "Не отправлено",
      note: "Предложение: строка «Не отправлено» --err-text и две ссылки «Повторить» и «Удалить». role=alert.",
      demo: (
        <DemoMsg ids={[]} extra={[own(20, "Загрузила накладную в 1С", { status: "failed" })]} />
      ),
    },
    {
      id: "flash",
      kind: "selected",
      title: "Подсвечено",
      note: "После клика по цитате исходное сообщение мигает teal 22 % ~1,4 с. Здесь показан первый кадр.",
      forced: true,
      demo: <DemoMsg ids={[7]} flashId={7} />,
    },
    {
      id: "edited",
      kind: "other",
      title: "Изменено",
      note: "После текста серая пометка «изменено» 11 px.",
      demo: (
        <DemoMsg
          ids={[]}
          extra={[own(20, "Пока оставляю расхождение открытым.", { edited: true })]}
        />
      ),
    },
    {
      id: "quote-hover",
      kind: "hover",
      title: "Цитата · hover",
      note: "Слой 9 % на плашке; курсор pointer.",
      forced: true,
      demo: <DemoMsg ids={[4]} quoteForce={{ id: 4, force: "hover" }} />,
    },
    {
      id: "reaction-me",
      kind: "selected",
      title: "Реакция · своя",
      note: "Teal-подложка, рамка --border-selected, текст --link-strong; aria-pressed=true.",
      demo: <DemoMsg ids={[4]} />,
    },
    {
      id: "streaming",
      kind: "loading",
      title: "Агент печатает",
      note: "«Анализирую грузы…» мерцает, затем текст с мигающим блоком-курсором.",
      demo: (
        <DemoMsg
          ids={[]}
          extra={[
            {
              id: 30,
              kind: "agent",
              day: "Сегодня",
              time: "11:05",
              text: "",
              stream: { phase: "text", text: AGENT_TEXT.slice(0, 96) },
            },
          ]}
        />
      ),
    },
  ],
  choreography: [
    {
      id: "send",
      title: "Отправка сообщения",
      trigger: "Enter или «Отправить»",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Рамка поля ввода переходит на цвет фокуса; кнопка «Отправить» оживает, как только в поле есть текст.",
          prop: "box-shadow, background",
          easing: "ease",
        },
        {
          at: 1500,
          dur: 0,
          what: "Enter: поле очищается, высота возвращается к 44 px, превью ответа и файла уходят.",
        },
        {
          at: 1500,
          dur: 200,
          what: "Сообщение появляется внизу ленты: прозрачность 0→1, сдвиг 6 px; лента плавно прокручивается вниз. В макете оно возникает сразу. Статус «Отправляется…» около 800 мс.",
          prop: "opacity, translate, scrollTop",
          easing: "--ease",
        },
        {
          at: 1900,
          dur: 0,
          what: "Через 500 мс над полем «Алексей Крылов печатает…»: три точки прыгают по очереди (1,2 с цикл, сдвиг 3 px, смещение 0,15 с).",
        },
        {
          at: 3600,
          dur: 200,
          what: "Через 2,4 с приходит ответ: строка «печатает…» исчезает, сообщение появляется как предыдущее.",
          prop: "opacity, translate",
          easing: "--ease",
        },
      ],
      focus:
        "Фокус остаётся в поле ввода: отправка не отбирает его. Новые сообщения объявляются через aria-live=polite у ленты.",
      reducedMotion:
        "Сообщения появляются без сдвига, прокрутка мгновенная, точки печати двигаются в 2,5 раза медленнее (3 с вместо 1,2 с).",
      neighbours:
        "Лента прокручивается к низу, только если пользователь уже внизу (в 40 px); иначе новое сообщение не двигает чтение. Остальные сообщения не сдвигаются.",
      demo: <SendDemo />,
    },
    {
      id: "reply",
      title: "Ответ с цитатой",
      trigger: "«Ответить» на сообщении, клик по цитате",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Над сообщением по наведению проявляется панель действий (прозрачность 0→1).",
          prop: "opacity",
          easing: "ease",
        },
        {
          at: 600,
          dur: 125,
          what: "«Ответить»: над полем встаёт превью «Ответ: Алексей Крылов» (прозрачность, сдвиг 4 px), поле получает фокус. В макете превью появляется сразу.",
          prop: "opacity, translate",
          easing: "--ease",
        },
        {
          at: 1900,
          dur: 200,
          what: "Отправка: превью уходит, у нового сообщения над текстом цитата (имя и 90 символов исходного).",
          prop: "opacity, translate",
          easing: "--ease",
        },
        {
          at: 2600,
          dur: 125,
          what: "Наведение на цитату: слой 9 %.",
          prop: "background",
          easing: "ease",
        },
        {
          at: 3100,
          dur: 0,
          what: "Клик по цитате: лента плавно докручивается так, чтобы исходное стояло по центру (scrollIntoView, block: center).",
        },
        {
          at: 3100,
          dur: 1400,
          what: "Исходное сообщение мигает teal 22 %, фон остаётся 60 % времени и затухает.",
          prop: "background",
          easing: "ease",
        },
      ],
      focus:
        "«Ответить» переводит фокус в поле ввода. Клик по цитате фокус не переносит; цитата — кнопка, Enter делает то же самое.",
      reducedMotion:
        "Прокрутка к исходному мгновенная, подсветка остаётся на 1,4 с без затухания [TODO] проверить в макете: там анимация не отключается.",
      neighbours:
        "Лента прокручивается, остальные сообщения не двигаются. Если исходное удалено, цитата показывает «Сообщение — удалено» и не нажимается [TODO] поведение в макете не описано.",
      demo: <ReplyDemo />,
    },
    {
      id: "mention",
      title: "Список упоминаний по «@»",
      trigger: "набор «@» в поле ввода",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Список людей всплывает над полем: прозрачность 0→1, масштаб .96→1, сдвиг 4 px снизу. Первый пункт выбран.",
          prop: "opacity, scale, translate",
          easing: "--ease",
        },
        {
          at: 500,
          dur: 0,
          what: "Каждая новая буква сужает список по подстроке имени; пункты заменяются мгновенно. Нет совпадений: список закрывается.",
        },
        {
          at: 1500,
          dur: 0,
          what: "Enter или Tab: «@Ал» заменяется на «@Алексей Крылов », список закрывается мгновенно, фокус остаётся в поле, курсор после пробела.",
        },
      ],
      focus:
        "Фокус всё время в поле ввода: список не забирает его. Выбранный пункт указывается через aria-activedescendant. Стрелки ↑↓ меняют пункт [TODO] в макете всегда выбирается первый; Esc закрывает список.",
      reducedMotion: "Список появляется без масштаба и сдвига.",
      neighbours: "Список лежит поверх ленты и не двигает её; поле ввода не меняет высоту.",
      demo: <MentionDemo />,
    },
    {
      id: "delete",
      title: "Удаление и «Отменить»",
      trigger: "Ещё → Удалить",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Над сообщением проявляется панель действий; «Ещё» открывает меню: Копировать текст, Изменить, Удалить (только у своих).",
          prop: "opacity, scale, translate",
          easing: "--ease",
        },
        {
          at: 1400,
          dur: 200,
          what: "«Удалить»: сообщение гаснет (прозрачность 0, масштаб .98), затем убирается из ленты. В макете удаляется мгновенно.",
          prop: "opacity, scale",
          easing: "--ease",
        },
        {
          at: 1600,
          dur: 300,
          what: "Снизу выезжает тост «Сообщение удалено» с кнопкой «Отменить»: прозрачность 0→1, сдвиг 24 px; живёт 5 с.",
          prop: "opacity, translate",
          easing: "--ease",
        },
        {
          at: 3200,
          dur: 0,
          what: "«Отменить»: сообщение возвращается на то же место (индекс сохранён), тост закрывается.",
        },
      ],
      focus:
        "После удаления фокус переходит на следующее сообщение, а если его нет — в поле ввода. Тост получает role=status, кнопка «Отменить» — в порядке Tab сразу за полем.",
      reducedMotion: "Сообщение исчезает и возвращается без анимации; тост появляется на месте.",
      neighbours:
        "Сообщения ниже сдвигаются вверх. После «Отменить» — вниз. Склейка серии пересчитывается: после удаления среднего сообщения соседние могут склеиться.",
      demo: <DeleteDemo />,
    },
    {
      id: "stream",
      title: "Ответ агента потоком",
      trigger: "агент получил вопрос",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 200,
          what: "Сообщение агента появляется в ленте: логотип, «Агент», метка «ИИ». Внутри мерцает «Анализирую грузы…» (1,4 с, прозрачность 1 → .4).",
          prop: "opacity, translate",
          easing: "--ease",
        },
        {
          at: 1100,
          dur: 0,
          what: "«Анализирую…» заменяется строкой «Проверил 128 грузов · 3 источника» (галочка --link).",
        },
        {
          at: 1100,
          dur: 0,
          what: "Текст идёт кусками по два слова каждые 32 мс (в словаре замедлено до трёх слов за 110 мс, чтобы читалось); в конце текста мигает блок 7 × 14 px (1 с, ступенчато).",
        },
        {
          at: 2800,
          dur: 200,
          what: "Конец потока: курсор исчезает, внизу появляются кнопки: копировать, хороший ответ, плохой ответ, заново.",
          prop: "opacity, translate",
          easing: "--ease",
        },
      ],
      focus:
        "Фокус остаётся в поле ввода. Во время потока aria-live не читает каждое слово: объявляется начало («Агент отвечает») и конец, полный текст доступен в ленте.",
      reducedMotion:
        "Мерцание и мигание курсора останавливаются (курсор виден непрерывно), текст появляется кусками, но без мерцания «Анализирую…».",
      neighbours:
        "Лента докручивается вниз по мере роста текста, пока пользователь не прокрутил её вверх. Остальные сообщения не двигаются.",
      demo: <StreamDemo />,
    },
    {
      id: "reaction",
      title: "Реакция",
      trigger: "клик по чипу реакции или по «Реакция»",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Hover: слой 4 % на чипе; active — 7 %.",
          prop: "background",
          easing: "ease",
        },
        {
          at: 700,
          dur: 125,
          what: "Своя реакция снята: подложка teal исчезает, рамка становится обычной, счётчик уменьшается на 1. Чип без счёта исчезает.",
          prop: "background, box-shadow, color",
          easing: "ease",
        },
        {
          at: 1800,
          dur: 125,
          what: "Поставлена снова: подложка и рамка --selected, счётчик растёт.",
          prop: "background, box-shadow, color",
          easing: "ease",
        },
      ],
      focus:
        "Фокус остаётся на нажатом чипе. Если чип исчез (счётчик 0), фокус переходит на «добавить реакцию».",
      reducedMotion: "Смена цвета без перехода.",
      neighbours:
        "Чипы в ряду сдвигаются без анимации при добавлении и удалении; перенос на следующую строку возможен. В макете чип перерисовывается вместе с лентой.",
      demo: <ReactionDemo />,
    },
    {
      id: "retry",
      title: "Ошибка отправки",
      trigger: "сеть упала при отправке",
      origin: "proposal",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Сообщение в ленте со статусом «Отправляется…», текст приглушён до 60 %.",
        },
        {
          at: 1200,
          dur: 125,
          what: "Тайм-аут: статус меняется на «Не отправлено» цветом --err-text с двумя ссылками; текст остаётся приглушённым. Объявляется через role=alert.",
          prop: "color, opacity",
          easing: "ease",
        },
        {
          at: 2600,
          dur: 0,
          what: "«Повторить»: статус снова «Отправляется…», сообщение остаётся на месте.",
        },
        {
          at: 3500,
          dur: 125,
          what: "Успех: статус и приглушение исчезают.",
          prop: "opacity",
          easing: "ease",
        },
      ],
      focus: "Фокус на ссылке «Повторить» остаётся до смены статуса, затем уходит в поле ввода.",
      reducedMotion: "Все смены статуса мгновенные.",
      neighbours:
        "Лента не двигается: строка статуса занимает ту же высоту. [TODO] как сортировать неотправленные при потере связи.",
      demo: <RetryDemo />,
    },
  ],
  rules: {
    use: [
      "Без пузырей: чат живёт в одной колонке, аватар слева, имя и время сверху.",
      "Склеивать сообщения одного автора в пределах 5 минут; время показывать по наведению.",
      "День отделять линией «Сегодня» / «Вчера».",
      "Системные события — отдельной серой строкой, не от лица человека.",
      "Удаление — только с «Отменить» в тосте, а не с подтверждающим диалогом.",
      "Ответ всегда с цитатой и кликабельным переходом к исходному.",
      "Номера грузов, декларации и суммы в чате — обычным шрифтом, цифры tabular-nums.",
    ],
    avoid: [
      "Пузыри и разные цвета «моих» и «чужих»: автора показывает аватар и имя.",
      "Моноширинный шрифт для номеров груза и ID в тексте сообщений.",
      "Левые акцентные линии у цитаты и системных строк: цитата — плашка с рамкой.",
      "Градиенты и тени у аватаров и сообщений: аватары плоские.",
      "Подтверждающий диалог при удалении своего сообщения.",
      "Прокручивать ленту вниз, если пользователь читает выше.",
      "Озвучивать скринридеру каждое слово потока агента.",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: 'role="log" + aria-live',
      text: 'Лента — role="log" с aria-live="polite" и aria-relevant="additions": новые сообщения объявляются, прокрутка и правки — нет. Лента фокусируется (tabindex=0), чтобы её можно было прокрутить с клавиатуры.',
    },
    {
      kind: "focus",
      title: "Фокус в поле ввода",
      text: "После отправки, ответа, правки и удаления фокус остаётся (или возвращается) в поле ввода. «Ответить» и «Изменить» переносят фокус в поле. Закрытие меню возвращает фокус на «Ещё».",
    },
    {
      kind: "key",
      title: "Enter / Shift+Enter",
      text: "Enter отправляет, Shift+Enter переносит строку, Esc отменяет ответ, правку и закрывает меню. Ctrl+Enter не нужен.",
    },
    {
      kind: "key",
      title: "@ и список",
      text: "Поле — role=combobox с aria-expanded, aria-controls, aria-activedescendant; список — role=listbox, пункты role=option с aria-selected. ↑↓ выбирают, Enter или Tab вставляют, Esc закрывает. [TODO] ↑↓ в макете нет.",
    },
    {
      kind: "aria",
      title: "Действия над сообщением",
      text: "Панель — role=toolbar «Действия с сообщением», кнопки с aria-label. Они всегда в порядке Tab и проявляются по focus-within. [TODO] Три стопа на каждое сообщение шумно: предложение — roving tabindex по сообщениям и Enter, открывающий панель.",
    },
    {
      kind: "aria",
      title: "Реакции и цитата",
      text: "Чип реакции: aria-pressed и aria-label «👍: Мария Новикова, Ирина Петрова». Цитата — кнопка «Перейти к сообщению: Алексей Крылов».",
    },
    {
      kind: "aria",
      title: "Ошибка отправки",
      text: 'Строка «Не отправлено» — role="alert", ссылки «Повторить» и «Удалить» — кнопки. Тост удаления — role="status".',
    },
    {
      kind: "contrast",
      title: "Контраст",
      text: "Текст --text на --surface 16,5:1; время и «изменено» --text-3 4,9:1, но время 10–11 px: [TODO] проверить против порога мелкого текста. Плашка @ --link-strong на --selected около 5,8:1. Текст ошибки --err-text на белом 5,5:1.",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Появление сообщений, меню и тоста без анимации; прокрутка мгновенная; подсветка цитаты без затухания; точки «печатает…» и мерцания замедлены до 3 с, курсор агента не мигает.",
    },
  ],
  tokens: [
    {
      name: "message",
      value: "32 px аватар · gap 10 · padding 6 8",
      usage: "Аватар md, строка сообщения, --r-card 10px на hover",
      kind: "size",
    },
    { name: "--layer-1", value: "ink 4 %", usage: "Hover строки сообщения и чипов", kind: "color" },
    {
      name: "--selected / --link-strong",
      value: "teal 15 % · #006662",
      usage: "Плашка @ и своя реакция",
      kind: "color",
    },
    {
      name: "--surface-muted / --divider",
      value: "#eceef2 / #e0e4e9",
      usage: "Плашка цитаты и её рамка",
      kind: "color",
    },
    {
      name: "body text",
      value: "13.5 px / 1.5",
      usage: "Текст сообщения; имя 700, время 11 px",
      kind: "font",
    },
    {
      name: "reaction chip",
      value: "22 px · --r-pill",
      usage: "Чип реакции со счётчиком",
      kind: "size",
    },
    {
      name: "--shadow-pop / --r-item",
      value: "0 6px 20px … / 8px",
      usage: "Панель действий над сообщением",
      kind: "shadow",
    },
    {
      name: "composer",
      value: "--r-popover 12px · 44–140 px",
      usage: "Поле ввода: рамка --border, фокус --focus + 3 px --selected",
      kind: "radius",
    },
    {
      name: "--teal 22 %",
      value: "color-mix",
      usage: "Подсветка исходного сообщения после клика по цитате (1,4 с)",
      kind: "color",
    },
    {
      name: "--danger / --err-text",
      value: "#d03538 / #c92a2a",
      usage: "Ошибка отправки, рамка поля (предложение)",
      kind: "color",
    },
    {
      name: "--dur-f / --dur / --dur-s",
      value: "125 / 200 / 300 мс",
      usage: "Hover · сообщение · тост; --ease cubic-bezier(.6,0,.05,.95)",
      kind: "time",
    },
    {
      name: "cursor",
      value: "7 × 14 px · 1 с steps(2)",
      usage: "Курсор агента в конце потока",
      kind: "other",
    },
  ],
  examples: [
    {
      id: "comments",
      title: "Комментарии к грузу",
      demo: <LiveThread height={520} />,
      code: `<Thread
  messages={messages}
  me={currentUser.name}
  people={participants}
  onSend={send}
  onReact={react}
  onDelete={remove}
  onRestore={restore}
/>`,
    },
    {
      id: "agent",
      title: "Ответ агента потоком",
      demo: <StreamDemo />,
      code: `<Thread messages={[...messages, { id: "a1", kind: "agent", day: "Сегодня", time: "11:05", text: "", stream: { phase: "text", text: partial } }]} me={currentUser.name} />`,
    },
  ],
});
