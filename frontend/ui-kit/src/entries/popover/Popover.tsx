/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import {
  cloneElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { Layer, cx, useMergedRefs, useStableId, type Align, type Side } from "../../ui/internal";
import "./popover.css";

export interface PopoverApi {
  close: () => void;
}

export interface PopoverProps extends Omit<ComponentPropsWithRef<"div">, "children" | "title"> {
  trigger: ReactElement<ComponentPropsWithRef<"button">>;
  children: ReactNode | ((api: PopoverApi) => ReactNode);
  label: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: Side;
  align?: Align;
  focusOnOpen?: boolean;
  flip?: boolean;
}

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function Popover({
  trigger,
  children,
  label,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  side = "bottom",
  align = "start",
  focusOnOpen = true,
  flip = true,
  className,
  ref,
  ...rest
}: PopoverProps) {
  const [openState, setOpenState] = useState(defaultOpen);
  const open = openProp ?? openState;
  const anchorRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const triggerProps = trigger.props;
  const triggerMergedRef = useMergedRefs(triggerProps.ref, triggerRef);
  const cardMergedRef = useMergedRefs(cardRef, ref);
  const wasOpen = useRef(open);
  const panelId = useStableId();

  const setOpen = useCallback(
    (next: boolean) => {
      if (openProp === undefined) setOpenState(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange],
  );

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, [setOpen]);

  useEffect(() => {
    if (open && !wasOpen.current && focusOnOpen) {
      const card = cardRef.current;
      (card?.querySelector<HTMLElement>(FOCUSABLE) ?? card)?.focus({ preventScroll: true });
    }
    wasOpen.current = open;
  }, [open, focusOnOpen]);

  return (
    <span className="ds-popover-anchor" ref={anchorRef}>
      {cloneElement(trigger, {
        ref: triggerMergedRef,
        "aria-haspopup": "dialog",
        "aria-expanded": open,
        "aria-controls": open ? panelId : undefined,
        onClick: (event: MouseEvent<HTMLButtonElement>) => {
          triggerProps.onClick?.(event);
          if (!event.defaultPrevented) setOpen(!open);
        },
      })}
      <Layer
        {...rest}
        open={open}
        anchorRef={anchorRef}
        onDismiss={() => setOpen(false)}
        returnFocusRef={triggerRef}
        scroll
        side={side}
        align={align}
        gap={4}
        flip={flip}
        id={panelId}
        ref={cardMergedRef}
        className={cx("ds-popover", className)}
        role="dialog"
        aria-label={label}
        tabIndex={-1}
      >
        {/* oxlint-disable-next-line react/refs -- close вызывается из обработчиков, не во время рендера */}
        {typeof children === "function" ? children({ close }) : children}
      </Layer>
    </span>
  );
}

export function PopoverHead({ className, ...rest }: ComponentPropsWithRef<"div">) {
  return <div {...rest} className={cx("ds-popover__head", className)} />;
}

export function PopoverBody({ className, ...rest }: ComponentPropsWithRef<"div">) {
  return <div {...rest} className={cx("ds-popover__body", className)} />;
}

export function PopoverFoot({ className, ...rest }: ComponentPropsWithRef<"div">) {
  return <div {...rest} className={cx("ds-popover__foot", className)} />;
}
