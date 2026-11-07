/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ComponentPropsWithRef } from "react";
import { cx } from "../../ui/internal";
import { InputFrame, useFieldIds, type FieldChrome } from "./InputFrame";
import { useTextValue } from "./useTextValue";

export interface TextareaProps
  extends ComponentPropsWithRef<"textarea">, Omit<FieldChrome, "clearable" | "lead" | "kbd"> {
  onValueChange?: (value: string) => void;
  fieldClassName?: string;
}

export function Textarea({
  label,
  hint,
  error,
  unit,
  compact,
  invalid,
  value,
  defaultValue,
  placeholder,
  rows = 3,
  onChange,
  onValueChange,
  className,
  fieldClassName,
  disabled,
  ...rest
}: TextareaProps) {
  const [current, setOwn] = useTextValue(value, defaultValue);
  const ids = useFieldIds({ label, hint, error, invalid });
  const { links } = ids;
  return (
    <InputFrame
      label={label}
      hint={hint}
      error={error}
      unit={unit}
      compact={compact}
      invalid={invalid}
      disabled={disabled}
      className={fieldClassName}
      area
      hasValue={false}
      onClear={() => undefined}
      ids={ids}
    >
      <textarea
        aria-label={label ? undefined : placeholder}
        {...links}
        {...rest}
        aria-labelledby={rest["aria-labelledby"] ?? links["aria-labelledby"]}
        aria-describedby={cx(rest["aria-describedby"], links["aria-describedby"]) || undefined}
        rows={rows}
        className={cx("ds-input__control", className)}
        value={current}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) => {
          setOwn(event.target.value);
          onChange?.(event);
          onValueChange?.(event.target.value);
        }}
      />
    </InputFrame>
  );
}
