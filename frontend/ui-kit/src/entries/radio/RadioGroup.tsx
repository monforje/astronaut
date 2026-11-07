/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ComponentPropsWithRef, ReactNode } from "react";
import { cx, useControlled, useIds } from "../../ui/internal";
import { GroupContext, type RadioVariant } from "./Radio";
import "./radio.css";

export interface RadioGroupProps extends Omit<
  ComponentPropsWithRef<"div">,
  "defaultValue" | "onChange"
> {
  label: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  variant?: RadioVariant;
  invalid?: boolean;
  error?: ReactNode;
}

const GROUP_CLASS: Record<RadioVariant, string> = {
  list: "ds-radio__group",
  row: "ds-radio__group ds-radio__group--row",
  cards: "ds-radio__cards ds-radio__cards--two",
};

export function RadioGroup({
  label,
  name,
  value,
  defaultValue,
  onValueChange,
  variant = "list",
  invalid,
  error,
  className,
  children,
  ref,
  ...rest
}: RadioGroupProps) {
  const ids = useIds(["group", "error"]);
  const [current, setCurrent] = useControlled<string | undefined>(
    value,
    defaultValue,
    onValueChange as ((next: string | undefined) => void) | undefined,
  );
  const errorId = ids.error;
  const select = (next: string) => {
    if (next !== current) setCurrent(next);
  };
  return (
    <GroupContext
      value={{ name: name ?? ids.group, value: current, variant, invalid: !!invalid, select }}
    >
      <div>
        <div
          {...rest}
          ref={ref}
          role="radiogroup"
          aria-label={label}
          aria-invalid={invalid || undefined}
          aria-describedby={error ? errorId : undefined}
          className={cx(GROUP_CLASS[variant], className)}
        >
          {children}
        </div>
        {error ? (
          <div className="ds-radio__error" id={errorId}>
            {error}
          </div>
        ) : null}
      </div>
    </GroupContext>
  );
}
