/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ComponentPropsWithRef } from "react";
import { cx } from "../../ui/internal";
import "./loader.css";

export const LOADER_SRC = `${import.meta.env.BASE_URL}brand/animated/loader.svg`;
export const MARK_SRC = `${import.meta.env.BASE_URL}brand/animated/logo-mark.svg`;

export type LoaderSize = "sm" | "md" | "page";

export interface LoaderProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
  size?: LoaderSize;
  label?: string;
  hint?: string;
  fill?: boolean;
}

export function Loader({
  size = "md",
  label = "Загружаем",
  hint,
  fill,
  className,
  ...rest
}: LoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      {...rest}
      className={cx(
        "ds-loader",
        size !== "md" && `ds-loader--${size}`,
        fill && "ds-loader--fill",
        className,
      )}
    >
      <img className="ds-loader__img" src={LOADER_SRC} alt="" />
      <span className="ds-loader__label">{label}</span>
      {hint ? <span className="ds-loader__sub">{hint}</span> : null}
    </div>
  );
}
