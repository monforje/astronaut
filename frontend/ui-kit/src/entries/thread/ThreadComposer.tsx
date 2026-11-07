/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from "react";
import { Icon, cx, useIds, useMergedRefs } from "../../ui/internal";
import { Avatar } from "../avatar";
import type { CalendarDayData } from "../calendar/Calendar";
import { filterPeople, insertMention, mentionQuery, plainText } from "./helpers";
import { ThreadIconButton, ThreadLayer } from "./ThreadParts";
import type { ThreadFile, ThreadMessage, ThreadPerson } from "./types";

export interface ThreadComposerProps extends Omit<
  ComponentPropsWithRef<"div">,
  "onChange" | "children"
> {
  value: string;
  onValueChange: (text: string) => void;
  people?: ThreadPerson[];
  replyTo?: ThreadMessage | null;
  editing?: ThreadMessage | null;
  file?: ThreadFile | null;
  disabled?: boolean;
  invalid?: boolean;
  busy?: boolean;
  error?: ReactNode;
  placeholder?: string;
  disabledPlaceholder?: string;
  hint?: string;
  textareaRef?: Ref<HTMLTextAreaElement>;
  inline?: boolean;
  boxData?: CalendarDayData;
  sendData?: CalendarDayData;
  onSubmit?: () => void;
  onClearPreview?: () => void;
  onAttach?: () => void;
  onEmoji?: () => void;
}

const NO_PEOPLE: ThreadPerson[] = [];

export function ThreadComposer({
  value,
  onValueChange,
  people = NO_PEOPLE,
  replyTo,
  editing,
  file,
  disabled,
  invalid,
  busy,
  error,
  placeholder = "Написать комментарий… @ — упомянуть",
  disabledPlaceholder = "Обсуждение закрыто",
  hint = "Enter — отправить",
  textareaRef,
  inline,
  boxData,
  sendData,
  onSubmit,
  onClearPreview,
  onAttach,
  onEmoji,
  className,
  ...rest
}: ThreadComposerProps) {
  const { mentions: listId, option: optionBase } = useIds(["mentions", "option"]);
  const optionId = (i: number) => `${optionBase}-${i}`;
  const own = useRef<HTMLTextAreaElement | null>(null);
  const textareaMergedRef = useMergedRefs(own, textareaRef);
  const compRef = useRef<HTMLDivElement | null>(null);
  const compMergedRef = useMergedRefs(compRef, rest.ref);
  const query = mentionQuery(value);
  const [seen, setSeen] = useState(query);
  const [active, setActive] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  if (seen !== query) {
    setSeen(query);
    setActive(0);
    setDismissed(false);
  }
  const list = dismissed ? [] : filterPeople(people, query);
  const current = list.length ? active % list.length : 0;

  useEffect(() => {
    const el = own.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [value]);

  const can = !disabled && (!!value.trim() || !!file);
  const pick = (name: string) => {
    onValueChange(insertMention(value, name));
    own.current?.focus();
  };
  const keyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (list.length) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        setActive((current + (event.key === "ArrowDown" ? 1 : -1) + list.length) % list.length);
        return;
      }
      if (event.key === "Enter" || event.key === "Tab") {
        event.preventDefault();
        pick(list[current].name);
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        setDismissed(true);
        return;
      }
    }
    if (event.key === "Escape" && (replyTo || editing || file)) {
      event.preventDefault();
      onClearPreview?.();
      return;
    }
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (can && !busy) onSubmit?.();
    }
  };

  const preview = editing
    ? {
        icon: "edit" as const,
        head: "Изменение сообщения",
        text: plainText(editing.text),
        label: "Отмена",
      }
    : replyTo
      ? {
          icon: "reply" as const,
          head: `Ответ: ${replyTo.kind === "agent" ? "Агент" : replyTo.author}`,
          text: plainText(replyTo.text),
          label: "Убрать ответ",
        }
      : file
        ? { icon: "clip" as const, head: file.name, text: file.size, label: "Убрать файл" }
        : null;

  return (
    <div {...rest} ref={compMergedRef} className={cx("ds-thread__comp", className)}>
      {list.length ? (
        <ThreadLayer
          className="ds-thread__menu"
          place="top"
          inline={inline}
          anchorRef={compRef}
          onDismiss={() => setDismissed(true)}
          role="listbox"
          id={listId}
          aria-label="Упомянуть"
        >
          {list.map((person, i) => (
            <button
              type="button"
              key={person.name}
              id={optionId(i)}
              role="option"
              className="ds-thread__item"
              aria-selected={i === current}
              tabIndex={-1}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => pick(person.name)}
            >
              <Avatar name={person.name} size="sm" />
              <span>
                {person.name}
                {person.role ? <small>{person.role}</small> : null}
              </span>
            </button>
          ))}
        </ThreadLayer>
      ) : null}
      <div
        {...boxData}
        className="ds-thread__box"
        data-invalid={invalid || undefined}
        data-disabled={disabled || undefined}
      >
        {preview ? (
          <div className="ds-thread__preview">
            <Icon name={preview.icon} size="sm" />
            <span className="ds-thread__prevtx">
              <b>{preview.head}</b>
              <em>{preview.text}</em>
            </span>
            <ThreadIconButton icon="x" label={preview.label} onClick={onClearPreview} />
          </div>
        ) : null}
        <textarea
          ref={textareaMergedRef}
          className="ds-thread__input"
          rows={1}
          aria-label="Комментарий"
          placeholder={disabled ? disabledPlaceholder : placeholder}
          disabled={disabled}
          value={value}
          role="combobox"
          aria-expanded={list.length > 0}
          aria-autocomplete="list"
          aria-controls={list.length ? listId : undefined}
          aria-activedescendant={list.length ? optionId(current) : undefined}
          aria-invalid={invalid || undefined}
          onChange={(event) => onValueChange(event.target.value)}
          onKeyDown={keyDown}
        />
        <div className="ds-thread__bar">
          <ThreadIconButton
            icon="at"
            label="Упомянуть"
            disabled={disabled}
            onClick={() => {
              onValueChange(`${value}${value && !/\s$/.test(value) ? " " : ""}@`);
              own.current?.focus();
            }}
          />
          <ThreadIconButton
            icon="clip"
            label="Прикрепить файл"
            disabled={disabled}
            onClick={onAttach}
          />
          <ThreadIconButton
            icon="smile"
            label="Эмодзи"
            disabled={disabled}
            onClick={() => {
              if (onEmoji) onEmoji();
              else onValueChange(`${value}👍`);
              own.current?.focus();
            }}
          />
          <span className="ds-thread__hint">{hint}</span>
          <button
            type="button"
            {...sendData}
            className="ds-thread__send"
            disabled={!can || busy}
            onClick={onSubmit}
          >
            {busy ? (
              <span className="ds-thread__spin" aria-hidden="true" />
            ) : (
              <Icon name="send" size="sm" />
            )}
            Отправить
          </button>
        </div>
      </div>
      {error ? (
        <div className="ds-thread__err" role="alert">
          {error}
        </div>
      ) : null}
    </div>
  );
}
