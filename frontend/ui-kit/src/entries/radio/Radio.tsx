/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { createContext, use, type ComponentPropsWithRef, type ReactNode } from "react";
import { cx } from "../../ui/internal";
import "./radio.css";

export type RadioVariant = "list" | "row" | "cards";

export interface RadioGroupContext {
  name: string;
  value: string | undefined;
  variant: RadioVariant;
  invalid: boolean;
  select: (value: string) => void;
}

export const GroupContext = createContext<RadioGroupContext | null>(null);

export interface RadioProps extends Omit<ComponentPropsWithRef<"input">, "type" | "size"> {
  hint?: ReactNode;
  invalid?: boolean;
}

export function Radio({
  hint,
  invalid,
  className,
  children,
  name,
  value,
  checked,
  onChange,
  ...rest
}: RadioProps) {
  const group = use(GroupContext);
  const grouped = group && typeof value === "string";
  const labelled = (children != null && children !== false) || !!hint;
  const control = (
    <input
      {...rest}
      type="radio"
      name={grouped ? group.name : name}
      value={value}
      className={cx("ds-radio", !labelled && className)}
      checked={grouped ? group.value === value : checked}
      data-invalid={invalid || group?.invalid || undefined}
      onChange={(event) => {
        if (grouped) group.select(value);
        onChange?.(event);
      }}
    />
  );
  if (!labelled) return control;
  const card = group?.variant === "cards";
  const Title = card ? "b" : "span";
  return (
    <label className={cx(card ? "ds-radio__card" : "ds-radio__opt", className)}>
      {control}
      <span className="ds-radio__text">
        {children != null && children !== false ? <Title>{children}</Title> : null}
        {hint ? <small>{hint}</small> : null}
      </span>
    </label>
  );
}
