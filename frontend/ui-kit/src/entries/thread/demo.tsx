/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useRef, useState } from "react";
import { Thread, ThreadComposer, ThreadTyping, toggleReaction } from "./index";
import type {
  ThreadFile,
  ThreadMenu,
  ThreadMessage,
  ThreadMessageId,
  ThreadPartData,
  ThreadPerson,
} from "./index";
import "./thread.force.css";

export type Msg = ThreadMessage;

export const ME = "Ирина Петрова";
export const PEOPLE: [string, string][] = [
  ["Ирина Петрова", "Оформление"],
  ["Алексей Крылов", "Брокер"],
  ["Мария Новикова", "Оформление"],
  ["Денис Попов", "Руководитель"],
];
const PEOPLE_LIST: ThreadPerson[] = PEOPLE.map(([name, role]) => ({ name, role }));
export const EMOJIS = ["👍", "✅", "👀", "❗", "🙏", "🎉"];

export const SEED: Msg[] = [
  {
    id: 1,
    kind: "system",
    day: "Вчера",
    time: "17:05",
    text: "Агент нашёл расхождение по весу: <b>180 кг</b>",
  },
  {
    id: 2,
    author: "Алексей Крылов",
    day: "Вчера",
    time: "17:20",
    text: "Брокер прислал декларацию: вес 18 240, в накладной 18 420. Разница 180 кг.",
    file: { name: "Декларация_4821907.pdf", size: "PDF · 214 КБ" },
  },
  {
    id: 3,
    author: "Мария Новикова",
    day: "Вчера",
    time: "17:31",
    text: "@Алексей Крылов проверьте, это не вес тары?",
    reactions: { "👀": ["Ирина Петрова"] },
  },
  {
    id: 4,
    author: "Алексей Крылов",
    day: "Вчера",
    time: "17:34",
    text: "Нет, тара 12 кг. Похоже на опечатку.",
    replyTo: 3,
    reactions: { "👍": ["Мария Новикова", "Ирина Петрова"] },
  },
  {
    id: 5,
    kind: "system",
    day: "Сегодня",
    time: "09:12",
    text: "<b>Ирина Петрова</b> изменила приоритет на «Высокий»",
  },
  {
    id: 6,
    author: "Ирина Петрова",
    day: "Сегодня",
    time: "10:44",
    text: "Позвонила брокеру, подтвердил опечатку. Пришлёт новую версию до 14:00.",
  },
  {
    id: 7,
    author: "Ирина Петрова",
    day: "Сегодня",
    time: "10:45",
    text: "Пока оставляю расхождение открытым.",
  },
  {
    id: 8,
    author: "Алексей Крылов",
    day: "Сегодня",
    time: "11:02",
    text: "Принято, жду. Как придёт — сразу загружу.",
    reactions: { "🙏": ["Ирина Петрова"] },
  },
];

export const AGENT_TEXT =
  "Нашёл расхождение по весу в MSKU4821907: в накладной 18 420 кг, в декларации 18 240 кг, разница 180 кг. Тара 12 кг, поэтому это похоже на опечатку в декларации. Предлагаю запросить исправленную версию у брокера.";

const withAgentLabels = (list: Msg[]): Msg[] =>
  list.map((m) =>
    m.stream
      ? {
          ...m,
          stream: {
            ...m.stream,
            thinking: "Анализирую грузы…",
            summary: "Проверил 128 грузов · 3 источника",
          },
        }
      : m,
  );

export interface ComposerState {
  text: string;
  reply?: Msg | null;
  file?: ThreadFile | null;
  editing?: Msg | null;
  force?: "hover" | "focus";
  invalid?: boolean;
  disabled?: boolean;
  error?: string;
  sendForce?: "hover" | "focus";
  mention?: { query: string; hi: number } | null;
  busy?: boolean;
}

type MenuState = ThreadMenu;
type Force3 = "hover" | "active" | "focus";

export function ThreadView({
  messages,
  composer,
  typing,
  state = "ready",
  height,
  hoverId,
  menu,
  flashId,
  enterId,
  leaveId,
  rxForce,
  quoteForce,
  replyForce,
  toast,
  noComposer,
  bare,
  label = "Обсуждение груза MSKU4821907",
}: {
  messages: Msg[];
  composer?: ComposerState;
  typing?: string | null;
  state?: "ready" | "loading" | "empty" | "error";
  height?: number;
  hoverId?: number | null;
  menu?: MenuState;
  flashId?: number | null;
  enterId?: number | null;
  leaveId?: number | null;
  rxForce?: { id: number; emoji: string; force: Force3 };
  quoteForce?: { id: number; force: "hover" | "focus" };
  replyForce?: { id: number; force: Force3 };
  toast?: { text: string; action?: string; actionForce?: "hover" | "focus" } | null;
  noComposer?: boolean;
  bare?: boolean;
  label?: string;
}) {
  const c: ComposerState = composer ?? { text: "" };
  const partData: ThreadPartData = (part, { message, emoji }) => {
    if (part === "message") return { "data-force": hoverId === message?.id ? "hover" : undefined };
    if (part === "quote")
      return { "data-force": quoteForce?.id === message?.id ? quoteForce?.force : undefined };
    if (part === "reaction")
      return {
        "data-force":
          rxForce?.id === message?.id && rxForce?.emoji === emoji ? rxForce?.force : undefined,
      };
    if (part === "reply")
      return { "data-force": replyForce?.id === message?.id ? replyForce?.force : undefined };
    if (part === "box") return { "data-force": c.force };
    if (part === "send") return { "data-force": c.sendForce };
    return { "data-force": toast?.actionForce };
  };
  return (
    <Thread
      messages={withAgentLabels(messages)}
      me={ME}
      people={PEOPLE_LIST}
      label={label}
      state={state}
      height={height}
      bare={bare}
      typing={typing}
      emptyText="Напишите первым или спросите агента про этот груз"
      showComposer={!noComposer}
      composerDisabled={c.disabled}
      composerInvalid={c.invalid}
      composerBusy={c.busy}
      composerError={c.error}
      draft={{
        text: c.text,
        replyTo: c.reply?.id ?? null,
        editing: c.editing?.id ?? null,
        file: c.file ?? null,
      }}
      menu={menu ?? null}
      flashId={flashId ?? null}
      enteringId={enterId ?? null}
      leavingId={leaveId ?? null}
      toast={toast ? { text: toast.text, action: toast.action } : null}
      partData={partData}
      inline
    />
  );
}

const NO_MSGS: Msg[] = [];

export function DemoMsg({
  ids,
  extra = NO_MSGS,
  ...rest
}: {
  ids: number[];
  extra?: Msg[];
  hoverId?: number | null;
  menu?: MenuState;
  flashId?: number | null;
  rxForce?: { id: number; emoji: string; force: Force3 };
  quoteForce?: { id: number; force: "hover" | "focus" };
  replyForce?: { id: number; force: Force3 };
}) {
  const list = [...SEED.filter((m) => ids.includes(m.id as number)), ...extra];
  const withQuote = list.some((m) => m.replyTo !== undefined)
    ? [SEED[2], ...list.filter((m) => m.id !== 3)]
    : list;
  return (
    <div style={{ width: "100%", maxWidth: 440, textAlign: "left" }}>
      <ThreadView messages={withQuote} bare noComposer {...rest} />
    </div>
  );
}

export function DemoComposer(props: ComposerState & { typing?: string }) {
  const { typing, ...c } = props;
  return (
    <div style={{ width: "100%", maxWidth: 440 }}>
      <section className="ds-thread ds-thread--bare" aria-label="Обсуждение груза MSKU4821907">
        <div className="ds-thread__scroll" role="log" aria-live="polite" />
        {typing ? <ThreadTyping name={typing} /> : null}
        <ThreadComposer
          value={c.text}
          onValueChange={() => undefined}
          people={PEOPLE_LIST}
          replyTo={c.reply}
          editing={c.editing}
          file={c.file}
          disabled={c.disabled}
          invalid={c.invalid}
          busy={c.busy}
          error={c.error}
          inline
          boxData={{ "data-force": c.force }}
          sendData={{ "data-force": c.sendForce }}
        />
      </section>
    </div>
  );
}

const later = (fn: () => void, ms: number) => window.setTimeout(fn, ms);

const REPLIES = ["Спасибо, принял.", "Понял, проверю и вернусь.", "Хорошо, сделаю до обеда."];

const clock = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export function LiveThread({ height = 500 }: { height?: number }) {
  const [msgs, setMsgs] = useState<Msg[]>(SEED);
  const [typing, setTyping] = useState<string | null>(null);
  const next = useRef(100);
  const submit = ({
    text,
    replyTo,
    editing,
    file,
  }: {
    text: string;
    replyTo?: ThreadMessageId;
    editing?: ThreadMessageId;
    file?: ThreadFile;
  }) => {
    if (editing !== undefined) {
      setMsgs((l) => l.map((m) => (m.id === editing ? { ...m, text, edited: true } : m)));
      return;
    }
    const id = ++next.current;
    setMsgs((l) => [
      ...l,
      { id, author: ME, day: "Сегодня", time: clock(), text, replyTo, file, status: "sending" },
    ]);
    later(() => setMsgs((l) => l.map((m) => (m.id === id ? { ...m, status: undefined } : m))), 800);
    later(() => setTyping("Алексей Крылов"), 500);
    later(() => {
      setTyping(null);
      const reply = ++next.current;
      setMsgs((l) => [
        ...l,
        {
          id: reply,
          author: "Алексей Крылов",
          day: "Сегодня",
          time: clock(),
          text: REPLIES[reply % 3],
        },
      ]);
    }, 2400);
  };
  return (
    <Thread
      messages={msgs}
      me={ME}
      people={PEOPLE_LIST}
      height={height}
      label="Обсуждение груза MSKU4821907"
      typing={typing}
      onSend={submit}
      onAttach={() => ({ name: "Накладная_исправленная.pdf", size: "PDF · 188 КБ" })}
      onReact={(m, emoji) =>
        setMsgs((l) =>
          l.map((x) =>
            x.id === m.id ? { ...x, reactions: toggleReaction(x.reactions, emoji, ME) } : x,
          ),
        )
      }
      onDelete={(m) => setMsgs((l) => l.filter((x) => x.id !== m.id))}
      onRestore={(m, index) => setMsgs((l) => [...l.slice(0, index), m, ...l.slice(index)])}
    />
  );
}
