/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ComponentPropsWithRef } from "react";
import { cx, Icon } from "../../ui/internal";
import { useTextValue } from "./useTextValue";
import "./input.css";

export interface SearchInputProps extends ComponentPropsWithRef<"input"> {
  onValueChange?: (value: string) => void;
  wrapperClassName?: string;
}

export function SearchInput({
  value,
  defaultValue,
  placeholder = "Поиск",
  onChange,
  onValueChange,
  onKeyDown,
  className,
  wrapperClassName,
  type = "text",
  ...rest
}: SearchInputProps) {
  const [current, setOwn] = useTextValue(value, defaultValue);
  return (
    <label className={cx("ds-input-search", wrapperClassName)}>
      <Icon name="search" />
      <input
        role="searchbox"
        aria-label={placeholder}
        {...rest}
        type={type}
        className={className}
        value={current}
        placeholder={placeholder}
        onChange={(event) => {
          setOwn(event.target.value);
          onChange?.(event);
          onValueChange?.(event.target.value);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.key === "Escape" && current !== "" && !event.defaultPrevented) {
            event.preventDefault();
            event.stopPropagation();
            setOwn("");
            onValueChange?.("");
          }
        }}
      />
    </label>
  );
}
