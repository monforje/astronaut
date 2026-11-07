/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cx, useControlled, Icon, usePrefersReducedMotion } from "../../ui/internal";
import { Avatar } from "../avatar";
import { isContinuation, plainText } from "./helpers";
import { Message } from "./Message";
import { ThreadComposer } from "./ThreadComposer";
import { ThreadTyping } from "./ThreadParts";
import {
  EMPTY_DRAFT,
  type ThreadAgentAction,
  type ThreadDraft,
  type ThreadFile,
  type ThreadMenu,
  type ThreadMessage,
  type ThreadMessageId,
  type ThreadPartData,
  type ThreadPerson,
  type ThreadSubmit,
  type ThreadToast,
} from "./types";
import "./thread.css";

export const DEFAULT_EMOJIS = ["👍", "✅", "👀", "❗", "🙏", "🎉"];

const NO_PEOPLE: ThreadPerson[] = [];
const UNDO_MS = 5000;
const LEAVE_MS = 200;
const FLASH_MS = 1400;

interface DeleteNotice {
  message: ThreadMessage;
  index: number;
}

export interface ThreadProps extends Omit<
  ComponentPropsWithRef<"section">,
  "onChange" | "children"
> {
  messages: ThreadMessage[];
  me: string;
  people?: ThreadPerson[];
  emojis?: string[];
  label?: string;
  height?: number;
  bare?: boolean;
  state?: "ready" | "loading" | "empty" | "error";
  emptyText?: ReactNode;
  errorText?: ReactNode;
  typing?: string | null;
  showComposer?: boolean;
  composerDisabled?: boolean;
  composerInvalid?: boolean;
  composerBusy?: boolean;
  composerError?: ReactNode;
  draft?: ThreadDraft;
  defaultDraft?: ThreadDraft;
  onDraftChange?: (draft: ThreadDraft) => void;
  onSend?: (submit: ThreadSubmit) => void;
  onAttach?: () => ThreadFile | null | undefined;
  onReact?: (message: ThreadMessage, emoji: string) => void;
  onDelete?: (message: ThreadMessage) => void;
  onRestore?: (message: ThreadMessage, index: number) => void;
  onRetry?: (message: ThreadMessage) => void;
  onDiscard?: (message: ThreadMessage) => void;
  onCopyText?: (message: ThreadMessage) => void;
  onAgentAction?: (message: ThreadMessage, action: ThreadAgentAction) => void;
  onRetryLoad?: () => void;
  menu?: ThreadMenu;
  onMenuChange?: (menu: ThreadMenu) => void;
  flashId?: ThreadMessageId | null;
  enteringId?: ThreadMessageId | null;
  leavingId?: ThreadMessageId | null;
  toast?: ThreadToast | null;
  partData?: ThreadPartData;
  inline?: boolean;
}

export function Thread({
  messages,
  me,
  people = NO_PEOPLE,
  emojis = DEFAULT_EMOJIS,
  label = "Обсуждение",
  height,
  bare,
  state = "ready",
  emptyText = "Напишите первым",
  errorText = "Не удалось загрузить сообщения",
  typing,
  showComposer = true,
  composerDisabled,
  composerInvalid,
  composerBusy,
  composerError,
  draft: draftProp,
  defaultDraft = EMPTY_DRAFT,
  onDraftChange,
  onSend,
  onAttach,
  onReact,
  onDelete,
  onRestore,
  onRetry,
  onDiscard,
  onCopyText,
  onAgentAction,
  onRetryLoad,
  menu: menuProp,
  onMenuChange,
  flashId: flashProp,
  enteringId,
  leavingId: leavingProp,
  toast: toastProp,
  partData,
  inline,
  className,
  style,
  ...rest
}: ThreadProps) {
  const reduced = usePrefersReducedMotion();
  const scroller = useRef<HTMLDivElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const timers = useRef<number[]>([]);
  const [draft, setDraft] = useControlled<ThreadDraft>(draftProp, defaultDraft, onDraftChange);
  const [menu, setMenu] = useControlled<ThreadMenu>(menuProp, null, onMenuChange);
  const [flashState, setFlashState] = useState<ThreadMessageId | null>(null);
  const [leavingState, setLeavingState] = useState<ThreadMessageId | null>(null);
  const [notice, setNotice] = useState<DeleteNotice | null>(null);
  const [entered, setEntered] = useState<ReadonlySet<ThreadMessageId>>(new Set());
  const known = useRef<ReadonlySet<ThreadMessageId> | null>(null);
  const focusMenu = useRef(false);

  const flashId = flashProp === undefined ? flashState : flashProp;
  const leavingId = leavingProp === undefined ? leavingState : leavingProp;
  const toast: ThreadToast | null =
    toastProp === undefined
      ? notice
        ? { text: "Сообщение удалено", action: onRestore ? "Отменить" : undefined }
        : null
      : toastProp;

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);
  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((id) => window.clearTimeout(id));
  }, []);

  useEffect(() => {
    const ids = new Set(messages.map((m) => m.id));
    const before = known.current;
    if (before && before.size > 0) {
      const fresh = [...ids].filter((id) => !before.has(id));
      if (fresh.length) setEntered((prev) => new Set([...prev, ...fresh]));
    }
    known.current = ids;
  }, [messages]);

  const count = messages.length + (typing ? 1 : 0);
  const first = useRef(true);
  useEffect(() => {
    const el = scroller.current;
    if (!el || bare) return;
    el.scrollTo?.({ top: el.scrollHeight, behavior: first.current || reduced ? "auto" : "smooth" });
    first.current = false;
  }, [count, bare, reduced]);

  const byId = (id: ThreadMessageId) => messages.find((m) => m.id === id);
  const closeMenu = (restoreFocus: boolean) => {
    const current = menu;
    setMenu(null);
    if (restoreFocus && current)
      scroller.current
        ?.querySelector<HTMLElement>(
          `.ds-thread__msg[data-id="${current.id}"] [data-menu="${current.kind}"]`,
        )
        ?.focus();
  };
  const toggleMenu = (m: ThreadMessage, kind: "more" | "emoji") => {
    const opening = !(menu?.id === m.id && menu.kind === kind);
    focusMenu.current = opening;
    setMenu(opening ? { id: m.id, kind } : null);
  };

  useEffect(() => {
    if (!menu || !focusMenu.current) return;
    focusMenu.current = false;
    document
      .querySelector<HTMLElement>('.ds-thread__menu:not([data-inline]) [role="menuitem"]')
      ?.focus();
  }, [menu]);

  const submit = () => {
    const text = draft.text.trim();
    if (!text && !draft.file) return;
    onSend?.({
      text,
      replyTo: draft.replyTo ?? undefined,
      editing: draft.editing ?? undefined,
      file: draft.file ?? undefined,
    });
    setDraft(EMPTY_DRAFT);
    textarea.current?.focus();
  };

  const jumpToQuote = (id: ThreadMessageId) => {
    scroller.current
      ?.querySelector<HTMLElement>(`.ds-thread__msg[data-id="${id}"]`)
      ?.scrollIntoView?.({ block: "center", behavior: reduced ? "auto" : "smooth" });
    setFlashState(id);
    later(() => setFlashState(null), FLASH_MS);
  };

  const remove = (m: ThreadMessage) => {
    const index = messages.findIndex((x) => x.id === m.id);
    setLeavingState(m.id);
    later(
      () => {
        onDelete?.(m);
        setLeavingState(null);
        setNotice({ message: m, index });
        later(() => setNotice(null), UNDO_MS);
      },
      reduced ? 0 : LEAVE_MS,
    );
  };

  const menuAction = (m: ThreadMessage, action: "copy" | "edit" | "delete") => {
    closeMenu(false);
    if (action === "copy") {
      navigator.clipboard?.writeText(plainText(m.text)).catch(() => undefined);
      onCopyText?.(m);
    } else if (action === "edit") {
      setDraft({ text: plainText(m.text), editing: m.id, replyTo: null, file: null });
      textarea.current?.focus();
    } else remove(m);
  };

  const agentAction = (m: ThreadMessage, action: ThreadAgentAction) => {
    if (action === "copy") {
      navigator.clipboard?.writeText(m.stream?.text ?? plainText(m.text)).catch(() => undefined);
      onCopyText?.(m);
    }
    onAgentAction?.(m, action);
  };

  const rows: ReactNode[] = [];
  let day = "";
  let prev: ThreadMessage | null = null;
  for (const m of messages) {
    if (m.day !== day) {
      day = m.day;
      rows.push(
        <div className="ds-thread__day" key={`day-${day}`}>
          {day}
        </div>,
      );
      prev = null;
    }
    const continued = isContinuation(prev, m);
    prev = m.kind === "system" ? null : m;
    rows.push(
      <Message
        key={m.id}
        message={m}
        me={me}
        people={people}
        quoted={m.replyTo !== undefined ? byId(m.replyTo) : undefined}
        continued={continued}
        menu={menu?.id === m.id ? menu.kind : null}
        flash={flashId === m.id}
        entering={enteringId === m.id || entered.has(m.id)}
        leaving={leavingId === m.id}
        emojis={emojis}
        partData={partData}
        inline={inline}
        onReply={() => {
          setDraft({ ...draft, replyTo: m.id, editing: null });
          textarea.current?.focus();
        }}
        onToggleMenu={(kind) => toggleMenu(m, kind)}
        onCloseMenu={closeMenu}
        onReact={(emoji) => {
          setMenu(null);
          onReact?.(m, emoji);
        }}
        onQuote={() => m.replyTo !== undefined && jumpToQuote(m.replyTo)}
        onRetry={() => onRetry?.(m)}
        onDiscard={() => onDiscard?.(m)}
        onMenuAction={(action) => menuAction(m, action)}
        onAgentAction={(action) => agentAction(m, action)}
      />,
    );
  }

  const skeletons = [0, 1, 2].map((i) => (
    <div className="ds-thread__skel" key={i}>
      <i />
      <span>
        <u style={{ width: 96 }} />
        <u style={{ width: `${70 - i * 14}%` }} />
      </span>
    </div>
  ));

  return (
    <section
      {...rest}
      className={cx("ds-thread", bare && "ds-thread--bare", className)}
      style={height ? ({ ...style, "--ds-thread-h": `${height}px` } as CSSProperties) : style}
      aria-label={label}
    >
      <div
        className="ds-thread__scroll"
        ref={scroller}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-busy={state === "loading" || undefined}
        tabIndex={bare ? undefined : 0}
      >
        {state === "loading" ? (
          skeletons
        ) : state === "empty" ? (
          <div className="ds-thread__center">
            <Avatar kind="agent" size="xl" />
            <b>Здесь пока тихо</b>
            <span>{emptyText}</span>
          </div>
        ) : state === "error" ? (
          <div className="ds-thread__banner" role="alert">
            <Icon name="alert" size="sm" />
            <span style={{ flex: 1 }}>{errorText}</span>
            <button type="button" className="ds-thread__link" onClick={onRetryLoad}>
              Повторить
            </button>
          </div>
        ) : (
          rows
        )}
      </div>
      {typing ? (
        <ThreadTyping name={typing} />
      ) : bare ? null : (
        <div className="ds-thread__typing" aria-live="polite" />
      )}
      {showComposer ? (
        <ThreadComposer
          value={draft.text}
          onValueChange={(text) => setDraft({ ...draft, text })}
          people={people}
          replyTo={
            draft.replyTo !== null && draft.replyTo !== undefined ? byId(draft.replyTo) : null
          }
          editing={
            draft.editing !== null && draft.editing !== undefined ? byId(draft.editing) : null
          }
          file={draft.file}
          disabled={composerDisabled}
          invalid={composerInvalid}
          busy={composerBusy}
          error={composerError}
          textareaRef={textarea}
          inline={inline}
          boxData={partData?.("box", {})}
          sendData={partData?.("send", {})}
          onSubmit={submit}
          onClearPreview={() =>
            setDraft({
              text: draft.editing ? "" : draft.text,
              replyTo: null,
              editing: null,
              file: null,
            })
          }
          onAttach={() => {
            const file = onAttach?.();
            if (file) setDraft({ ...draft, file });
          }}
        />
      ) : null}
      {toast ? (
        <div className="ds-thread__toast" role="status">
          <b>{toast.text}</b>
          {toast.action ? (
            <button
              type="button"
              {...partData?.("undo", {})}
              className="ds-thread__undo"
              onClick={() => {
                if (!notice) return;
                onRestore?.(notice.message, notice.index);
                setNotice(null);
              }}
            >
              {toast.action}
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
