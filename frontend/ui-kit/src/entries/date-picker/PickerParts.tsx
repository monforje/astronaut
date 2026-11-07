/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import {
  useEffect,
  useRef,
  type ComponentPropsWithRef,
  type ReactNode,
  type RefObject,
} from "react";
import {
  Icon,
  Layer,
  cx,
  getFocusable,
  useMergedRefs,
  type DismissReason,
} from "../../ui/internal";
import "./date-picker.css";

export interface PickerFieldProps extends ComponentPropsWithRef<"div"> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  hintId?: string;
  errorId?: string;
  width?: number | string;
}

export function PickerField({
  label,
  hint,
  error,
  hintId,
  errorId,
  width,
  className,
  style,
  children,
  ...rest
}: PickerFieldProps) {
  return (
    <div
      {...rest}
      className={cx("ds-datepicker__fld", className)}
      style={width ? { ...style, width } : style}
    >
      {label ? <span className="ds-datepicker__label">{label}</span> : null}
      {children}
      {error ? (
        <span className="ds-datepicker__err" id={errorId} role="alert">
          {error}
        </span>
      ) : hint ? (
        <span className="ds-datepicker__hint" id={hintId}>
          {hint}
        </span>
      ) : null}
    </div>
  );
}

export interface PickerBoxProps extends Omit<ComponentPropsWithRef<"div">, "onClick"> {
  icon: ReactNode;
  iconLabel?: string;
  iconRef?: RefObject<HTMLButtonElement | null>;
  open?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  onIconClick?: () => void;
  tail?: ReactNode;
}

export function PickerBox({
  icon,
  iconLabel = "Открыть календарь",
  iconRef,
  open,
  invalid,
  disabled,
  onIconClick,
  tail,
  className,
  children,
  ...rest
}: PickerBoxProps) {
  return (
    <div
      {...rest}
      className={cx("ds-datepicker__box", className)}
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
      data-open={open || undefined}
    >
      <button
        type="button"
        ref={iconRef}
        className="ds-datepicker__lead"
        aria-label={iconLabel}
        aria-haspopup="dialog"
        aria-expanded={open ?? false}
        disabled={disabled}
        onClick={onIconClick}
      >
        {icon}
      </button>
      {children}
      {tail}
    </div>
  );
}

export interface PickerPopoverProps extends ComponentPropsWithRef<"div"> {
  inline?: boolean;
  top?: boolean;
  narrow?: boolean;
  open?: boolean;
  anchorRef?: RefObject<HTMLElement | null>;
  onDismiss?: (reason: DismissReason) => void;
  returnFocusRef?: RefObject<HTMLElement | null>;
}

function usePickerTabFlow(
  anchorRef: RefObject<HTMLElement | null>,
  popRef: RefObject<HTMLElement | null>,
  open: boolean,
) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const anchor = anchorRef.current;
      const pop = popRef.current;
      if (event.key !== "Tab" || !anchor || !pop) return;
      const active = document.activeElement;
      const own = getFocusable(anchor);
      const inner = getFocusable(pop);
      const lastOwn = own[own.length - 1];
      if (anchor.contains(active)) {
        if (!event.shiftKey && active === lastOwn && inner.length > 0) {
          event.preventDefault();
          inner[0].focus();
        }
      } else if (pop.contains(active)) {
        if (event.shiftKey && active === inner[0]) {
          event.preventDefault();
          lastOwn?.focus();
        } else if (!event.shiftKey && active === inner[inner.length - 1]) {
          event.preventDefault();
          const page = getFocusable(document.body).filter((item) => !pop.contains(item));
          page[page.indexOf(lastOwn) + 1]?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, anchorRef, popRef]);
}

interface FloatingPickerProps extends Omit<PickerPopoverProps, "inline" | "top" | "narrow"> {
  anchorRef: RefObject<HTMLElement | null>;
  side: "top" | "bottom";
}

function FloatingPicker({
  open = true,
  anchorRef,
  onDismiss,
  returnFocusRef,
  side,
  ref,
  ...rest
}: FloatingPickerProps) {
  const popRef = useRef<HTMLDivElement | null>(null);
  const mergedRef = useMergedRefs(popRef, ref);
  usePickerTabFlow(anchorRef, popRef, open);
  return (
    <Layer
      {...rest}
      ref={mergedRef}
      open={open}
      anchorRef={anchorRef}
      onDismiss={(reason) => onDismiss?.(reason)}
      returnFocusRef={returnFocusRef}
      focusOutside
      side={side}
      gap={6}
    />
  );
}

export function PickerPopover({
  inline,
  top,
  narrow,
  className,
  "aria-label": ariaLabel = "Выбор даты",
  anchorRef,
  ...rest
}: PickerPopoverProps) {
  const shared = {
    className: cx("ds-datepicker__pop", className),
    role: "dialog",
    "aria-label": ariaLabel,
    "data-narrow": narrow || undefined,
  };
  if (anchorRef && !inline)
    return (
      <FloatingPicker {...rest} {...shared} anchorRef={anchorRef} side={top ? "top" : "bottom"} />
    );
  const { open: _open, onDismiss: _onDismiss, returnFocusRef: _returnFocusRef, ...plain } = rest;
  return (
    <div {...plain} {...shared} data-static={inline || undefined} data-top={top || undefined} />
  );
}

export function PickerFooter({ className, ...rest }: ComponentPropsWithRef<"div">) {
  return <div {...rest} className={cx("ds-datepicker__foot", className)} />;
}

export interface PickerButtonProps extends ComponentPropsWithRef<"button"> {
  variant?: "plain" | "primary" | "outline";
}

export function PickerButton({
  variant = "plain",
  type = "button",
  className,
  ...rest
}: PickerButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      className={cx(
        "ds-datepicker__btn",
        variant !== "plain" && `ds-datepicker__btn--${variant}`,
        className,
      )}
    />
  );
}

export function PickerSpacer() {
  return <span className="ds-datepicker__grow" />;
}

export function PickerClear({
  label = "Очистить",
  ...rest
}: ComponentPropsWithRef<"button"> & { label?: string }) {
  return (
    <button {...rest} type="button" className="ds-datepicker__x" aria-label={label}>
      <Icon name="x" size="sm" />
    </button>
  );
}
