/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ComponentPropsWithRef, ReactNode } from "react";
import { cx } from "../../ui/internal";
import "./switch.css";

export interface SettingRowProps extends Omit<ComponentPropsWithRef<"label">, "title"> {
  title: ReactNode;
  hint?: ReactNode;
}

export function SettingRow({ title, hint, className, children, ...rest }: SettingRowProps) {
  return (
    <label {...rest} className={cx("ds-switch__row", className)}>
      <span className="ds-switch__text">
        <b>{title}</b>
        {hint ? <small>{hint}</small> : null}
      </span>
      {children}
    </label>
  );
}
