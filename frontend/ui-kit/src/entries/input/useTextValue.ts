/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useControlled } from "../../ui/internal";

export function useTextValue(
  value: string | number | readonly string[] | undefined,
  defaultValue: string | number | readonly string[] | undefined,
) {
  return useControlled(value === undefined ? undefined : String(value), String(defaultValue ?? ""));
}
