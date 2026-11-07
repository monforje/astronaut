/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useRef, type ComponentPropsWithRef, type ReactNode } from "react";
import {
  Icon,
  Portal,
  cx,
  useControlled,
  useMergedRefs,
  useModal,
  usePresence,
  useStableId,
} from "../../ui/internal";
import { Button } from "../button/Button";
import "./sheet.css";

export type SheetSize = "panel" | "wide" | "full";

export const SHEET_NEXT_SIZE: Record<SheetSize, SheetSize> = {
  panel: "wide",
  wide: "full",
  full: "panel",
};

const SIZE_ICON = { panel: "wide", wide: "expand", full: "shrink" } as const;

export const SHEET_SIZE_LABEL: Record<SheetSize, string> = {
  panel: "Расширить",
  wide: "На весь экран",
  full: "Свернуть в панель",
};

export interface SheetPanelProps extends Omit<ComponentPropsWithRef<"aside">, "title"> {
  title: ReactNode;
  description?: ReactNode;
  size?: SheetSize;
  footer?: ReactNode;
  resizable?: boolean;
  onResize?: () => void;
  onClose?: () => void;
  closeLabel?: string;
  titleId?: string;
  sizeButtonProps?: ComponentPropsWithRef<"button">;
  closeButtonProps?: ComponentPropsWithRef<"button">;
}

export function SheetPanel({
  title,
  description,
  size = "panel",
  footer,
  resizable = true,
  onResize,
  onClose,
  closeLabel = "Закрыть",
  titleId,
  sizeButtonProps,
  closeButtonProps,
  className,
  children,
  ...rest
}: SheetPanelProps) {
  const headingId = useStableId(titleId);
  return (
    <aside
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
      tabIndex={-1}
      {...rest}
      className={cx("ds-sheet", className)}
      data-size={size}
    >
      <div className="ds-sheet__header">
        <div className="ds-sheet__head">
          <div className="ds-sheet__title" id={headingId}>
            {title}
          </div>
          {description ? <div className="ds-sheet__desc">{description}</div> : null}
        </div>
        <div className="ds-sheet__actions">
          {resizable ? (
            <Button
              variant="ghost"
              square
              aria-label={SHEET_SIZE_LABEL[size]}
              {...sizeButtonProps}
              onClick={(event) => {
                sizeButtonProps?.onClick?.(event);
                onResize?.();
              }}
            >
              <Icon name={SIZE_ICON[size]} />
            </Button>
          ) : null}
          <Button
            variant="ghost"
            square
            aria-label={closeLabel}
            {...closeButtonProps}
            onClick={(event) => {
              closeButtonProps?.onClick?.(event);
              onClose?.();
            }}
          >
            <Icon name="x" />
          </Button>
        </div>
      </div>
      <div className="ds-sheet__main" data-ds-modal-main>
        <div className="ds-sheet__inner">{children}</div>
      </div>
      {footer ? <div className="ds-sheet__footer">{footer}</div> : null}
    </aside>
  );
}

export interface SheetProps extends Omit<SheetPanelProps, "onResize" | "onClose"> {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  size?: SheetSize;
  defaultSize?: SheetSize;
  onSizeChange?: (size: SheetSize) => void;
  busy?: boolean;
  container?: HTMLElement | null;
}

export function Sheet({
  open,
  onOpenChange,
  size: sizeProp,
  defaultSize = "panel",
  onSizeChange,
  busy,
  container,
  ref,
  ...panel
}: SheetProps) {
  const host = container === undefined ? document.body : container;
  const [size, setSize] = useControlled<SheetSize>(sizeProp, defaultSize, onSizeChange);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const panelMergedRef = useMergedRefs(panelRef, ref);
  const { mounted, closing } = usePresence(open);
  const requestClose = () => {
    if (!busy) onOpenChange?.(false);
  };
  useModal({
    open,
    overlayRef,
    panelRef,
    host: host ?? document.body,
    busy,
    onClose: () => onOpenChange?.(false),
    lockScroll: container === undefined,
    focusFallback: "panel",
  });
  if (!mounted || !host) return null;
  return (
    <Portal host={host}>
      <div
        ref={overlayRef}
        className="ds-sheet-root"
        role="presentation"
        data-size={size}
        data-out={closing || undefined}
      >
        {/* oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- клавиатурный эквивалент: Esc и крест в шапке */}
        <div className="ds-sheet-scrim" onClick={requestClose} />
        <SheetPanel
          {...panel}
          ref={panelMergedRef}
          size={size}
          aria-busy={busy || undefined}
          onClose={requestClose}
          onResize={() => setSize(SHEET_NEXT_SIZE[size])}
        />
      </div>
    </Portal>
  );
}
