/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ComponentPropsWithRef, CSSProperties, ReactNode } from "react";
import { cx, useControlled } from "../../ui/internal";
import type { CalendarDayData } from "../calendar/Calendar";
import "./time-slots.css";

export interface TimeSlotProps extends Omit<ComponentPropsWithRef<"button">, "children"> {
  time: string;
  selected?: boolean;
}

export function TimeSlot({ time, selected, type = "button", className, ...rest }: TimeSlotProps) {
  return (
    <button
      {...rest}
      type={type}
      className={cx("ds-slots__slot", className)}
      aria-pressed={selected ?? false}
    >
      {time}
    </button>
  );
}

export interface TimeSlotsProps extends Omit<
  ComponentPropsWithRef<"div">,
  "onChange" | "defaultValue" | "children"
> {
  slots: string[];
  taken?: string[];
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (time: string) => void;
  cols?: 3 | 4;
  label?: string;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  emptyText?: ReactNode;
  errorText?: ReactNode;
  staggered?: boolean;
  slotData?: (time: string) => CalendarDayData | undefined;
}

const NONE: string[] = [];

export function TimeSlots({
  slots,
  taken = NONE,
  value: valueProp,
  defaultValue = null,
  onChange,
  cols = 4,
  label = "Время",
  loading,
  error,
  onRetry,
  emptyText = "На этот день всё занято: выберите другую дату",
  errorText = "Попробуйте ещё раз",
  staggered,
  slotData,
  className,
  ...rest
}: TimeSlotsProps) {
  const [value, setValue] = useControlled<string | null>(
    valueProp,
    defaultValue,
    onChange as ((time: string | null) => void) | undefined,
  );
  const free = slots.filter((t) => !taken.includes(t));
  const state = loading ? "loading" : error ? "error" : free.length === 0 ? "empty" : "ready";
  const columns = cols === 3 ? 3 : undefined;
  return (
    <div
      {...rest}
      className={cx("ds-slots", className)}
      role="group"
      aria-label={label}
      aria-busy={loading || undefined}
    >
      {state === "loading" ? (
        <div className="ds-slots__grid" data-cols={columns}>
          {Array.from({ length: 8 }, (_, i) => (
            <span className="ds-slots__skel" key={i} />
          ))}
        </div>
      ) : state === "empty" ? (
        <div className="ds-slots__note">
          <b>Свободных слотов нет</b>
          <span>{emptyText}</span>
        </div>
      ) : state === "error" ? (
        <div className="ds-slots__note ds-slots__note--err" role="alert">
          <b>Слоты не загрузились</b>
          <span>{errorText}</span>
          <button type="button" className="ds-slots__retry" onClick={onRetry}>
            Повторить
          </button>
        </div>
      ) : (
        <div className="ds-slots__grid" data-cols={columns} data-enter={staggered || undefined}>
          {slots.map((time, i) => {
            const busy = taken.includes(time);
            return (
              <TimeSlot
                key={time}
                time={time}
                style={{ "--i": i } as CSSProperties}
                selected={value === time}
                disabled={busy}
                aria-label={busy ? `${time}, занято` : undefined}
                title={busy ? "Занято" : undefined}
                {...slotData?.(time)}
                onClick={() => setValue(time)}
              />
            );
          })}
        </div>
      )}
      <div className="ds-slots__out" aria-live="polite">
        {state === "ready" && value ? (
          <>
            Выбрано: <b>{value}</b>
          </>
        ) : (
          "Время не выбрано"
        )}
      </div>
    </div>
  );
}
