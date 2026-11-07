/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ComponentPropsWithRef } from "react";
import { cx } from "./cx";
import { ICONS, type IconName } from "./icon-paths";

export type { IconName };
export type IconSize = "xs" | "sm" | "md" | "xl";

export interface IconProps extends Omit<
  ComponentPropsWithRef<"svg">,
  "children" | "name" | "dangerouslySetInnerHTML"
> {
  name: IconName;
  size?: IconSize;
}

export function Icon({ name, size, className, "aria-label": label, ...rest }: IconProps) {
  const labelled = label !== undefined;
  return (
    <svg
      aria-hidden={labelled ? undefined : true}
      role={labelled ? "img" : undefined}
      focusable="false"
      {...rest}
      aria-label={label}
      className={cx("ds-icon", size && `ds-icon--${size}`, className)}
      viewBox="0 0 24 24"
      dangerouslySetInnerHTML={{ __html: ICONS[name] }}
    />
  );
}
