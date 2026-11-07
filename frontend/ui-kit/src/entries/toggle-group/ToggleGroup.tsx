/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import {
  Children,
  createContext,
  isValidElement,
  use,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cx, useControlled, useMergedRefs } from "../../ui/internal";
import "./togglegroup.css";

export type ToggleGroupSize = "md" | "sm";

interface GroupContext {
  value: string | undefined;
  select: (value: string) => void;
}

const Context = createContext<GroupContext | null>(null);

export interface ToggleGroupItemProps extends Omit<ComponentPropsWithRef<"button">, "value"> {
  value: string;
  icon?: ReactNode;
}

export function ToggleGroupItem({
  value,
  icon,
  type = "button",
  className,
  onClick,
  children,
  ...rest
}: ToggleGroupItemProps) {
  const group = use(Context);
  const checked = group?.value === value;
  return (
    <button
      {...rest}
      type={type}
      role="radio"
      className={cx("ds-tgroup__opt", className)}
      aria-checked={checked}
      tabIndex={checked || group?.value === undefined ? 0 : -1}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) group?.select(value);
      }}
    >
      {icon ? (
        <span className="ds-tgroup__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {children}
    </button>
  );
}

export interface ToggleGroupProps extends Omit<
  ComponentPropsWithRef<"div">,
  "defaultValue" | "onChange"
> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  size?: ToggleGroupSize;
  block?: boolean;
}

function firstEnabledValue(children: ReactNode): string | undefined {
  for (const child of Children.toArray(children)) {
    if (!isValidElement<Partial<ToggleGroupItemProps>>(child)) continue;
    const { value, disabled } = child.props;
    if (typeof value === "string" && !disabled) return value;
  }
  return undefined;
}

export function ToggleGroup({
  value,
  defaultValue,
  onValueChange,
  size = "md",
  block,
  className,
  children,
  onKeyDown,
  ref,
  ...rest
}: ToggleGroupProps) {
  const [current, setCurrent] = useControlled<string | undefined>(
    value,
    defaultValue ?? firstEnabledValue(children),
    onValueChange as ((next: string | undefined) => void) | undefined,
  );
  const track = useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRefs(track, ref);
  const thumb = useRef<HTMLSpanElement>(null);
  const [ready, setReady] = useState(false);

  const place = useCallback(() => {
    const element = thumb.current;
    if (!element) return;
    const option = track.current?.querySelector<HTMLElement>('[aria-checked="true"]');
    element.style.width = option ? `${option.offsetWidth}px` : "0px";
    element.style.translate = option ? `${option.offsetLeft}px 0` : "0px 0";
  }, []);

  useLayoutEffect(() => {
    place();
    // oxlint-disable-next-line react/exhaustive-effect-dependencies
  }, [current, size, block, children, place]);

  useLayoutEffect(() => {
    const element = track.current;
    if (!element) return;
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(place);
    observer?.observe(element);
    const frame = requestAnimationFrame(() => setReady(true));
    return () => {
      observer?.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [place]);

  const context = useMemo<GroupContext>(
    () => ({
      value: current,
      select: (next) => {
        if (next !== current) setCurrent(next);
      },
    }),
    [current, setCurrent],
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const items = [
      ...(track.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)') ??
        []),
    ];
    if (!items.length) return;
    const at = items.indexOf(document.activeElement as HTMLButtonElement);
    let target: HTMLButtonElement | undefined;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      target = items[(at + 1) % items.length];
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      target = items[(at - 1 + items.length) % items.length];
    } else if (event.key === "Home") {
      target = items[0];
    } else if (event.key === "End") {
      target = items[items.length - 1];
    } else {
      return;
    }
    event.preventDefault();
    target?.focus();
    target?.click();
  };

  return (
    // oxlint-disable-next-line jsx-a11y/interactive-supports-focus
    <div
      {...rest}
      ref={mergedRef}
      role="radiogroup"
      className={cx(
        "ds-tgroup",
        size === "sm" && "ds-tgroup--sm",
        block && "ds-tgroup--block",
        className,
      )}
      data-ready={ready || undefined}
      onKeyDown={handleKeyDown}
    >
      <span ref={thumb} className="ds-tgroup__thumb" aria-hidden="true" />
      <Context value={context}>{children}</Context>
    </div>
  );
}

ToggleGroup.Item = ToggleGroupItem;
