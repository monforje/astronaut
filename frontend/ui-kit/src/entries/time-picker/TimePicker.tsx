/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  type RefObject,
} from "react";
import {
  Icon,
  cx,
  useControlled,
  useIds,
  useMergedRefs,
  usePrefersReducedMotion,
} from "../../ui/internal";
import type { CalendarDayData } from "../calendar/Calendar";
import {
  PickerBox,
  PickerButton,
  PickerField,
  PickerFooter,
  PickerPopover,
  PickerSpacer,
  type PickerPopoverProps,
} from "../date-picker/PickerParts";
import {
  clampInt,
  formatTime,
  hourOptions,
  minuteOptions,
  nowTime,
  parseTime,
  stepTime,
  type TimeValue,
} from "./time";
import "./time-picker.css";

const pad2 = (n: number) => String(n).padStart(2, "0");
const HOURS = hourOptions();

type SegmentAttributes = ComponentPropsWithoutRef<"input"> & CalendarDayData;

interface SegmentProps {
  value: number | null;
  max: number;
  label: string;
  placeholder: string;
  invalid?: boolean;
  disabled?: boolean;
  attributes?: SegmentAttributes;
  inputRef?: Ref<HTMLInputElement>;
  onValue: (n: number) => void;
  onStep: (direction: 1 | -1) => void;
  onComplete?: () => void;
}

function Segment({
  value,
  max,
  label,
  placeholder,
  invalid,
  disabled,
  attributes,
  inputRef,
  onValue,
  onStep,
  onComplete,
}: SegmentProps) {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <input
      {...attributes}
      ref={inputRef}
      className="ds-timepicker__num"
      maxLength={4}
      inputMode="numeric"
      aria-label={label}
      aria-invalid={invalid || undefined}
      placeholder={placeholder}
      disabled={disabled}
      value={draft ?? (value == null ? "" : pad2(value))}
      onChange={(event) => {
        const digits = event.target.value.replace(/\D/g, "").slice(-2);
        if (!digits) {
          setDraft("");
          return;
        }
        const n = clampInt(+digits, 0, max);
        setDraft(digits.length === 2 ? pad2(n) : digits);
        onValue(n);
        if (digits.length === 2) onComplete?.();
      }}
      onKeyDown={(event) => {
        if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
        event.preventDefault();
        setDraft(null);
        onStep(event.key === "ArrowUp" ? 1 : -1);
      }}
      onFocus={(event) => event.target.select()}
      onBlur={() => setDraft(null)}
    />
  );
}

export interface TimeFieldProps extends Omit<
  ComponentPropsWithRef<"div">,
  "onChange" | "children"
> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  value: TimeValue | null;
  step?: number;
  invalid?: boolean;
  disabled?: boolean;
  loading?: boolean;
  open?: boolean;
  iconLabel?: string;
  iconRef?: RefObject<HTMLButtonElement | null>;
  hintId?: string;
  errorId?: string;
  hoursProps?: SegmentAttributes;
  minutesProps?: SegmentAttributes;
  boxProps?: CalendarDayData;
  onValueChange?: (time: TimeValue) => void;
  onIconClick?: () => void;
}

export function TimeField({
  label,
  hint,
  error,
  value,
  step = 5,
  invalid,
  disabled,
  loading,
  open,
  iconLabel = "Открыть список времени",
  iconRef,
  hintId,
  errorId,
  hoursProps,
  minutesProps,
  boxProps,
  onValueChange,
  onIconClick,
  ...rest
}: TimeFieldProps) {
  const minutesRef = useRef<HTMLInputElement>(null);
  const name = typeof label === "string" ? label : "Время";
  const emit = (next: TimeValue) => onValueChange?.(next);
  return (
    <PickerField
      label={label}
      hint={hint}
      error={error}
      hintId={hintId}
      errorId={errorId}
      {...rest}
    >
      <PickerBox
        {...boxProps}
        icon={<Icon name="clock" size="sm" />}
        iconLabel={iconLabel}
        iconRef={iconRef}
        invalid={invalid}
        disabled={disabled}
        open={open}
        onIconClick={onIconClick}
      >
        {loading ? (
          <span className="ds-timepicker__skel" aria-hidden="true" />
        ) : (
          <span className="ds-timepicker__seg" role="group" aria-label={name}>
            <Segment
              value={value?.h ?? null}
              max={23}
              label={`${name}, часы`}
              placeholder="––"
              invalid={invalid}
              disabled={disabled}
              attributes={hoursProps}
              onValue={(h) => emit({ h, m: value?.m ?? 0 })}
              onStep={(d) => emit(stepTime(value ?? { h: 0, m: 0 }, "h", d, step))}
              onComplete={() => minutesRef.current?.focus()}
            />
            <span aria-hidden="true">:</span>
            <Segment
              value={value?.m ?? null}
              max={59}
              label={`${name}, минуты`}
              placeholder="––"
              invalid={invalid}
              disabled={disabled}
              attributes={minutesProps}
              inputRef={minutesRef}
              onValue={(m) => emit({ h: value?.h ?? 0, m })}
              onStep={(d) => emit(stepTime(value ?? { h: 0, m: 0 }, "m", d, step))}
            />
          </span>
        )}
      </PickerBox>
    </PickerField>
  );
}

export interface TimePanelProps
  extends
    Omit<ComponentPropsWithRef<"div">, "onChange">,
    Pick<PickerPopoverProps, "open" | "anchorRef" | "onDismiss" | "returnFocusRef"> {
  value: TimeValue | null;
  step?: number;
  inline?: boolean;
  onPick?: (kind: "h" | "m", value: number) => void;
  onNow?: () => void;
  onDone?: () => void;
  itemData?: (kind: "h" | "m", value: number) => CalendarDayData | undefined;
  nowProps?: ComponentPropsWithoutRef<"button"> & CalendarDayData;
}

interface ColumnProps {
  kind: "h" | "m";
  label: string;
  options: number[];
  selected: number | null;
  onPick?: (kind: "h" | "m", value: number) => void;
  itemData?: TimePanelProps["itemData"];
}

function Column({ kind, label, options, selected, onPick, itemData }: ColumnProps) {
  const column = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  useEffect(() => {
    const el = column.current;
    const on = el?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!el || !on) return;
    const top = on.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop;
    el.scrollTo?.({ top: top - 80, behavior: reducedMotion ? "auto" : "smooth" });
  }, [selected, reducedMotion]);
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, number> = {
      ArrowDown: 1,
      ArrowUp: -1,
      Home: -options.length,
      End: options.length,
    };
    const delta = keys[event.key];
    if (!delta) return;
    event.preventDefault();
    const current = Math.max(0, options.indexOf(selected ?? options[0]));
    const next = options[Math.min(options.length - 1, Math.max(0, current + delta))];
    onPick?.(kind, next);
    column.current?.querySelector<HTMLElement>(`[data-v="${next}"]`)?.focus();
  };
  const tabbable = selected ?? options[0];
  return (
    <div
      className="ds-timepicker__col"
      ref={column}
      role="listbox"
      tabIndex={-1}
      aria-label={label}
      onKeyDown={onKeyDown}
    >
      {options.map((n) => (
        <button
          type="button"
          key={n}
          role="option"
          className="ds-timepicker__item"
          data-v={n}
          tabIndex={n === tabbable ? 0 : -1}
          aria-selected={n === selected}
          {...itemData?.(kind, n)}
          onClick={() => onPick?.(kind, n)}
        >
          {pad2(n)}
        </button>
      ))}
    </div>
  );
}

export function TimePanel({
  value,
  step = 5,
  inline,
  onPick,
  onNow,
  onDone,
  itemData,
  nowProps,
  className,
  ...rest
}: TimePanelProps) {
  const hours = HOURS;
  const minutes = useMemo(() => minuteOptions(step), [step]);
  return (
    <PickerPopover
      {...rest}
      className={cx("ds-timepicker__panel", className)}
      aria-label="Выбор времени"
      inline={inline}
      narrow
    >
      <div className="ds-timepicker__cols">
        <Column
          kind="h"
          label="Часы"
          options={hours}
          selected={value?.h ?? null}
          onPick={onPick}
          itemData={itemData}
        />
        <span className="ds-timepicker__colsep" aria-hidden="true">
          :
        </span>
        <Column
          kind="m"
          label="Минуты"
          options={minutes}
          selected={value ? (minutes.includes(value.m) ? value.m : null) : null}
          onPick={onPick}
          itemData={itemData}
        />
      </div>
      <PickerFooter>
        <PickerButton {...nowProps} onClick={onNow}>
          Сейчас
        </PickerButton>
        <PickerSpacer />
        <PickerButton variant="primary" onClick={onDone}>
          Готово
        </PickerButton>
      </PickerFooter>
    </PickerPopover>
  );
}

export interface TimePickerProps extends Omit<
  ComponentPropsWithRef<"div">,
  "onChange" | "defaultValue" | "children"
> {
  label?: string;
  hint?: ReactNode;
  error?: ReactNode;
  invalid?: boolean;
  disabled?: boolean;
  loading?: boolean;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  step?: number;
  now?: Date;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TimePicker({
  label = "Время",
  hint,
  error,
  invalid,
  disabled,
  loading,
  name,
  value: valueProp,
  defaultValue = "",
  onChange,
  step = 5,
  now: nowProp,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  className,
  ...rest
}: TimePickerProps) {
  const { hint: hintId, error: errorId } = useIds(["hint", "error"]);
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLButtonElement>(null);
  const rootRef = useMergedRefs(root, rest.ref);
  const userOpened = useRef(false);
  const [text, setText] = useControlled<string>(valueProp, defaultValue, onChange);
  const [open, setOpen] = useControlled<boolean>(openProp, defaultOpen, onOpenChange);
  const time = parseTime(text);
  const close = useCallback(() => setOpen(false), [setOpen]);

  useEffect(() => {
    if (!open || !userOpened.current) return;
    userOpened.current = false;
    panel.current?.querySelector<HTMLElement>('[role="option"][tabindex="0"]')?.focus();
  }, [open]);

  const apply = (next: TimeValue) => setText(formatTime(next));
  const isInvalid = !!error || !!invalid;

  return (
    <div {...rest} className={cx("ds-datepicker__anchor", className)} ref={rootRef}>
      <TimeField
        label={label}
        hint={hint}
        error={error}
        hintId={hintId}
        errorId={errorId}
        value={time}
        step={step}
        invalid={isInvalid}
        disabled={disabled}
        loading={loading}
        open={open}
        iconRef={iconRef}
        onValueChange={apply}
        onIconClick={() => {
          userOpened.current = !open;
          setOpen(!open);
        }}
      />
      {name ? <input type="hidden" name={name} value={text} /> : null}
      {open ? (
        <TimePanel
          ref={panel}
          open={open}
          anchorRef={root}
          onDismiss={close}
          returnFocusRef={iconRef}
          value={time}
          step={step}
          onPick={(kind, n) =>
            apply(kind === "h" ? { h: n, m: time?.m ?? 0 } : { h: time?.h ?? 0, m: n })
          }
          onNow={() => {
            apply(nowTime(nowProp ?? new Date(), step));
            close();
            iconRef.current?.focus();
          }}
          onDone={() => {
            close();
            iconRef.current?.focus();
          }}
        />
      ) : null}
    </div>
  );
}
