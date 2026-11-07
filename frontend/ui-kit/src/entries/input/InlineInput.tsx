/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ComponentPropsWithRef } from "react";
import { cx } from "../../ui/internal";
import { useTextValue } from "./useTextValue";
import "./input.css";

export interface InlineInputProps extends Omit<ComponentPropsWithRef<"input">, "width"> {
  width?: number;
  invalid?: boolean;
  onValueChange?: (value: string) => void;
  wrapperClassName?: string;
}

export function InlineInput({
  width,
  invalid,
  value,
  defaultValue,
  onChange,
  onValueChange,
  className,
  wrapperClassName,
  style,
  type = "text",
  ...rest
}: InlineInputProps) {
  const [current, setOwn] = useTextValue(value, defaultValue);
  return (
    <label className={cx("ds-input-inline", wrapperClassName)} data-invalid={invalid || undefined}>
      <input
        {...rest}
        type={type}
        className={className}
        style={width === undefined ? style : { width, ...style }}
        value={current}
        aria-invalid={invalid || rest["aria-invalid"]}
        onChange={(event) => {
          setOwn(event.target.value);
          onChange?.(event);
          onValueChange?.(event.target.value);
        }}
      />
    </label>
  );
}
