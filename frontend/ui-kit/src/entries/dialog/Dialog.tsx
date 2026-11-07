/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useRef, type ComponentPropsWithRef, type ReactNode } from "react";
import { Portal, cx, useMergedRefs, useModal, usePresence, useStableId } from "../../ui/internal";
import "./dialog.css";

export type DialogSize = "sm" | "md" | "lg";

export interface DialogPanelProps extends Omit<ComponentPropsWithRef<"div">, "title"> {
  title: ReactNode;
  size?: DialogSize;
  footer?: ReactNode;
  error?: ReactNode;
  flush?: boolean;
  role?: "dialog" | "alertdialog";
  titleId?: string;
}

export function DialogPanel({
  title,
  size = "md",
  footer,
  error,
  flush,
  role = "dialog",
  titleId,
  className,
  children,
  ...rest
}: DialogPanelProps) {
  const headingId = useStableId(titleId);
  return (
    <div
      aria-modal="true"
      aria-labelledby={headingId}
      tabIndex={-1}
      {...rest}
      className={cx("ds-dialog", `ds-dialog--${size}`, className)}
      role={role}
    >
      <div className="ds-dialog__header">
        <div className="ds-dialog__title" id={headingId}>
          {title}
        </div>
      </div>
      <div className="ds-dialog__main" data-ds-modal-main>
        <div className={cx("ds-dialog__inner", flush && "ds-dialog__inner--flush")}>{children}</div>
      </div>
      {error ? <div className="ds-dialog__error">{error}</div> : null}
      {footer ? <div className="ds-dialog__footer">{footer}</div> : null}
    </div>
  );
}

export interface DialogProps extends DialogPanelProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  busy?: boolean;
  container?: HTMLElement | null;
}

export function Dialog({ open, onOpenChange, busy, container, ref, ...panel }: DialogProps) {
  const host = container === undefined ? document.body : container;
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelMergedRef = useMergedRefs(panelRef, ref);
  const { mounted, closing } = usePresence(open);
  useModal({
    open,
    overlayRef,
    panelRef,
    host: host ?? document.body,
    busy,
    onClose: () => onOpenChange?.(false),
    lockScroll: container === undefined,
  });
  if (!mounted || !host) return null;
  return (
    <Portal host={host}>
      <div
        ref={overlayRef}
        className="ds-dialog-overlay"
        role="presentation"
        data-out={closing || undefined}
      >
        <DialogPanel {...panel} ref={panelMergedRef} aria-busy={busy || undefined} />
      </div>
    </Portal>
  );
}
