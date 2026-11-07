/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ComponentPropsWithRef, KeyboardEvent, MouseEvent, ReactNode } from "react";
import { cx, Icon } from "../../ui/internal";
import { Avatar } from "../avatar";
import { Skeleton } from "../skeleton";
import "./user-chip.css";

export interface UserChipProps extends Omit<ComponentPropsWithRef<"span">, "children"> {
  name: string;
  post?: string;
  href?: string;
  square?: boolean;
  disabled?: boolean;
  loading?: boolean;
  unknown?: boolean;
  onRemove?: () => void;
  removeLabel?: string;
  unknownLabel?: string;
}

type ChipTag = "span" | "button" | "a";

export function UserChip({
  name,
  post,
  href,
  square,
  disabled,
  loading,
  unknown,
  onRemove,
  removeLabel,
  unknownLabel = "Неизвестный",
  onClick,
  onKeyDown,
  className,
  ...rest
}: UserChipProps) {
  const removable = Boolean(onRemove) && !loading;
  const clickable = Boolean(onClick) || Boolean(href);
  const tag: ChipTag = removable || loading ? "span" : href ? "a" : clickable ? "button" : "span";
  const shownName = unknown ? unknownLabel : name;
  const cls = cx(
    "ds-uchip",
    tag === "span" && "ds-uchip--static",
    removable && "ds-uchip--removable",
    unknown && "ds-uchip--error",
    loading && "ds-uchip--loading",
    className,
  );

  const body: ReactNode = loading ? (
    <>
      <Skeleton width={18} height={18} shape="round" />
      <Skeleton width={84} height={10} />
    </>
  ) : (
    <>
      <span className="ds-uchip__av" aria-hidden="true">
        {unknown ? (
          <Avatar kind="muted" size="sm" />
        ) : (
          <Avatar name={name} size="sm" square={square} />
        )}
      </span>
      <span className="ds-uchip__name">{shownName}</span>
      {post ? <span className="ds-uchip__role">{post}</span> : null}
    </>
  );

  const handleClick = (event: MouseEvent<HTMLSpanElement>) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  if (removable) {
    const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
      onKeyDown?.(event);
      if (event.target !== event.currentTarget || event.defaultPrevented) return;
      if (event.key === "Backspace" || event.key === "Delete") {
        event.preventDefault();
        onRemove?.();
      }
    };
    /* oxlint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */
    return (
      <span
        {...rest}
        role="group"
        aria-label={shownName}
        tabIndex={0}
        className={cls}
        onKeyDown={handleKeyDown}
      >
        {body}
        <button
          type="button"
          className="ds-uchip__x"
          aria-label={removeLabel ?? `Убрать: ${shownName}`}
          onClick={onRemove}
        >
          <Icon name="x" size="xs" />
        </button>
      </span>
    );
    /* oxlint-enable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */
  }

  if (tag === "a") {
    return (
      <a
        {...(rest as ComponentPropsWithRef<"a">)}
        href={href}
        className={cls}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : undefined}
        onClick={handleClick}
        onKeyDown={onKeyDown}
      >
        {body}
      </a>
    );
  }

  if (tag === "button") {
    return (
      <button
        {...(rest as ComponentPropsWithRef<"button">)}
        type="button"
        className={cls}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={onKeyDown}
      >
        {body}
      </button>
    );
  }

  return (
    <span
      {...rest}
      className={cls}
      data-anim={loading ? "pulse" : undefined}
      aria-busy={loading || undefined}
      aria-label={loading ? "Загрузка" : undefined}
    >
      {body}
    </span>
  );
}

export interface MentionProps extends ComponentPropsWithRef<"span"> {
  href?: string;
  me?: boolean;
  unknown?: boolean;
}

export function Mention({
  href,
  me,
  unknown,
  onClick,
  className,
  children,
  ...rest
}: MentionProps) {
  const cls = cx(
    "ds-uchip-mn",
    me && "ds-uchip-mn--me",
    unknown && "ds-uchip-mn--unknown",
    className,
  );
  if (unknown || (!href && !onClick)) {
    return (
      <span {...rest} className={cls}>
        @{children}
      </span>
    );
  }
  if (href) {
    return (
      <a {...(rest as ComponentPropsWithRef<"a">)} href={href} className={cls} onClick={onClick}>
        @{children}
      </a>
    );
  }
  return (
    <button
      {...(rest as ComponentPropsWithRef<"button">)}
      type="button"
      className={cls}
      onClick={onClick}
    >
      @{children}
    </button>
  );
}
