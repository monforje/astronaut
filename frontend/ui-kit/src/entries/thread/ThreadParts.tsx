/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ComponentPropsWithRef, RefObject } from "react";
import { Icon, Layer, type DismissReason, type IconName } from "../../ui/internal";
import type { CalendarDayData } from "../calendar/Calendar";
import { Tooltip } from "../tooltip";

export type ThreadLayerPlace = "msg" | "top";

export interface ThreadLayerProps extends ComponentPropsWithRef<"div"> {
  place: ThreadLayerPlace;
  inline?: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  onDismiss: (reason: DismissReason) => void;
}

export function ThreadLayer({ place, inline, anchorRef, onDismiss, ...rest }: ThreadLayerProps) {
  if (inline) return <div {...rest} data-inline={place} />;
  const top = place === "top";
  return (
    <Layer
      {...rest}
      open
      anchorRef={anchorRef}
      onDismiss={onDismiss}
      side={top ? "top" : "bottom"}
      align={top ? "start" : "end"}
      gap={top ? 6 : -4}
      flip={!top}
    />
  );
}

export interface ThreadIconButtonProps extends Omit<ComponentPropsWithRef<"button">, "children"> {
  icon: IconName;
  label: string;
  on?: boolean;
  menu?: "more" | "emoji";
}

export function ThreadIconButton({
  icon,
  label,
  on,
  menu,
  type = "button",
  ...rest
}: ThreadIconButtonProps & CalendarDayData) {
  return (
    <Tooltip content={label} side="top">
      <button
        {...rest}
        type={type}
        className="ds-thread__ib"
        aria-label={label}
        aria-haspopup={rest["aria-expanded"] !== undefined ? "menu" : undefined}
        data-on={on || undefined}
        data-menu={menu}
      >
        <Icon name={icon} size="sm" />
      </button>
    </Tooltip>
  );
}

export function ThreadTyping({ name }: { name: string }) {
  return (
    <div className="ds-thread__typing" aria-live="polite">
      <span className="ds-thread__dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      {name} печатает…
    </div>
  );
}
