/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import {
  cloneElement,
  useCallback,
  useRef,
  type ComponentPropsWithRef,
  type ReactElement,
  type ReactNode,
} from "react";
import { Layer, cx, useControlled, useMergedRefs, useStableId, type Side } from "../../ui/internal";
import "./tooltip.css";

export type TooltipSide = Side;

export interface TooltipCardProps extends Omit<ComponentPropsWithRef<"span">, "content"> {
  content: ReactNode;
  kbd?: string;
  wrap?: boolean;
}

export function TooltipCard({ content, kbd, wrap, className, ...rest }: TooltipCardProps) {
  return (
    <span {...rest} className={cx("ds-tooltip", wrap && "ds-tooltip--wrap", className)}>
      <span className="ds-tooltip__text">{content}</span>
      {kbd ? <span className="ds-tooltip__kbd">{kbd}</span> : null}
    </span>
  );
}

export interface TooltipProps extends Omit<ComponentPropsWithRef<"span">, "content" | "children"> {
  content: ReactNode;
  children: ReactElement<Record<string, unknown>>;
  kbd?: string;
  side?: TooltipSide;
  wrap?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  tooltipId?: string;
  flip?: boolean;
}

const GAP = { top: 6, right: 6, left: 6, bottom: 4 };

function isFocusVisible(target: EventTarget): boolean {
  try {
    return (target as Element).matches(":focus-visible");
  } catch {
    return true;
  }
}

export function Tooltip({
  content,
  children,
  kbd,
  side = "bottom",
  wrap,
  open: openProp,
  onOpenChange,
  tooltipId,
  flip = true,
  className,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  onFocus,
  onBlur,
  ref,
  ...rest
}: TooltipProps) {
  const id = useStableId(tooltipId);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const anchorMergedRef = useMergedRefs(anchorRef, ref);
  const [open, setOpen] = useControlled<boolean>(openProp, false, onOpenChange);

  const show = useCallback(() => {
    if (anchorRef.current?.querySelector('[aria-expanded="true"]')) return;
    setOpen(true);
  }, [setOpen]);

  return (
    // oxlint-disable-next-line jsx-a11y/no-static-element-interactions -- обёртка якоря только ловит всплывшие события наведения и фокуса дочернего элемента
    <span
      {...rest}
      ref={anchorMergedRef}
      className={cx("ds-tooltip-anchor", className)}
      onMouseEnter={(event) => {
        onMouseEnter?.(event);
        show();
      }}
      onMouseLeave={(event) => {
        onMouseLeave?.(event);
        setOpen(false);
      }}
      onMouseDown={(event) => {
        onMouseDown?.(event);
        setOpen(false);
      }}
      onFocus={(event) => {
        onFocus?.(event);
        if (isFocusVisible(event.target)) show();
      }}
      onBlur={(event) => {
        onBlur?.(event);
        setOpen(false);
      }}
    >
      {cloneElement(children, { "aria-describedby": id })}
      <Layer
        open={open}
        anchorRef={anchorRef}
        onDismiss={() => setOpen(false)}
        scroll
        side={side}
        align="center"
        gap={GAP}
        flip={flip}
        id={id}
        role="tooltip"
        className={cx("ds-tooltip", wrap && "ds-tooltip--wrap")}
      >
        <span className="ds-tooltip__text">{content}</span>
        {kbd ? <span className="ds-tooltip__kbd">{kbd}</span> : null}
      </Layer>
    </span>
  );
}
