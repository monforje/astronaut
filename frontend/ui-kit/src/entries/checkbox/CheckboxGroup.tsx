/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Children, isValidElement, type ComponentPropsWithRef, type ReactNode } from "react";
import { useControlled } from "../../ui/internal";
import { Checkbox, GroupContext, type CheckboxProps } from "./Checkbox";
import "./checkbox.css";

export interface CheckboxGroupProps extends Omit<
  ComponentPropsWithRef<"div">,
  "defaultValue" | "onChange"
> {
  label: string;
  value?: readonly string[];
  defaultValue?: readonly string[];
  onValueChange?: (value: string[]) => void;
  selectAll?: boolean;
  selectAllLabel?: string;
  children: ReactNode;
}

const NONE: readonly string[] = [];

function itemValues(children: ReactNode): string[] {
  const values: string[] = [];
  for (const child of Children.toArray(children)) {
    if (!isValidElement<Partial<CheckboxProps>>(child)) continue;
    const { value, disabled } = child.props;
    if (typeof value === "string" && !disabled) values.push(value);
  }
  return values;
}

export function CheckboxGroup({
  label,
  value,
  defaultValue = NONE,
  onValueChange,
  selectAll,
  selectAllLabel = "Выбрать все",
  className,
  children,
  ...rest
}: CheckboxGroupProps) {
  const [current, commit] = useControlled<readonly string[]>(
    value,
    defaultValue,
    onValueChange as ((next: readonly string[]) => void) | undefined,
  );
  const all = itemValues(children);
  const picked = all.filter((v) => current.includes(v));

  const toggle = (item: string, checked: boolean) =>
    commit(
      checked ? [...current.filter((v) => v !== item), item] : current.filter((v) => v !== item),
    );

  return (
    <GroupContext value={{ value: current, toggle }}>
      <div {...rest} role="group" aria-label={label} className={className}>
        {selectAll ? (
          <>
            <Checkbox
              aria-label={selectAllLabel}
              checked={all.length > 0 && picked.length === all.length}
              indeterminate={picked.length > 0 && picked.length < all.length}
              hint={`Выбрано ${picked.length} из ${all.length}`}
              onCheckedChange={(checked) =>
                commit(
                  checked
                    ? [...current.filter((v) => !all.includes(v)), ...all]
                    : current.filter((v) => !all.includes(v)),
                )
              }
            >
              <b>{label}</b>
            </Checkbox>
            <div className="ds-check__group">{children}</div>
          </>
        ) : (
          <div className="ds-check__list">{children}</div>
        )}
      </div>
    </GroupContext>
  );
}
