/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { Icon, cx, useControlled, useMergedRefs } from "../../ui/internal";
import agentLogo from "@/ui/assets/ai-logo-1.png";
import { Badge } from "../badge/Badge";
import "./agent-tab.css";

export interface AgentTabProps extends Omit<
  ComponentPropsWithRef<"button">,
  "children" | "onToggle"
> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  badge?: boolean | number;
  hint?: string;
  logo?: ReactNode;
  y?: number;
  defaultY?: number;
  onYChange?: (y: number) => void;
  draggable?: boolean;
  attachTo?: RefObject<HTMLElement | null>;
  hidden?: boolean;
  openLabel?: string;
  closeLabel?: string;
  badgeLabel?: string;
}

const MIN_Y = 24;
const MARGIN_BOTTOM = 70;
const DRAG_THRESHOLD = 4;
const TRACK_DELAY_MS = 400;

function clampY(value: number, host: HTMLElement | null): number {
  const height = host?.offsetParent?.clientHeight ?? window.innerHeight;
  return Math.max(MIN_Y, Math.min(height - MARGIN_BOTTOM, value));
}

export function AgentTab({
  open = false,
  onOpenChange,
  badge,
  hint = "Ctrl J",
  logo,
  y: yProp,
  defaultY,
  onYChange,
  draggable = true,
  attachTo,
  hidden,
  openLabel = "Открыть агента",
  closeLabel = "Свернуть агента",
  badgeLabel = "есть предложение",
  className,
  style,
  onClick,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  ref,
  ...rest
}: AgentTabProps) {
  const emitY = useCallback(
    (next: number | undefined) => {
      if (next !== undefined) onYChange?.(next);
    },
    [onYChange],
  );
  const [y, setY] = useControlled<number | undefined>(yProp, defaultY, emitY);
  const [dragging, setDragging] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [right, setRight] = useState(0);
  const button = useRef<HTMLButtonElement | null>(null);
  const buttonRef = useMergedRefs(button, ref);
  const moved = useRef(false);
  const start = useRef<{ y: number; top: number } | null>(null);
  const count = typeof badge === "number" ? badge : 1;

  useLayoutEffect(() => {
    const target = attachTo?.current;
    if (!open || !target) return;
    // oxlint-disable-next-line react/set-state-in-effect -- ширина панели измеряется в DOM и повторяется при её изменении
    setRight(target.offsetWidth);
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => setRight(target.offsetWidth));
    observer.observe(target);
    return () => observer.disconnect();
  }, [open, attachTo]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => setTracking(true), TRACK_DELAY_MS);
    return () => {
      window.clearTimeout(timer);
      setTracking(false);
    };
  }, [open]);

  const label = open ? closeLabel : `${openLabel}${badge ? `, ${badgeLabel}` : ""}`;

  return (
    <button
      type="button"
      {...rest}
      ref={buttonRef}
      className={cx("ds-agent-tab", className)}
      style={
        {
          ...(y === undefined ? null : { "--ds-agent-tab-y": `${y}px` }),
          ...(open && !hidden && attachTo ? { right } : null),
          ...style,
        } as CSSProperties
      }
      data-open={open || undefined}
      data-tracking={(open && tracking) || undefined}
      data-drag={dragging || undefined}
      data-hide={hidden || undefined}
      aria-label={label}
      aria-expanded={open}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        if (open || !draggable) return;
        const top = y ?? event.currentTarget.offsetTop;
        start.current = { y: event.clientY, top };
        moved.current = false;
        event.currentTarget.setPointerCapture?.(event.pointerId);
      }}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        if (!start.current) return;
        const delta = event.clientY - start.current.y;
        if (Math.abs(delta) > DRAG_THRESHOLD) {
          moved.current = true;
          setDragging(true);
          setY(clampY(start.current.top + delta, button.current));
        }
      }}
      onPointerUp={(event) => {
        onPointerUp?.(event);
        start.current = null;
        setDragging(false);
      }}
      onClick={(event) => {
        if (moved.current) {
          moved.current = false;
          event.preventDefault();
          return;
        }
        onClick?.(event);
        if (!event.defaultPrevented) onOpenChange?.(!open);
      }}
    >
      <span className="ds-agent-tab__logo">
        {logo ?? <img className="ds-agent-mark" src={agentLogo} alt="" />}
        {badge ? (
          <span className="ds-agent-tab__badge">
            <Badge form="counter" pulse>
              {count}
            </Badge>
          </span>
        ) : null}
      </span>
      <span className="ds-agent-tab__more">
        <b>Агент</b>
        <small>{hint}</small>
      </span>
      <span className="ds-agent-tab__x">
        <Icon name="chevr" size="md" />
      </span>
    </button>
  );
}
