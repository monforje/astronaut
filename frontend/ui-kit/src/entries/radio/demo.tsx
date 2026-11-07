/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Radio, RadioGroup, type RadioProps } from "./index";
import "./radio.force.css";

export type RadioForce = "hover" | "focus";

export interface DemoRadioProps extends Omit<RadioProps, "ref" | "children" | "hint"> {
  force?: RadioForce;
  label: string;
}

export function DemoRadio({ force, label, ...rest }: DemoRadioProps) {
  return <Radio {...rest} data-force={force} aria-label={label} />;
}

export interface RadioItem {
  id: string;
  title: string;
  hint?: string;
  disabled?: boolean;
}

export function DemoRadioGroup({
  items,
  value,
  defaultValue,
  label,
  kind = "list",
  invalid,
  error,
  forceId,
  force,
}: {
  items: RadioItem[];
  value?: string;
  defaultValue?: string;
  label: string;
  kind?: "list" | "row" | "cards";
  invalid?: boolean;
  error?: string;
  forceId?: string;
  force?: RadioForce;
}) {
  return (
    <RadioGroup
      label={label}
      value={value}
      defaultValue={defaultValue}
      variant={kind}
      invalid={invalid}
      error={error}
    >
      {items.map((it) => {
        const forced = it.id === forceId ? force : undefined;
        return (
          <Radio
            key={it.id}
            value={it.id}
            hint={it.hint}
            disabled={it.disabled}
            data-force={kind === "cards" ? undefined : forced}
            data-force-card={kind === "cards" ? forced : undefined}
          >
            {it.title}
          </Radio>
        );
      })}
    </RadioGroup>
  );
}

export const TRANSPORT: RadioItem[] = [
  { id: "sea", title: "Морской импорт", hint: "Контейнеры из Китая во Владивосток" },
  { id: "rail", title: "Железная дорога", hint: "Вагоны через погранпереход" },
  { id: "air", title: "Авиа", hint: "Недоступно в вашем тарифе", disabled: true },
];
export const PERIOD: RadioItem[] = [
  { id: "day", title: "День" },
  { id: "week", title: "Неделя" },
  { id: "month", title: "Месяц" },
];
export const PLANS: RadioItem[] = [
  { id: "std", title: "Стандарт", hint: "Сверка раз в 15 минут" },
  { id: "ext", title: "Расширенный", hint: "Сверка в реальном времени" },
  { id: "corp", title: "Корпоративный", hint: "Недоступно в вашем тарифе", disabled: true },
];
