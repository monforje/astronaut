/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ReactNode,
  type Ref,
} from "react";
import { Icon, useControlled, useIds, useMergedRefs } from "../../ui/internal";
import { Calendar, type CalendarDayData, type CalendarRangeProps } from "../calendar/Calendar";
import {
  addDays,
  countDays,
  formatRangeLabel,
  formatShort,
  isSameDay,
  orderRange,
  startOfMonth,
  type DateRangeValue,
} from "../calendar/dates";
import { PickerField, PickerPopover } from "../date-picker/PickerParts";
import "./range-picker.css";

export type DatePair = [Date, Date];

export interface RangePreset {
  label: string;
  range: (today: Date) => DatePair;
}

export const DEFAULT_RANGE_PRESETS: RangePreset[] = [
  { label: "Сегодня", range: (today) => [today, today] },
  { label: "Вчера", range: (today) => [addDays(today, -1), addDays(today, -1)] },
  { label: "Последние 7 дней", range: (today) => [addDays(today, -6), today] },
  { label: "Последние 30 дней", range: (today) => [addDays(today, -29), today] },
  {
    label: "Этот месяц",
    range: (today) => [new Date(today.getFullYear(), today.getMonth(), 1), today],
  },
];

export interface RangePickerProps extends Omit<
  ComponentPropsWithRef<"button">,
  "value" | "defaultValue" | "onChange" | "children"
> {
  label?: string;
  hint?: ReactNode;
  error?: ReactNode;
  invalid?: boolean;
  loading?: boolean;
  value?: DatePair | null;
  defaultValue?: DatePair | null;
  onChange?: (range: DatePair | null) => void;
  presets?: boolean | RangePreset[];
  min?: Date | null;
  max?: Date | null;
  today?: Date;
  placeholder?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  fieldClassName?: string;
  fieldWidth?: number | string;
}

const samePair = (a: DateRangeValue, b: DatePair | null) =>
  !!b && isSameDay(a[0], b[0]) && isSameDay(a[1], b[1]);

export interface RangePickerTriggerProps extends Omit<ComponentPropsWithRef<"button">, "children"> {
  text?: string;
  placeholder?: string;
  open?: boolean;
  loading?: boolean;
  invalid?: boolean;
}

export function RangePickerTrigger({
  text,
  placeholder = "Выберите период",
  open,
  loading,
  invalid,
  ...rest
}: RangePickerTriggerProps) {
  return (
    <button
      {...rest}
      type="button"
      className="ds-rangepicker__trigger"
      aria-haspopup="dialog"
      aria-expanded={open ?? false}
      aria-busy={loading || undefined}
      data-invalid={invalid || undefined}
    >
      <span className="ds-rangepicker__v">
        <Icon name="calendar" size="sm" />
        {loading ? (
          <span className="ds-rangepicker__skel" />
        ) : text ? (
          text
        ) : (
          <span className="ds-rangepicker__ph">{placeholder}</span>
        )}
      </span>
      <Icon name="chev" size="sm" className="ds-rangepicker__caret" />
    </button>
  );
}

export interface RangePickerPanelProps {
  draft: DateRangeValue;
  month: Date;
  today: Date;
  hover?: Date | null;
  presets?: RangePreset[] | null;
  min?: Date | null;
  max?: Date | null;
  onDraftChange?: (range: DateRangeValue) => void;
  onMonthChange?: (month: Date) => void;
  onHoverChange?: (date: Date | null) => void;
  onCancel?: () => void;
  onApply?: () => void;
  presetData?: (index: number, preset: RangePreset) => CalendarDayData | undefined;
  calendarProps?: Partial<CalendarRangeProps>;
  panelRef?: Ref<HTMLDivElement>;
}

export function RangePickerPanel({
  draft,
  month,
  today,
  hover = null,
  presets,
  min,
  max,
  onDraftChange,
  onMonthChange,
  onHoverChange,
  onCancel,
  onApply,
  presetData,
  calendarProps,
  panelRef,
}: RangePickerPanelProps) {
  const [start, end] = draft;
  const ready = !!(start && end);
  const previewEnd = end ?? hover;
  const caption =
    start && end
      ? `${formatRangeLabel(start, end)} · ${countDays(start, end)} дн.`
      : start && previewEnd
        ? (([x, y]) => `${formatShort(x)} – ${formatShort(y)}`)(orderRange(start, previewEnd))
        : "Выберите конец периода";
  return (
    <div className="ds-rangepicker__panel" ref={panelRef}>
      {presets ? (
        <div className="ds-rangepicker__pre" role="group" aria-label="Быстрый выбор">
          {presets.map((preset, index) => {
            const range = preset.range(today);
            return (
              <button
                type="button"
                key={preset.label}
                className="ds-rangepicker__preset"
                aria-pressed={samePair(draft, range)}
                {...presetData?.(index, preset)}
                onClick={() => {
                  onDraftChange?.(range);
                  onMonthChange?.(startOfMonth(range[0]));
                }}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      ) : null}
      <div className="ds-rangepicker__main">
        <Calendar
          label="Период"
          {...calendarProps}
          mode="range"
          today={today}
          min={min}
          max={max}
          month={month}
          onMonthChange={onMonthChange}
          value={draft}
          onChange={onDraftChange}
          previewDate={hover}
          onPreviewDateChange={onHoverChange}
        />
        <div className="ds-rangepicker__caption" data-ready={ready || undefined} aria-live="polite">
          {caption}
        </div>
        <div className="ds-rangepicker__actions">
          <button type="button" className="ds-rangepicker__act" onClick={onCancel}>
            Отмена
          </button>
          <button
            type="button"
            className="ds-rangepicker__act ds-rangepicker__act--primary"
            disabled={!ready}
            onClick={onApply}
          >
            Применить
          </button>
        </div>
      </div>
    </div>
  );
}

export function RangePicker({
  label = "Период",
  hint,
  error,
  invalid,
  loading,
  value: valueProp,
  defaultValue = null,
  onChange,
  presets = false,
  min,
  max,
  today: todayProp,
  placeholder = "Выберите период",
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  fieldClassName,
  fieldWidth,
  disabled,
  onClick,
  "aria-describedby": describedBy,
  ...rest
}: RangePickerProps) {
  const { hint: hintId, error: errorId } = useIds(["hint", "error"]);
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const triggerMergedRef = useMergedRefs(triggerRef, rest.ref);
  const userOpened = useRef(false);
  const [fallbackToday] = useState(() => new Date());
  const today = todayProp ?? fallbackToday;
  const list = presets === true ? DEFAULT_RANGE_PRESETS : presets || null;
  const [value, setValue] = useControlled<DatePair | null>(valueProp, defaultValue, onChange);
  const [open, setOpen] = useControlled<boolean>(openProp, defaultOpen, onOpenChange);
  const [draft, setDraft] = useState<DateRangeValue>(value ?? [null, null]);
  const [month, setMonth] = useState(startOfMonth(value?.[0] ?? today));
  const [hover, setHover] = useState<Date | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) {
      setDraft(value ?? [null, null]);
      setMonth(startOfMonth(value?.[0] ?? today));
      setHover(null);
    }
  }

  const close = useCallback(() => setOpen(false), [setOpen]);

  useEffect(() => {
    if (!open || !userOpened.current) return;
    userOpened.current = false;
    panel.current?.querySelector<HTMLElement>('.ds-cal__d[tabindex="0"]')?.focus();
  }, [open]);

  const text = value ? formatRangeLabel(value[0], value[1]) : "";
  const shownError = error ?? undefined;
  const isInvalid = !!shownError || !!invalid;

  const apply = () => {
    const [start, end] = draft;
    if (!start || !end) return;
    setValue([start, end]);
    setOpen(false);
    triggerRef.current?.focus();
  };

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
        <RangePickerTrigger
          {...rest}
          ref={triggerMergedRef}
          text={text}
          placeholder={placeholder}
          open={open}
          loading={loading}
          invalid={isInvalid}
          aria-label={rest["aria-label"] ?? `${label}: ${text || "не выбран"}`}
          aria-describedby={
            [describedBy, shownError ? errorId : hint ? hintId : undefined]
              .filter(Boolean)
              .join(" ") || undefined
          }
          disabled={disabled}
          onClick={(event) => {
            onClick?.(event);
            if (event.defaultPrevented) return;
            userOpened.current = !open;
            setOpen(!open);
          }}
        />
        {open ? (
          <PickerPopover
            open={open}
            anchorRef={root}
            onDismiss={close}
            returnFocusRef={triggerRef}
            aria-label={label}
          >
            <RangePickerPanel
              panelRef={panel}
              draft={draft}
              month={month}
              today={today}
              hover={hover}
              presets={list}
              min={min}
              max={max}
              onDraftChange={setDraft}
              onMonthChange={setMonth}
              onHoverChange={setHover}
              onCancel={() => {
                setOpen(false);
                triggerRef.current?.focus();
              }}
              onApply={apply}
            />
          </PickerPopover>
        ) : null}
      </div>
    </PickerField>
  );
}
