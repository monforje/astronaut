/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { Avatar } from "../avatar";
import { plainText, splitBold, splitMentions } from "./helpers";
import { ThreadIconButton, ThreadLayer } from "./ThreadParts";
import type {
  ThreadAgentAction,
  ThreadMessage,
  ThreadPart,
  ThreadPartData,
  ThreadPerson,
} from "./types";
import { Icon } from "../../ui/internal";
import { Tooltip } from "../tooltip";

export interface MessageProps {
  message: ThreadMessage;
  me: string;
  people: ThreadPerson[];
  quoted?: ThreadMessage;
  continued: boolean;
  menu: "more" | "emoji" | null;
  flash: boolean;
  entering: boolean;
  leaving: boolean;
  emojis: string[];
  partData?: ThreadPartData;
  inline?: boolean;
  onReply: () => void;
  onToggleMenu: (kind: "more" | "emoji") => void;
  onCloseMenu: (restoreFocus: boolean) => void;
  onReact: (emoji: string) => void;
  onQuote: () => void;
  onRetry: () => void;
  onDiscard: () => void;
  onMenuAction: (action: "copy" | "edit" | "delete") => void;
  onAgentAction: (action: ThreadAgentAction) => void;
}

function Parts({ text, people }: { text: string; people: ThreadPerson[] }): ReactNode {
  return splitMentions(plainText(text), people).map((part) =>
    part.kind === "mention" ? (
      <span className="ds-thread__mn" key={part.at}>
        {part.text}
      </span>
    ) : (
      <span key={part.at}>{part.text}</span>
    ),
  );
}

function menuKeys(event: KeyboardEvent<HTMLDivElement>) {
  if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
  event.preventDefault();
  const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]'));
  const index = items.indexOf(document.activeElement as HTMLElement);
  const step = event.key === "ArrowDown" ? 1 : -1;
  items[(index + step + items.length) % items.length]?.focus();
}

export function Message(props: MessageProps) {
  const {
    message: m,
    me,
    people,
    quoted,
    continued,
    menu,
    flash,
    entering,
    leaving,
    emojis,
    partData,
    inline,
    onReply,
    onToggleMenu,
    onCloseMenu,
    onReact,
    onQuote,
    onRetry,
    onDiscard,
    onMenuAction,
    onAgentAction,
  } = props;

  const actsRef = useRef<HTMLDivElement>(null);

  if (m.kind === "system") {
    return (
      <div className="ds-thread__sys">
        <Icon name="bolt" size="xs" />
        <span>
          {splitBold(m.text).map((part) =>
            part.kind === "bold" ? (
              <b key={part.at}>{part.text}</b>
            ) : (
              <span key={part.at}>{part.text}</span>
            ),
          )}
          {` · ${m.time}`}
        </span>
      </div>
    );
  }

  const agent = m.kind === "agent";
  const own = !agent && m.author === me;
  const reactions = m.reactions ? Object.entries(m.reactions).filter(([, who]) => who.length) : [];
  const data = (part: ThreadPart, emoji?: string) => partData?.(part, { message: m, emoji });
  const quoteName = quoted ? (quoted.kind === "agent" ? "Агент" : quoted.author) : undefined;

  return (
    <div
      {...data("message")}
      className="ds-thread__msg"
      data-id={m.id}
      data-cont={continued || undefined}
      data-flash={flash || undefined}
      data-enter={entering || undefined}
      data-leave={leaving || undefined}
      data-status={m.status}
    >
      <div className="ds-thread__ava">
        {agent ? <Avatar kind="agent" size="md" /> : <Avatar name={m.author} size="md" />}
      </div>
      <div>
        <span className="ds-thread__hs">{m.time}</span>
        <div className="ds-thread__head">
          <b>{agent ? "Агент" : m.author}</b>
          {own ? <span className="ds-thread__me">вы</span> : null}
          {agent ? <span className="ds-thread__tag">ИИ</span> : null}
          <small>{m.time}</small>
        </div>
        <div className="ds-thread__body">
          {m.replyTo !== undefined ? (
            <button
              type="button"
              {...data("quote")}
              className="ds-thread__quote"
              aria-label={`Перейти к сообщению: ${quoteName ?? ""}`}
              onClick={onQuote}
            >
              <Icon name="reply" size="xs" />
              <b>{quoted ? quoteName : "Сообщение"}</b>
              <span>{quoted ? plainText(quoted.text).slice(0, 90) : "удалено"}</span>
            </button>
          ) : null}
          {m.stream ? (
            <>
              {m.stream.phase === "think" ? (
                <span className="ds-thread__shim">{m.stream.thinking ?? "Анализирую…"}</span>
              ) : (
                <span className="ds-thread__think">
                  <Icon name="check" size="sm" />
                  {m.stream.summary ?? "Готово"}
                </span>
              )}
              {m.stream.phase !== "think" ? (
                <div className={m.stream.phase === "text" ? "ds-thread__cur" : undefined}>
                  {m.stream.text}
                </div>
              ) : null}
              {m.stream.phase === "done" ? (
                <div className="ds-thread__agact">
                  <ThreadIconButton
                    icon="copy"
                    label="Копировать"
                    onClick={() => onAgentAction("copy")}
                  />
                  <ThreadIconButton
                    icon="thumbup"
                    label="Хороший ответ"
                    on={m.stream.liked}
                    aria-pressed={m.stream.liked ?? false}
                    onClick={() => onAgentAction("up")}
                  />
                  <ThreadIconButton
                    icon="thumbdn"
                    label="Плохой ответ"
                    onClick={() => onAgentAction("down")}
                  />
                  <ThreadIconButton
                    icon="refresh"
                    label="Ответить заново"
                    onClick={() => onAgentAction("regen")}
                  />
                </div>
              ) : null}
            </>
          ) : (
            <>
              <Parts text={m.text} people={people} />
              {m.edited ? <em>изменено</em> : null}
            </>
          )}
        </div>
        {m.file ? (
          <button type="button" className="ds-thread__file" aria-label={`Файл ${m.file.name}`}>
            <span className="ds-thread__fi">PDF</span>
            <span className="ds-thread__ft">
              <b>{m.file.name}</b>
              <small>{m.file.size}</small>
            </span>
          </button>
        ) : null}
        {reactions.length ? (
          <div className="ds-thread__rxs">
            {reactions.map(([emoji, who]) => (
              <Tooltip key={emoji} content={who.join(", ")} side="top">
                <button
                  type="button"
                  {...data("reaction", emoji)}
                  className="ds-thread__rx"
                  aria-pressed={who.includes(me)}
                  aria-label={`${emoji}: ${who.join(", ")}`}
                  onClick={() => onReact(emoji)}
                >
                  {emoji} {who.length}
                </button>
              </Tooltip>
            ))}
            <button
              type="button"
              className="ds-thread__rx ds-thread__rx--add"
              aria-label="Добавить реакцию"
              onClick={() => onToggleMenu("emoji")}
            >
              <Icon name="smile" size="xs" />
            </button>
          </div>
        ) : null}
        {m.status === "sending" ? (
          <div className="ds-thread__state">
            <span className="ds-thread__spin" aria-hidden="true" />
            Отправляется…
          </div>
        ) : null}
        {m.status === "failed" ? (
          <div className="ds-thread__state" role="alert">
            <Icon name="alert" size="xs" />
            Не отправлено
            <button type="button" className="ds-thread__link" onClick={onRetry}>
              Повторить
            </button>
            <button type="button" className="ds-thread__link" onClick={onDiscard}>
              Удалить
            </button>
          </div>
        ) : null}
      </div>
      {!agent ? (
        <div
          ref={actsRef}
          className="ds-thread__acts"
          role="toolbar"
          aria-label="Действия с сообщением"
        >
          <ThreadIconButton
            icon="smile"
            label="Реакция"
            menu="emoji"
            aria-expanded={menu === "emoji"}
            onClick={() => onToggleMenu("emoji")}
          />
          <ThreadIconButton icon="reply" label="Ответить" {...data("reply")} onClick={onReply} />
          <ThreadIconButton
            icon="more"
            label="Ещё"
            menu="more"
            aria-expanded={menu === "more"}
            onClick={() => onToggleMenu("more")}
          />
        </div>
      ) : null}
      {menu === "emoji" ? (
        <ThreadLayer
          className="ds-thread__menu"
          place="msg"
          inline={inline}
          anchorRef={actsRef}
          onDismiss={(reason) => onCloseMenu(reason === "escape")}
          role="menu"
          tabIndex={-1}
          aria-label="Реакции"
          onKeyDown={(event) => {
            if (event.key === "Tab") onCloseMenu(true);
          }}
        >
          <div className="ds-thread__emojis">
            {emojis.map((emoji) => (
              <button
                type="button"
                key={emoji}
                role="menuitem"
                className="ds-thread__ib"
                aria-label={emoji}
                onClick={() => onReact(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </ThreadLayer>
      ) : null}
      {menu === "more" ? (
        <ThreadLayer
          className="ds-thread__menu"
          place="msg"
          inline={inline}
          anchorRef={actsRef}
          onDismiss={(reason) => onCloseMenu(reason === "escape")}
          role="menu"
          tabIndex={-1}
          aria-label="Ещё"
          onKeyDown={(event) => {
            menuKeys(event);
            if (event.key === "Tab") onCloseMenu(true);
          }}
        >
          <button
            type="button"
            role="menuitem"
            className="ds-thread__item"
            onClick={() => onMenuAction("copy")}
          >
            <Icon name="copy" size="sm" />
            Копировать текст
          </button>
          {own ? (
            <>
              <button
                type="button"
                role="menuitem"
                className="ds-thread__item"
                onClick={() => onMenuAction("edit")}
              >
                <Icon name="edit" size="sm" />
                Изменить
              </button>
              <button
                type="button"
                role="menuitem"
                className="ds-thread__item ds-thread__item--danger"
                onClick={() => onMenuAction("delete")}
              >
                <Icon name="trash" size="sm" />
                Удалить
              </button>
            </>
          ) : null}
        </ThreadLayer>
      ) : null}
    </div>
  );
}
