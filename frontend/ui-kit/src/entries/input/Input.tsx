/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useRef, type ComponentPropsWithRef } from "react";
import { cx, useMergedRefs } from "../../ui/internal";
import { InputFrame, useFieldIds, type FieldChrome } from "./InputFrame";
import { useTextValue } from "./useTextValue";

export interface InputProps extends ComponentPropsWithRef<"input">, FieldChrome {
  numeric?: boolean;
  onValueChange?: (value: string) => void;
  onClear?: () => void;
  fieldClassName?: string;
}

export function Input({
  label,
  hint,
  error,
  lead,
  unit,
  kbd,
  clearable,
  compact,
  invalid,
  numeric,
  value,
  defaultValue,
  placeholder,
  onChange,
  onValueChange,
  onClear,
  onKeyDown,
  className,
  fieldClassName,
  disabled,
  type = "text",
  ref,
  ...rest
}: InputProps) {
  const [current, setOwn] = useTextValue(value, defaultValue);
  const element = useRef<HTMLInputElement>(null);
  const inputRef = useMergedRefs(element, ref);
  const ids = useFieldIds({ label, hint, error, invalid });
  const { links } = ids;
  const clear = () => {
    setOwn("");
    onValueChange?.("");
    onClear?.();
    element.current?.focus();
  };
  return (
    <InputFrame
      label={label}
      hint={hint}
      error={error}
      lead={lead}
      unit={unit}
      kbd={kbd}
      compact={compact}
      invalid={invalid}
      disabled={disabled}
      className={fieldClassName}
      hasValue={!!clearable && current !== ""}
      onClear={clear}
      ids={ids}
    >
      <input
        aria-label={label ? undefined : placeholder}
        {...links}
        {...rest}
        aria-labelledby={rest["aria-labelledby"] ?? links["aria-labelledby"]}
        aria-describedby={cx(rest["aria-describedby"], links["aria-describedby"]) || undefined}
        ref={inputRef}
        type={type}
        className={cx("ds-input__control", numeric && "ds-input__control--num", className)}
        value={current}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) => {
          setOwn(event.target.value);
          onChange?.(event);
          onValueChange?.(event.target.value);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.key === "Escape" && clearable && current !== "" && !event.defaultPrevented) {
            event.preventDefault();
            event.stopPropagation();
            clear();
          }
        }}
      />
    </InputFrame>
  );
}
