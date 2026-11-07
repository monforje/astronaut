/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import {
  useEffect,
  useLayoutEffect,
  useRef,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Icon, cx, useMergedRefs, usePresence } from "../../ui/internal";
import agentLogo from "../../ui/assets/ai-logo-1.png";
import { Button } from "../button/Button";
import "./agent-tab.css";

export interface AgentBubbleProps extends Omit<ComponentPropsWithRef<"div">, "title"> {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: ReactNode;
  logo?: ReactNode;
  actions?: ReactNode;
  anchorY?: number;
  duration?: number;
  closeLabel?: string;
}

const GAP_ABOVE_TAB = 14;
const MIN_TOP = 8;
export const AGENT_BUBBLE_DURATION_MS = 14000;

export function AgentBubble({
  open,
  onOpenChange,
  title = "Агент",
  logo,
  actions,
  anchorY,
  duration = AGENT_BUBBLE_DURATION_MS,
  closeLabel = "Закрыть",
  className,
  style,
  children,
  ref,
  ...rest
}: AgentBubbleProps) {
  const { mounted, closing } = usePresence(open);
  const node = useRef<HTMLDivElement | null>(null);
  const nodeRef = useMergedRefs(node, ref);

  useEffect(() => {
    if (!open || !Number.isFinite(duration) || duration <= 0) return;
    const timer = window.setTimeout(() => onOpenChange?.(false), duration);
    return () => window.clearTimeout(timer);
  }, [open, duration, onOpenChange]);

  useLayoutEffect(() => {
    const el = node.current;
    if (!mounted || !el || anchorY === undefined) return;
    el.style.top = `${Math.max(MIN_TOP, anchorY - el.offsetHeight - GAP_ABOVE_TAB)}px`;
  }, [mounted, anchorY]);

  if (!mounted) return null;
  return (
    <div
      aria-label="Предложение агента"
      {...rest}
      ref={nodeRef}
      className={cx("ds-agent-tab__bubble", className)}
      role="dialog"
      style={style as CSSProperties | undefined}
      data-out={closing || undefined}
    >
      <div className="ds-agent-tab__bub-head">
        {logo ?? <img className="ds-agent-mark" src={agentLogo} alt="" />}
        <b>{title}</b>
        <Button
          variant="ghost"
          size="xs"
          square
          aria-label={closeLabel}
          onClick={() => onOpenChange?.(false)}
        >
          <Icon name="x" size="sm" />
        </Button>
      </div>
      <p>{children}</p>
      {actions ? <div className="ds-agent-tab__bub-actions">{actions}</div> : null}
    </div>
  );
}
