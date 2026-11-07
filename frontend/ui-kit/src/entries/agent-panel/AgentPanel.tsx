/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Fragment, useEffect, useRef, type ComponentPropsWithRef, type ReactNode } from "react";
import { cx, Icon, useControlled } from "../../ui/internal";
import { Alert } from "../alert/Alert";
import { Avatar } from "../avatar/Avatar";
import { Button } from "../button/Button";
import { Toggle } from "../toggle";
import "./agent-panel.css";

export type AgentPanelSize = "panel" | "wide" | "full";
export type AgentPhase = "thinking" | "streaming" | "done" | "stopped" | "error";
export type AgentFeedback = "up" | "down";

export interface AgentMessage {
  id: string | number;
  question: string;
  phase: AgentPhase;
  answer?: ReactNode;
  summary?: ReactNode;
  steps?: ReactNode[];
  stepsOpen?: boolean;
  attachment?: ReactNode;
  feedback?: AgentFeedback;
  thinkingText?: ReactNode;
}

export interface AgentSuggestion {
  title: string;
  hint?: string;
  icon?: ReactNode;
}

export interface AgentChat {
  id: string | number;
  title: string;
  group?: string;
  current?: boolean;
}

export interface AgentPanelSlotProps {
  composer?: ComponentPropsWithRef<"div">;
  sendButton?: ComponentPropsWithRef<"button">;
  copyReplyButton?: ComponentPropsWithRef<"button">;
  suggestion?: (index: number) => ComponentPropsWithRef<"button"> | undefined;
}

export interface AgentPanelProps extends Omit<
  ComponentPropsWithRef<"section">,
  "title" | "onSelect" | "defaultValue" | "onCopy" | "onResize"
> {
  size?: AgentPanelSize;
  messages: AgentMessage[];
  suggestions?: AgentSuggestion[];
  chats?: AgentChat[];
  chips?: string[];
  modeLabel?: string;
  mode?: string;
  greeting?: ReactNode;
  intro?: ReactNode;
  disclaimer?: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onSend?: (text: string) => void;
  onStop?: () => void;
  onAsk?: (text: string) => void;
  onSelectChat?: (id: AgentChat["id"]) => void;
  onNewChat?: () => void;
  onClose?: () => void;
  onResize?: () => void;
  onToggleSteps?: (id: AgentMessage["id"]) => void;
  onFeedback?: (id: AgentMessage["id"], feedback: AgentFeedback) => void;
  onRegenerate?: (id: AgentMessage["id"]) => void;
  onCopy?: (id: AgentMessage["id"]) => void;
  onEdit?: (id: AgentMessage["id"], question: string) => void;
  onAttach?: () => void;
  busy?: boolean;
  follow?: boolean;
  slotProps?: AgentPanelSlotProps;
}

const NO_SUGGESTIONS: AgentSuggestion[] = [];
const NO_CHATS: AgentChat[] = [];
const NO_CHIPS: string[] = [];
const RESIZE_ICON = { panel: "wide", wide: "expand", full: "shrink" } as const;

function isBusy(messages: AgentMessage[]): boolean {
  return messages.some((m) => m.phase === "thinking" || m.phase === "streaming");
}

interface ReplyProps {
  message: AgentMessage;
  onToggleSteps?: () => void;
  onFeedback?: (feedback: AgentFeedback) => void;
  onRegenerate?: () => void;
  onCopy?: () => void;
  copyProps?: ComponentPropsWithRef<"button">;
}

function Reply({
  message,
  onToggleSteps,
  onFeedback,
  onRegenerate,
  onCopy,
  copyProps,
}: ReplyProps) {
  const { phase } = message;
  return (
    <div className="ds-agent-panel__reply">
      <Avatar kind="agent" size="sm" />
      <div className="ds-agent-panel__body">
        {phase === "error" ? (
          <Alert
            tone="err"
            layout="stacked"
            title="Не удалось получить ответ"
            hint="Агент не отвечает. Ваш вопрос сохранён."
            actions={
              <Button variant="ghost" size="sm" onClick={onRegenerate}>
                Повторить
              </Button>
            }
          />
        ) : (
          <>
            {phase === "thinking" ? (
              <span className="ds-agent-panel__shimmer">
                {message.thinkingText ?? "Анализирую…"}
              </span>
            ) : message.summary ? (
              <>
                <button
                  type="button"
                  className="ds-agent-panel__think"
                  aria-expanded={!!message.stepsOpen}
                  onClick={onToggleSteps}
                >
                  <Icon name="check" size="sm" />
                  {message.summary}
                  <Icon name="chevr" size="xs" className="ds-agent-panel__cv" />
                </button>
                {message.stepsOpen && message.steps?.length ? (
                  <div className="ds-agent-panel__steps">
                    {message.steps.map((step, index) => (
                      // oxlint-disable-next-line react/no-array-index-key -- шаги не имеют своего идентификатора, список не меняется на месте
                      <div key={index}>
                        <Icon name="check" size="xs" />
                        {step}
                      </div>
                    ))}
                  </div>
                ) : null}
              </>
            ) : null}
            <div
              className="ds-agent-panel__text"
              data-typing={phase === "streaming" || undefined}
              aria-live="polite"
            >
              {phase === "thinking" ? null : message.answer}
            </div>
            {phase === "done" ? message.attachment : null}
            {phase === "done" ? (
              <div className="ds-agent-panel__reply-acts">
                <Button
                  variant="ghost"
                  size="sm"
                  square
                  aria-label="Копировать"
                  onClick={onCopy}
                  {...copyProps}
                >
                  <Icon name="copy" size="sm" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  square
                  aria-label="Хороший ответ"
                  aria-pressed={message.feedback === "up"}
                  onClick={() => onFeedback?.("up")}
                >
                  <Icon name="thumbup" size="sm" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  square
                  aria-label="Плохой ответ"
                  aria-pressed={message.feedback === "down"}
                  onClick={() => onFeedback?.("down")}
                >
                  <Icon name="thumbdn" size="sm" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  square
                  aria-label="Ответить заново"
                  onClick={onRegenerate}
                >
                  <Icon name="refresh" size="sm" />
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

export function AgentPanel({
  size = "panel",
  messages,
  suggestions = NO_SUGGESTIONS,
  chats = NO_CHATS,
  chips = NO_CHIPS,
  modeLabel = "Агент: ",
  mode,
  greeting = "Чем помочь?",
  intro,
  disclaimer,
  value: valueProp,
  defaultValue = "",
  onValueChange,
  onSend,
  onStop,
  onAsk,
  onSelectChat,
  onNewChat,
  onClose,
  onResize,
  onToggleSteps,
  onFeedback,
  onRegenerate,
  onCopy,
  onEdit,
  onAttach,
  busy: busyProp,
  follow,
  slotProps,
  className,
  ...rest
}: AgentPanelProps) {
  const [value, setValue] = useControlled(valueProp, defaultValue, onValueChange);
  const scroll = useRef<HTMLDivElement>(null);
  const busy = busyProp ?? isBusy(messages);
  const empty = messages.length === 0;
  const groups = [...new Set(chats.map((chat) => chat.group ?? ""))];

  useEffect(() => {
    const el = scroll.current;
    if (el && (busy || follow)) el.scrollTop = el.scrollHeight;
  });

  const send = () => {
    const text = value.trim();
    if (!text || busy) return;
    onSend?.(text);
    setValue("");
  };

  return (
    <section
      aria-label="Агент"
      {...rest}
      className={cx("ds-agent-panel", className)}
      data-size={size}
    >
      <div className="ds-agent-panel__head">
        <Button variant="ghost" square aria-label="История чатов">
          <Icon name="pl" />
        </Button>
        <div className="ds-agent-panel__grow">
          {mode ? (
            <Button variant="ghost" size="sm">
              <span className="ds-agent-panel__lbl">{modeLabel}</span>
              <b>{mode}</b>
              <Icon name="chev" size="sm" />
            </Button>
          ) : null}
        </div>
        <div className="ds-agent-panel__acts">
          <Button variant="ghost" square aria-label="Новый чат" onClick={onNewChat}>
            <Icon name="edit" />
          </Button>
          <Button variant="ghost" square aria-label="Развернуть" onClick={onResize}>
            <Icon name={RESIZE_ICON[size]} />
          </Button>
          <Button variant="ghost" square aria-label="Закрыть" onClick={onClose}>
            <Icon name="x" />
          </Button>
        </div>
      </div>
      <div className="ds-agent-panel__layout">
        <nav className="ds-agent-panel__hist" aria-label="История чатов">
          <Button variant="outline" onClick={onNewChat}>
            <Icon name="plus" size="sm" />
            Новый чат
          </Button>
          {groups.map((group) => (
            <Fragment key={group}>
              {group ? <div className="ds-agent-panel__hist-group">{group}</div> : null}
              {chats
                .filter((chat) => (chat.group ?? "") === group)
                .map((chat) => (
                  <button
                    key={chat.id}
                    type="button"
                    className="ds-agent-panel__hist-item"
                    aria-current={chat.current ? true : undefined}
                    onClick={() => onSelectChat?.(chat.id)}
                  >
                    {chat.title}
                  </button>
                ))}
            </Fragment>
          ))}
        </nav>
        <div className="ds-agent-panel__main">
          <div className="ds-agent-panel__scroll" ref={scroll}>
            <div className="ds-agent-panel__col" role="log" aria-label="Переписка">
              {empty ? (
                <div className="ds-agent-panel__empty">
                  <Avatar kind="agent" size="xl" />
                  <h2>{greeting}</h2>
                  {intro ? <p>{intro}</p> : null}
                  {suggestions.length ? (
                    <div className="ds-agent-panel__sugs">
                      {suggestions.map((suggestion, index) => (
                        <button
                          type="button"
                          {...slotProps?.suggestion?.(index)}
                          key={suggestion.title}
                          className="ds-agent-panel__sug"
                          onClick={() => onAsk?.(suggestion.title)}
                        >
                          {suggestion.icon}
                          <b>{suggestion.title}</b>
                          {suggestion.hint ? <small>{suggestion.hint}</small> : null}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : (
                messages.map((message) => (
                  <Fragment key={message.id}>
                    <div className="ds-agent-panel__user">
                      <div className="ds-agent-panel__bubble">{message.question}</div>
                      <div className="ds-agent-panel__user-acts">
                        <Button
                          variant="ghost"
                          size="sm"
                          square
                          aria-label="Копировать"
                          onClick={() => onCopy?.(message.id)}
                        >
                          <Icon name="copy" size="sm" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          square
                          aria-label="Изменить"
                          onClick={() => {
                            setValue(message.question);
                            onEdit?.(message.id, message.question);
                          }}
                        >
                          <Icon name="edit" size="sm" />
                        </Button>
                      </div>
                    </div>
                    <Reply
                      message={message}
                      copyProps={slotProps?.copyReplyButton}
                      onToggleSteps={() => onToggleSteps?.(message.id)}
                      onFeedback={(feedback) => onFeedback?.(message.id, feedback)}
                      onRegenerate={() => onRegenerate?.(message.id)}
                      onCopy={() => onCopy?.(message.id)}
                    />
                  </Fragment>
                ))
              )}
            </div>
          </div>
          <div className="ds-agent-panel__comp">
            <div {...slotProps?.composer} className="ds-agent-panel__composer">
              <textarea
                rows={1}
                placeholder="Спросите агента"
                aria-label="Сообщение"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    send();
                  }
                }}
              />
              <div className="ds-agent-panel__comp-row">
                <Button variant="ghost" square aria-label="Добавить" onClick={onAttach}>
                  <Icon name="plus" />
                </Button>
                {chips.map((chip) => (
                  <Toggle key={chip} variant="chip" size="md" className="ds-agent-panel__chip">
                    {chip}
                  </Toggle>
                ))}
                <span className="ds-agent-panel__grow" />
                <Button
                  square
                  aria-label={busy ? "Остановить" : "Отправить"}
                  disabled={!busy && !value.trim()}
                  onClick={busy ? onStop : send}
                  {...slotProps?.sendButton}
                  className={cx("ds-agent-panel__round", slotProps?.sendButton?.className)}
                >
                  <Icon name={busy ? "stop" : "send"} />
                </Button>
              </div>
            </div>
            {disclaimer ? <div className="ds-agent-panel__note">{disclaimer}</div> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
