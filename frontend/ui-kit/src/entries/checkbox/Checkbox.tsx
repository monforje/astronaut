/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import {
  createContext,
  use,
  useEffect,
  useRef,
  type ComponentPropsWithRef,
  type ReactNode,
} from "react";
import { cx, useControlled, useMergedRefs, useStableId } from "../../ui/internal";
import "./checkbox.css";

export type CheckboxVariant = "plain" | "card";

export interface CheckboxGroupContext {
  value: readonly string[];
  toggle: (value: string, checked: boolean) => void;
}

export const GroupContext = createContext<CheckboxGroupContext | null>(null);

export interface CheckboxProps extends Omit<ComponentPropsWithRef<"input">, "type" | "size"> {
  variant?: CheckboxVariant;
  indeterminate?: boolean;
  invalid?: boolean;
  hint?: ReactNode;
  onCheckedChange?: (checked: boolean) => void;
}

export function Checkbox({
  variant = "plain",
  indeterminate,
  invalid,
  hint,
  checked,
  defaultChecked = false,
  onCheckedChange,
  onChange,
  className,
  children,
  ref,
  value,
  ...rest
}: CheckboxProps) {
  const context = use(GroupContext);
  const group = typeof value === "string" && context ? { ...context, item: value } : null;
  const [own, setOwn] = useControlled(checked, defaultChecked, onCheckedChange);
  const on = group ? group.value.includes(group.item) : own;
  const element = useRef<HTMLInputElement>(null);
  const mergedRef = useMergedRefs(element, ref);
  const hintId = useStableId();

  useEffect(() => {
    if (element.current) element.current.indeterminate = !!indeterminate;
  });

  const describedBy = [rest["aria-describedby"], hint ? hintId : undefined]
    .filter(Boolean)
    .join(" ");
  const control = (
    <input
      {...rest}
      ref={mergedRef}
      type="checkbox"
      value={value}
      className={cx("ds-check", !hasText(children, hint) && className)}
      checked={on}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy || undefined}
      onChange={(event) => {
        group?.toggle(group.item, event.target.checked);
        onChange?.(event);
        setOwn(event.target.checked);
      }}
    />
  );
  if (!hasText(children, hint)) return control;
  const Title = variant === "card" ? "b" : "span";
  return (
    <label className={cx(variant === "card" ? "ds-check__card" : "ds-check__opt", className)}>
      {control}
      <span className="ds-check__text">
        {children != null && children !== false ? <Title>{children}</Title> : null}
        {hint ? (
          <small id={hintId} data-error={invalid || undefined}>
            {hint}
          </small>
        ) : null}
      </span>
    </label>
  );
}

function hasText(children: ReactNode, hint: ReactNode) {
  return (children != null && children !== false) || !!hint;
}
