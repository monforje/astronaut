/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ComponentPropsWithRef } from "react";
import { cx } from "../../ui/internal";
import "./button.css";

export type ButtonGroupProps = ComponentPropsWithRef<"span">;

export function ButtonGroup({ className, ...rest }: ButtonGroupProps) {
  return <span role="group" {...rest} className={cx("ds-btn-group", className)} />;
}
