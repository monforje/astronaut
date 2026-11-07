/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { Icon, type IconName } from "@/engine/Icon";
import { DemoBadge } from "../badge/demo";
import { Btn, type Force } from "../dialog/demo";
import { AgentPanel, type AgentMessage, type AgentPanelSize } from "./index";
import "./agent-panel.force.css";

export type PanelSize = AgentPanelSize;
export type Phase = "thinking" | "streaming" | "done" | "stopped" | "error";

export interface Msg {
  id: number;
  q: string;
  phase: Phase;
  words: number;
  open?: boolean;
  fb?: "up" | "down";
}

const SUGG: [IconName, string, string][] = [
  ["warn", "Какие грузы с расхождениями?", "Найдёт и покажет разницу"],
  ["link", "Сверить документы Дальснаба", "Накладная, декларация, инвойс"],
  ["doc", "Что ждёт документов дольше 3 дней?", "Список с датами"],
  ["dl", "Выгрузить отчёт за неделю", "Excel с итогами по клиентам"],
];
const CHATS: [string, string][] = [
  ["Сегодня", "Расхождения по весу"],
  ["Сегодня", "Сверка Дальснаба"],
  ["Вчера", "Грузы без накладных"],
  ["Вчера", "Новый клиент: Лозовой"],
  ["На прошлой неделе", "Отчёт за октябрь"],
];

export function replyFor(q: string): { p: string[]; card?: boolean } {
  if (/расхожд/i.test(q))
    return {
      p: [
        "Нашёл **8 грузов** с расхождениями. Самое заметное — **MSKU4821907**: вес в декларации меньше веса по накладной на **180 кг**.",
        "Ещё у трёх грузов расходится код ТН ВЭД между инвойсом и декларацией.",
      ],
      card: true,
    };
  if (/сверить|сверк/i.test(q))
    return {
      p: [
        "Сверил документы клиента «Дальснаб»: **12 грузов**, расхождений нет.",
        "Хотите, отправлю отчёт на почту?",
      ],
    };
  if (/ждёт|ждут|дн/i.test(q))
    return {
      p: [
        "Дольше трёх дней документов ждут **5 грузов**. Чаще всего не хватает накладной из ЭДО — могу напомнить клиентам.",
      ],
    };
  return {
    p: ["Могу найти расхождения, сверить документы по клиенту или выгрузить отчёт. Что нужно?"],
  };
}

function tokens(p: string[]): [string, number][] {
  const t: [string, number][] = [];
  p.forEach((s, i) => s.split(" ").forEach((w) => t.push([w, i])));
  return t;
}
export const wordCount = (q: string) => tokens(replyFor(q).p).length;

const rich = (w: string) => (w.startsWith("**") ? <b key={w}>{w.replaceAll("**", "")}</b> : w);

function ReplyText({ q, words }: { q: string; words: number }) {
  const R = replyFor(q);
  const t = tokens(R.p).slice(0, words);
  const groups: string[][] = [];
  t.forEach(([w, i]) => (groups[i] = [...(groups[i] ?? []), w]));
  return (
    <>
      {groups.map((g, i) =>
        g ? (
          <p key={g.join(" ").slice(0, 24) + i}>
            {g.map((w, k) => (
              <Fragment key={`${w}-${k}`}>
                {k ? " " : ""}
                {rich(w)}
              </Fragment>
            ))}
          </p>
        ) : null,
      )}
    </>
  );
}

const SUMMARY = "Проверил 128 грузов · 3 источника";
const STEPS = [
  "Загрузил накладные из ЭДО",
  "Сопоставил с декларациями из ПО таможни",
  "Сравнил вес, ТН ВЭД и номера",
];

function toMessage(m: Msg): AgentMessage {
  const reply = replyFor(m.q);
  return {
    id: m.id,
    question: m.q,
    phase: m.phase,
    thinkingText: "Анализирую грузы…",
    summary: SUMMARY,
    steps: STEPS,
    stepsOpen: m.open,
    feedback: m.fb,
    answer: <ReplyText q={m.q} words={m.phase === "thinking" ? 0 : m.words} />,
    attachment: reply.card ? (
      <div className="ds-agent-panel__card">
        <div className="ds-agent-panel__card-row">
          <b>MSKU4821907</b>
          <DemoBadge tone="err">Расхождение</DemoBadge>
        </div>
        <span className="ds-agent-panel__muted">Накладная 18 420 кг · декларация 18 240 кг</span>
        <div className="ds-agent-panel__card-btns">
          <Btn variant="primary" size="sm">
            Исправить в 1С
          </Btn>
          <Btn size="sm">Открыть груз</Btn>
        </div>
      </div>
    ) : undefined,
  };
}

function forced(force?: Force): object | undefined {
  return force ? { "data-force": force } : undefined;
}

export function AgentPanelView({
  size = "panel",
  msgs,
  text = "",
  busy,
  follow,
  sugForce,
  composerForce,
  sendForce,
  onText,
  onSend,
  onStop,
  onAsk,
  onToggle,
  onFb,
  onRegen,
  onNew,
}: {
  size?: PanelSize;
  msgs: Msg[];
  text?: string;
  busy?: boolean;
  follow?: boolean;
  sugForce?: Force;
  composerForce?: Force;
  sendForce?: Force;
  onText?: (v: string) => void;
  onSend?: () => void;
  onStop?: () => void;
  onAsk?: (q: string) => void;
  onToggle?: (id: number) => void;
  onFb?: (id: number, k: "up" | "down") => void;
  onRegen?: (id: number) => void;
  onNew?: () => void;
}) {
  return (
    <AgentPanel
      size={size}
      messages={msgs.map(toMessage)}
      value={text}
      busy={busy}
      follow={follow}
      mode="Быстрый"
      greeting="Чем помочь, Ирина?"
      intro="Спросите про грузы, документы и расхождения."
      disclaimer="Агент может ошибаться. Проверяйте важные данные. Изменения — только после вашего подтверждения."
      chips={["Сверка", "Поиск по документам"]}
      suggestions={SUGG.map(([ic, title, hint]) => ({
        title,
        hint,
        icon: <Icon name={ic} />,
      }))}
      chats={CHATS.map(([group, title], i) => ({
        id: title,
        title,
        group,
        current: group === "Сегодня" && i === 0 && msgs.length > 0,
      }))}
      onValueChange={onText}
      onSend={() => onSend?.()}
      onStop={onStop}
      onAsk={onAsk}
      onSelectChat={(id) => onAsk?.(String(id))}
      onToggleSteps={(id) => onToggle?.(Number(id))}
      onFeedback={(id, k) => onFb?.(Number(id), k)}
      onRegenerate={(id) => onRegen?.(Number(id))}
      onNewChat={onNew}
      onEdit={(_, q) => onText?.(q)}
      slotProps={{
        composer: forced(composerForce),
        sendButton: forced(sendForce),
        suggestion: (i) => (i === 0 ? forced(sugForce) : undefined),
      }}
    />
  );
}

export function PanelFrame({
  size = "panel",
  children,
  h,
}: {
  size?: PanelSize;
  children: ReactNode;
  h?: number | "auto";
}) {
  return (
    <div className="ds-agent-panel-frame" data-size={size} style={h ? { height: h } : undefined}>
      {children}
    </div>
  );
}

export const DEMO_Q = "Какие грузы с расхождениями?";

export function AgentPanelLive({
  size = "panel",
  initial,
  h,
}: {
  size?: PanelSize;
  initial?: Msg[];
  h?: number | "auto";
}) {
  const [msgs, setMsgs] = useState<Msg[]>(initial ?? []);
  const [text, setText] = useState("");
  const timers = useRef<number[]>([]);
  const seq = useRef((initial?.length ?? 0) + 1);
  const busy = msgs.some((m) => m.phase === "thinking" || m.phase === "streaming");

  const stop = () => {
    timers.current.forEach((t) => {
      window.clearTimeout(t);
      window.clearInterval(t);
    });
    timers.current = [];
  };
  // oxlint-disable-next-line react/exhaustive-effect-dependencies -- stop не зависит от состояния: чистит таймеры в ref
  useEffect(() => stop, []);

  const run = (id: number, q: string) => {
    const total = wordCount(q);
    timers.current.push(
      window.setTimeout(() => {
        setMsgs((l) => l.map((m) => (m.id === id ? { ...m, phase: "streaming" } : m)));
        let n = 0;
        const iv = window.setInterval(() => {
          n += 2;
          const done = n >= total;
          setMsgs((l) =>
            l.map((m) =>
              m.id === id
                ? { ...m, words: Math.min(n, total), phase: done ? "done" : "streaming" }
                : m,
            ),
          );
          if (done) window.clearInterval(iv);
        }, 32);
        timers.current.push(iv);
      }, 900),
    );
  };

  const ask = (q: string) => {
    if (!q.trim() || busy) return;
    const id = seq.current++;
    setMsgs((l) => [...l, { id, q, phase: "thinking", words: 0 }]);
    setText("");
    run(id, q);
  };

  return (
    <PanelFrame size={size} h={h}>
      <AgentPanelView
        size={size}
        msgs={msgs}
        text={text}
        busy={busy}
        follow
        onText={setText}
        onSend={() => ask(text)}
        onAsk={ask}
        onStop={() => {
          stop();
          setMsgs((l) =>
            l.map((m) =>
              m.phase === "thinking" || m.phase === "streaming" ? { ...m, phase: "stopped" } : m,
            ),
          );
        }}
        onToggle={(id) => setMsgs((l) => l.map((m) => (m.id === id ? { ...m, open: !m.open } : m)))}
        onFb={(id, k) =>
          setMsgs((l) => l.map((m) => (m.id === id ? { ...m, fb: m.fb === k ? undefined : k } : m)))
        }
        onRegen={(id) => {
          const q = msgs.find((m) => m.id === id)?.q;
          if (!q || busy) return;
          setMsgs((l) => l.map((m) => (m.id === id ? { ...m, phase: "thinking", words: 0 } : m)));
          run(id, q);
        }}
        onNew={() => {
          stop();
          setMsgs([]);
        }}
      />
    </PanelFrame>
  );
}
