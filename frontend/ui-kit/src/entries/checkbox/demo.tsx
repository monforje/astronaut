/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useState, type ReactNode } from "react";
import { Checkbox, CheckboxGroup, type CheckboxProps } from "./index";
import "./checkbox.force.css";

export type CheckForce = "hover" | "focus";

export interface DemoCheckboxProps extends Omit<CheckboxProps, "ref" | "children" | "hint"> {
  force?: CheckForce;
  label?: string;
}

export function DemoCheckbox({ force, label, ...rest }: DemoCheckboxProps) {
  return <Checkbox {...rest} data-force={force} aria-label={label} />;
}

export function DemoCheckOption({
  title,
  hint,
  force,
  ...rest
}: Omit<CheckboxProps, "ref" | "children" | "hint"> & {
  title: ReactNode;
  hint?: string;
  force?: CheckForce;
}) {
  return (
    <Checkbox {...rest} hint={hint} data-force={force}>
      {title}
    </Checkbox>
  );
}

const DOCS = ["Накладная", "Декларация", "Инвойс", "Упаковочный лист"];
const ALL_ON_TWO = [true, true, false, false];

export function DemoCheckGroup({
  initial = ALL_ON_TWO,
  value,
}: {
  initial?: boolean[];
  value?: boolean[];
}) {
  const [own, setOwn] = useState(() => DOCS.filter((_, i) => initial[i]));
  const current = value ? DOCS.filter((_, i) => value[i]) : own;
  return (
    <CheckboxGroup label="Документы для сверки" value={current} onValueChange={setOwn} selectAll>
      {DOCS.map((d) => (
        <Checkbox key={d} value={d}>
          {d}
        </Checkbox>
      ))}
    </CheckboxGroup>
  );
}

export function DemoCheckCards() {
  const items: [string, string, boolean, boolean][] = [
    ["Письмо", "Сводка на почту", true, false],
    ["Telegram", "Сообщение в чат", false, false],
    ["Push", "Уведомление в браузере", false, false],
    ["SMS", "Недоступно в тарифе", false, true],
  ];
  return (
    <div className="ds-check__cards">
      {items.map(([title, hint, checked, disabled]) => (
        <Checkbox
          key={title}
          variant="card"
          hint={hint}
          defaultChecked={checked}
          disabled={disabled}
        >
          {title}
        </Checkbox>
      ))}
    </div>
  );
}
