/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Icon, type IconName } from "@/engine/Icon";
import { ToggleGroup, ToggleGroupItem } from "./index";
import "./togglegroup.force.css";

export interface GroupOption {
  id: string;
  label: string;
  icon?: IconName;
  disabled?: boolean;
}

export function DemoToggleGroup({
  options,
  value,
  defaultValue,
  size,
  block,
  label = "Вид",
  forceId,
  force,
}: {
  options: GroupOption[];
  value?: string;
  defaultValue?: string;
  size?: "sm";
  block?: boolean;
  label?: string;
  forceId?: string;
  force?: "hover" | "active" | "focus";
}) {
  return (
    <ToggleGroup
      aria-label={label}
      value={value}
      defaultValue={defaultValue ?? options[0].id}
      size={size}
      block={block}
    >
      {options.map((o) => (
        <ToggleGroupItem
          key={o.id}
          value={o.id}
          disabled={o.disabled}
          icon={o.icon ? <Icon name={o.icon} size="sm" /> : undefined}
          data-force={o.id === forceId ? force : undefined}
        >
          {o.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

export const VIEW_OPTIONS: GroupOption[] = [
  { id: "list", label: "Список" },
  { id: "table", label: "Таблица" },
  { id: "tree", label: "Дерево" },
];
export const PERIOD_OPTIONS: GroupOption[] = [
  { id: "day", label: "День" },
  { id: "week", label: "Неделя" },
  { id: "month", label: "Месяц" },
];
export const STATUS_OPTIONS: GroupOption[] = [
  { id: "all", label: "Все" },
  { id: "ok", label: "Сверено" },
  { id: "err", label: "Расхождения" },
  { id: "draft", label: "Черновики" },
];
export const ICON_OPTIONS: GroupOption[] = [
  { id: "list", label: "Список", icon: "list" },
  { id: "grid", label: "Плитки", icon: "grid" },
  { id: "map", label: "Карта", disabled: true },
];
