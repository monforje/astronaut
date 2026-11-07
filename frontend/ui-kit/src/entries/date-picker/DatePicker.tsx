/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import {
  useCallback,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Icon, useControlled, useIds, useMergedRefs } from "../../ui/internal";
import { Calendar } from "../calendar/Calendar";
import {
  formatNumeric,
  isDisabled,
  isSameDay,
  parseNumeric,
  startOfMonth,
} from "../calendar/dates";
import {
  PickerBox,
  PickerButton,
  PickerClear,
  PickerField,
  PickerFooter,
  PickerPopover,
  PickerSpacer,
} from "./PickerParts";

export interface DatePickerProps extends Omit<
  ComponentPropsWithRef<"input">,
  "value" | "defaultValue" | "onChange" | "min" | "max" | "type" | "size" | "children"
> {
  label?: string;
  hint?: ReactNode;
  error?: ReactNode;
  invalid?: boolean;
  loading?: boolean;
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date | null) => void;
  min?: Date | null;
  max?: Date | null;
  today?: Date;
  events?: Date[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  fieldClassName?: string;
  fieldWidth?: number | string;
}

const FORMAT_ERROR = "Формат: дд.мм.гггг";

function rangeError(date: Date, today: Date, min?: Date | null, max?: Date | null): string {
  if (isDisabled(date, min, null) && min)
    return isSameDay(min, today) ? "Дата раньше сегодняшней" : `Дата раньше ${formatNumeric(min)}`;
  if (max) return `Дата позже ${formatNumeric(max)}`;
  return "";
}

export function DatePicker({
  label = "Дата",
  hint,
  error,
  invalid,
  loading,
  value: valueProp,
  defaultValue = null,
  onChange,
  min,
  max,
  today: todayProp,
  events,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  fieldClassName,
  fieldWidth,
  disabled,
  placeholder = "дд.мм.гггг",
  onFocus,
  onBlur,
  onKeyDown,
  "aria-describedby": describedBy,
  ...rest
}: DatePickerProps) {
  const { hint: hintId, error: errorId } = useIds(["hint", "error"]);
  const root = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const leadRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputMergedRef = useMergedRefs(inputRef, rest.ref);
  const suppressOpen = useRef(false);
  const [fallbackToday] = useState(() => new Date());
  const today = todayProp ?? fallbackToday;
  const [value, setValue] = useControlled<Date | null>(valueProp, defaultValue, onChange);
  const [open, setOpenState] = useControlled<boolean>(openProp, defaultOpen, onOpenChange);
  const [text, setText] = useState(value ? formatNumeric(value) : "");
  const [ownError, setOwnError] = useState("");
  const [month, setMonth] = useState(startOfMonth(value ?? today));
  const valueTime = value?.getTime() ?? null;
  const [synced, setSynced] = useState(valueTime);
  if (synced !== valueTime) {
    setSynced(valueTime);
    setText(value ? formatNumeric(value) : "");
    setOwnError("");
    if (value) setMonth(startOfMonth(value));
  }

  const close = useCallback(() => setOpenState(false), [setOpenState]);

  const shownError = error ?? (ownError || undefined);
  const isInvalid = !!shownError || !!invalid;

  const apply = (date: Date | null) => {
    setText(date ? formatNumeric(date) : "");
    setOwnError("");
    if (date) setMonth(startOfMonth(date));
    setValue(date);
  };
  const commit = () => {
    if (!text.trim()) {
      if (value) apply(null);
      return;
    }
    const parsed = parseNumeric(text);
    if (!parsed) {
      setOwnError(FORMAT_ERROR);
      return;
    }
    if (isDisabled(parsed, min, max)) {
      setOwnError(rangeError(parsed, today, min, max));
      return;
    }
    if (!value || !isSameDay(value, parsed)) apply(parsed);
    else setText(formatNumeric(parsed));
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === "Enter") {
      event.preventDefault();
      commit();
      close();
    } else if (event.key === "ArrowDown" && open) {
      event.preventDefault();
      popRef.current?.querySelector<HTMLElement>('.ds-cal__d[tabindex="0"]')?.focus();
    }
  };
  const todayDisabled = isDisabled(today, min, max);

  return (
    <PickerField
      className={fieldClassName}
      width={fieldWidth}
      label={label}
      hint={hint}
      error={shownError}
      hintId={hintId}
      errorId={errorId}
    >
      <div className="ds-datepicker__anchor" ref={root}>
        <PickerBox
          icon={<Icon name="calendar" size="sm" />}
          iconRef={leadRef}
          open={open}
          invalid={isInvalid}
          disabled={disabled}
          onIconClick={() => setOpenState(!open)}
          tail={
            value && !disabled && !loading ? (
              <PickerClear
                onClick={() => {
                  apply(null);
                  inputRef.current?.focus();
                }}
              />
            ) : null
          }
        >
          {loading ? (
            <span className="ds-datepicker__skel" aria-hidden="true" />
          ) : (
            <input
              {...rest}
              ref={inputMergedRef}
              className="ds-datepicker__input"
              placeholder={placeholder}
              aria-label={rest["aria-label"] ?? label}
              aria-invalid={isInvalid || undefined}
              aria-describedby={
                [describedBy, shownError ? errorId : hint ? hintId : undefined]
                  .filter(Boolean)
                  .join(" ") || undefined
              }
              aria-busy={loading || undefined}
              inputMode="numeric"
              disabled={disabled}
              value={text}
              onChange={(event) => {
                setText(event.target.value);
                setOwnError("");
              }}
              onFocus={(event) => {
                onFocus?.(event);
                if (!open && !suppressOpen.current) setOpenState(true);
              }}
              onBlur={(event) => {
                onBlur?.(event);
                commit();
              }}
              onKeyDown={handleKeyDown}
            />
          )}
        </PickerBox>
        {open ? (
          <PickerPopover
            ref={popRef}
            open={open}
            anchorRef={root}
            onDismiss={close}
            returnFocusRef={inputRef}
          >
            <Calendar
              today={today}
              min={min}
              max={max}
              events={events}
              month={month}
              onMonthChange={setMonth}
              value={value}
              onChange={(date) => {
                apply(date);
                close();
                suppressOpen.current = true;
                inputRef.current?.focus({ preventScroll: true });
                suppressOpen.current = false;
              }}
            />
            <PickerFooter>
              <PickerButton
                disabled={todayDisabled}
                onClick={() => {
                  apply(today);
                  close();
                }}
              >
                Сегодня
              </PickerButton>
              <PickerSpacer />
              <PickerButton
                onClick={() => {
                  apply(null);
                  close();
                }}
              >
                Очистить
              </PickerButton>
            </PickerFooter>
          </PickerPopover>
        ) : null}
      </div>
    </PickerField>
  );
}
