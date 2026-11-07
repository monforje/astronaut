/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useState } from "react";
import { Icon, type IconName } from "@/engine/Icon";
import { InlineInput, Input, SearchInput, Textarea } from "./index";
import "./input.force.css";

export type InputForce = "hover" | "focus";

export function DemoInput({
  label,
  hint,
  error,
  value,
  defaultValue = "",
  placeholder,
  lead,
  unit,
  kbd,
  clear,
  compact,
  area,
  num,
  invalid,
  disabled,
  force,
  clearForce,
}: {
  label?: string;
  hint?: string;
  error?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  lead?: IconName;
  unit?: string;
  kbd?: string;
  clear?: boolean;
  compact?: boolean;
  area?: boolean;
  num?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  force?: InputForce;
  clearForce?: "hover";
}) {
  const common = {
    label,
    hint,
    error,
    value,
    defaultValue,
    placeholder,
    unit,
    compact,
    invalid,
    disabled,
    "data-force": force,
  };
  if (area) return <Textarea {...common} />;
  return (
    <Input
      {...common}
      lead={lead ? <Icon name={lead} size="sm" /> : undefined}
      kbd={kbd}
      clearable={clear}
      numeric={num}
      data-force-clear={clearForce}
    />
  );
}

const CONTAINER = /^[A-Z]{4}\d{7}$/;

export function DemoContainerField({ value, force }: { value?: string; force?: InputForce }) {
  const [own, setOwn] = useState("");
  const v = (value ?? own).toUpperCase();
  const bad = v !== "" && !CONTAINER.test(v);
  return (
    <Input
      label="Номер контейнера"
      placeholder="MSKU4821907"
      value={v}
      hint="4 буквы и 7 цифр"
      error={bad ? `Нужно 4 буквы и 7 цифр, сейчас ${v.length} симв.` : undefined}
      onValueChange={(next) => setOwn(next.toUpperCase())}
      data-force={force}
    />
  );
}

export function DemoInlineInput({
  defaultValue,
  width = 130,
  invalid,
  force,
  label,
}: {
  defaultValue: string;
  width?: number;
  invalid?: boolean;
  force?: InputForce;
  label: string;
}) {
  return (
    <InlineInput
      defaultValue={defaultValue}
      width={width}
      invalid={invalid}
      aria-label={label}
      data-force={force}
    />
  );
}

export function DemoSearchInput({
  placeholder = "Поиск",
  force,
  value,
}: {
  placeholder?: string;
  force?: InputForce;
  value?: string;
}) {
  return <SearchInput placeholder={placeholder} value={value} data-force={force} />;
}
