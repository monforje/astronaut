/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ComponentPropsWithRef, Ref } from "react";
import { cx } from "../../ui/internal";
import "./separator.css";

export type SeparatorOrientation = "horizontal" | "vertical";

export interface SeparatorProps extends ComponentPropsWithRef<"div"> {
  orientation?: SeparatorOrientation;
  strong?: boolean;
  decorative?: boolean;
}

export function Separator({
  orientation = "horizontal",
  strong,
  decorative,
  className,
  children,
  ref,
  ...rest
}: SeparatorProps) {
  if (orientation === "horizontal" && children != null && children !== false) {
    return (
      <div
        {...rest}
        ref={ref}
        role={decorative ? "none" : "separator"}
        className={cx("ds-sep-l", className)}
      >
        {children}
      </div>
    );
  }
  return (
    <hr
      {...rest}
      ref={ref as Ref<HTMLHRElement>}
      role={decorative ? "none" : undefined}
      aria-orientation={orientation === "vertical" && !decorative ? "vertical" : undefined}
      className={cx(
        orientation === "vertical" ? "ds-sep-v" : "ds-sep",
        strong && orientation === "horizontal" && "ds-sep--strong",
        className,
      )}
    />
  );
}
