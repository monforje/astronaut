/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { cx, Icon, useControlled, useMergedRefs } from "../../ui/internal";
import { Avatar, type AvatarSize } from "../avatar";
import { Skeleton } from "../skeleton";
import "./avatar-group.css";

export type AvatarGroupSize = Exclude<AvatarSize, "xl">;

export interface AvatarGroupPerson {
  name: string;
  role?: string;
  square?: boolean;
}

export interface AvatarGroupProps extends Omit<ComponentPropsWithRef<"span">, "children"> {
  people: AvatarGroupPerson[];
  max?: number;
  size?: AvatarGroupSize;
  label?: string;
  interactive?: boolean;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  listLabel?: string;
  loading?: boolean;
  loadingCount?: number;
  onAdd?: () => void;
  addLabel?: string;
  addDisabled?: boolean;
  emptyText?: string;
}

export function AvatarGroup({
  people,
  max = 3,
  size,
  label = "Участники",
  interactive,
  expanded: expandedProp,
  defaultExpanded = false,
  onExpandedChange,
  listLabel = "Все участники",
  loading,
  loadingCount = 3,
  onAdd,
  addLabel = "Добавить участника",
  addDisabled,
  emptyText = "Участников нет",
  className,
  onKeyDown,
  onBlur,
  ref,
  ...rest
}: AvatarGroupProps) {
  const listId = useId();
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const moreRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLSpanElement | null>(null);
  const focusPending = useRef(false);
  const [expanded, setExpanded] = useControlled(expandedProp, defaultExpanded, onExpandedChange);
  const setRoot = useMergedRefs(rootRef, ref);

  const names = people.map((p) => p.name);
  const key = names.join("\u0001");
  const [seen, setSeen] = useState({ key, names });
  const [fresh, setFresh] = useState<string[]>([]);
  if (seen.key !== key) {
    setSeen({ key, names });
    setFresh(names.filter((n) => !seen.names.includes(n)));
  }

  useEffect(() => {
    if (!expanded || !focusPending.current) return;
    focusPending.current = false;
    listRef.current?.querySelector<HTMLElement>('[role="listitem"]')?.focus();
  }, [expanded]);

  useEffect(() => {
    if (!expanded || !interactive) return;
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setExpanded(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [expanded, interactive, setExpanded]);

  if (loading) {
    return (
      <span
        {...rest}
        ref={setRoot}
        className={cx("ds-avgroup", size && `ds-avgroup--${size}`, className)}
        role="group"
        aria-label={`${label} загружаются`}
        aria-busy="true"
        data-anim="pulse"
      >
        {Array.from({ length: loadingCount }, (_, i) => (
          <span className="ds-avgroup__item" key={i}>
            <Skeleton
              shape="round"
              width={size === "md" ? 32 : 24}
              height={size === "md" ? 32 : 24}
            />
          </span>
        ))}
      </span>
    );
  }

  if (people.length === 0) {
    return (
      <span {...rest} ref={setRoot} className={cx("ds-avgroup__empty", className)}>
        {onAdd ? (
          <button
            type="button"
            className="ds-avgroup__add"
            aria-label={addLabel}
            disabled={addDisabled}
            onClick={onAdd}
          >
            <Icon name="plus" size="sm" />
          </button>
        ) : null}
        {emptyText}
      </span>
    );
  }

  const shown = people.slice(0, max);
  const hidden = people.length - shown.length;

  const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    onKeyDown?.(event);
    if (event.key === "Escape" && expanded && interactive) {
      event.stopPropagation();
      setExpanded(false);
      moreRef.current?.focus();
    }
  };
  const handleBlur = (event: FocusEvent<HTMLSpanElement>) => {
    onBlur?.(event);
    if (
      expanded &&
      interactive &&
      event.relatedTarget &&
      !event.currentTarget.contains(event.relatedTarget)
    ) {
      setExpanded(false);
    }
  };
  const toggle = () => {
    if (!expanded) focusPending.current = true;
    setExpanded(!expanded);
  };

  return (
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <span
      {...rest}
      ref={setRoot}
      className={cx("ds-avgroup", size && `ds-avgroup--${size}`, className)}
      role="group"
      aria-label={label}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    >
      {shown.map((person, i) => (
        <span
          className="ds-avgroup__item"
          key={person.name}
          data-enter={fresh.includes(person.name) || undefined}
          style={{ zIndex: shown.length - i }}
        >
          <Avatar name={person.name} size={size} square={person.square} />
          <span className="ds-avgroup__tip" aria-hidden="true">
            {person.name}
          </span>
        </span>
      ))}
      {hidden > 0 ? (
        <span className="ds-avgroup__item" style={{ zIndex: 0 }}>
          {interactive ? (
            <button
              ref={moreRef}
              type="button"
              className="ds-avgroup__more"
              aria-label={`Ещё ${hidden}: показать всех участников`}
              aria-expanded={expanded}
              aria-haspopup="true"
              aria-controls={expanded ? listId : undefined}
              onClick={toggle}
            >
              <Avatar kind="more" count={hidden} size={size} />
            </button>
          ) : (
            <Avatar kind="more" count={hidden} size={size} />
          )}
        </span>
      ) : null}
      {interactive && expanded ? (
        <span
          id={listId}
          ref={listRef}
          className="ds-avgroup__pop"
          role="list"
          aria-label={listLabel}
        >
          {people.map((person) => (
            // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex
            <span className="ds-avgroup__row" role="listitem" tabIndex={0} key={person.name}>
              <Avatar name={person.name} size="sm" square={person.square} />
              {person.name}
              {person.role ? <small>{person.role}</small> : null}
            </span>
          ))}
        </span>
      ) : null}
    </span>
  );
}
