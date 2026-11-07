/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useState, type ReactNode } from "react";
import { Icon, type IconName } from "@/engine/Icon";
import { CalendarView, EVENTS, TODAY, addD, fD, type CalendarViewProps } from "../calendar/demo";
import { parseNumeric } from "../calendar/dates";
import { DatePicker } from "./DatePicker";
import {
  PickerBox,
  PickerButton,
  PickerField,
  PickerFooter,
  PickerPopover,
  PickerSpacer,
} from "./PickerParts";
import "./date-picker.force.css";

export type FieldForce = "hover" | "focus";

export const parseD = parseNumeric;

export function DemoField({
  label,
  hint,
  error,
  children,
  width,
}: {
  label?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  width?: number | string;
}) {
  return (
    <PickerField label={label} hint={hint} error={error} width={width}>
      {children}
    </PickerField>
  );
}

export function DemoBox({
  icon = "calendar",
  force,
  invalid,
  disabled,
  expanded,
  onIcon,
  iconLabel,
  children,
  tail,
}: {
  icon?: IconName;
  force?: FieldForce;
  invalid?: boolean;
  disabled?: boolean;
  expanded?: boolean;
  onIcon?: () => void;
  iconLabel?: string;
  children: ReactNode;
  tail?: ReactNode;
}) {
  return (
    <PickerBox
      data-force={force}
      icon={<Icon name={icon} size="sm" />}
      iconLabel={iconLabel}
      invalid={invalid}
      disabled={disabled}
      open={expanded}
      onIconClick={onIcon}
      tail={tail}
    >
      {children}
    </PickerBox>
  );
}

export function DemoPop({
  children,
  isStatic,
  top,
  label,
  narrow,
}: {
  children: ReactNode;
  isStatic?: boolean;
  top?: boolean;
  label?: string;
  narrow?: boolean;
}) {
  return (
    <PickerPopover inline={isStatic} top={top} aria-label={label} narrow={narrow}>
      {children}
    </PickerPopover>
  );
}

export function PopFoot({
  onToday,
  onClear,
  todayForce,
}: {
  onToday?: () => void;
  onClear?: () => void;
  todayForce?: "hover" | "focus";
}) {
  return (
    <PickerFooter>
      <PickerButton data-force={todayForce} onClick={onToday}>
        Сегодня
      </PickerButton>
      <PickerSpacer />
      <PickerButton onClick={onClear}>Очистить</PickerButton>
    </PickerFooter>
  );
}

export function DemoDateField({
  value = addD(TODAY, 2),
  open,
  force,
  invalid,
  disabled,
  loading,
  empty,
  label = "Дата прибытия",
  hint,
  error,
  calendar,
  todayForce,
  clearVisible,
  popTop,
  text,
}: {
  value?: Date | null;
  open?: boolean;
  force?: FieldForce;
  invalid?: boolean;
  disabled?: boolean;
  loading?: boolean;
  empty?: boolean;
  label?: string;
  hint?: string;
  error?: string;
  calendar?: Partial<CalendarViewProps>;
  todayForce?: "hover" | "focus";
  clearVisible?: boolean;
  popTop?: boolean;
  text?: string;
}) {
  const v = empty ? null : value;
  return (
    <DemoField label={label} hint={hint} error={error}>
      <div className="ds-datepicker__anchor">
        <DemoBox
          force={force}
          invalid={invalid}
          disabled={disabled}
          expanded={open}
          tail={
            (v || text) && !disabled && !loading && (clearVisible ?? true) ? (
              <button type="button" className="ds-datepicker__x" aria-label="Очистить">
                <Icon name="x" size="sm" />
              </button>
            ) : null
          }
        >
          {loading ? (
            <span className="ds-datepicker__skel" aria-hidden="true" />
          ) : (
            <input
              className="ds-datepicker__input"
              placeholder="дд.мм.гггг"
              aria-label={label}
              aria-invalid={invalid || undefined}
              disabled={disabled}
              readOnly
              value={text ?? (v ? fD(v) : "")}
            />
          )}
        </DemoBox>
        {open ? (
          <DemoPop top={popTop}>
            <CalendarView
              view={v ?? TODAY}
              a={v}
              events={EVENTS}
              min={TODAY}
              label="Календарь"
              {...calendar}
            />
            <PopFoot todayForce={todayForce} />
          </DemoPop>
        ) : null}
      </div>
    </DemoField>
  );
}

export function DemoDatePicker({ min = TODAY }: { min?: Date | null }) {
  return (
    <DatePicker
      label="Дата прибытия"
      hint="Можно вписать: 14.11.2026"
      defaultValue={addD(TODAY, 2)}
      min={min}
      today={TODAY}
      events={EVENTS}
      fieldWidth={240}
    />
  );
}

export function ArrivalDateExample() {
  const [date, setDate] = useState<Date | null>(addD(TODAY, 2));
  return (
    <DatePicker
      label="Дата прибытия"
      hint="Можно вписать: 14.11.2026"
      value={date}
      onChange={setDate}
      min={TODAY}
      today={TODAY}
      events={EVENTS}
      fieldWidth={240}
    />
  );
}
