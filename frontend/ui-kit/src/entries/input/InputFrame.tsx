/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ReactNode } from "react";
import { cx, Icon, useIds } from "../../ui/internal";
import "./input.css";

export interface FieldChrome {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  lead?: ReactNode;
  unit?: ReactNode;
  kbd?: ReactNode;
  clearable?: boolean;
  compact?: boolean;
  invalid?: boolean;
}

export interface ControlLinks {
  "aria-labelledby": string | undefined;
  "aria-describedby": string | undefined;
  "aria-invalid": true | undefined;
}

export interface FieldIds {
  labelId: string;
  noteId: string;
  links: ControlLinks;
}

export function useFieldIds({
  label,
  hint,
  error,
  invalid,
}: Pick<FieldChrome, "label" | "hint" | "error" | "invalid">): FieldIds {
  const { label: labelId, note: noteId } = useIds(["label", "note"]);
  return {
    labelId,
    noteId,
    links: {
      "aria-labelledby": label ? labelId : undefined,
      "aria-describedby": error || hint ? noteId : undefined,
      "aria-invalid": invalid || error ? true : undefined,
    },
  };
}

export function InputFrame({
  label,
  hint,
  error,
  lead,
  unit,
  kbd,
  hasValue,
  onClear,
  compact,
  area,
  invalid,
  disabled,
  className,
  ids,
  children,
}: FieldChrome & {
  hasValue: boolean;
  onClear: () => void;
  area?: boolean;
  disabled?: boolean;
  className?: string;
  ids: FieldIds;
  children: ReactNode;
}) {
  const { labelId, noteId } = ids;
  const bad = invalid || !!error;
  return (
    <div className={cx("ds-input__field", className)}>
      {label ? (
        <span className="ds-input__label" id={labelId}>
          {label}
        </span>
      ) : null}
      <label
        className={cx("ds-input", compact && "ds-input--compact", area && "ds-input--area")}
        data-invalid={bad || undefined}
        data-disabled={disabled || undefined}
      >
        {lead ? (
          <span className="ds-input__lead" aria-hidden="true">
            {lead}
          </span>
        ) : null}
        {children}
        {unit ? <span className="ds-input__unit">{unit}</span> : null}
        {hasValue && !disabled ? (
          <button type="button" className="ds-input__clear" aria-label="Очистить" onClick={onClear}>
            <Icon name="x" size="sm" />
          </button>
        ) : null}
        {kbd ? <span className="ds-input__kbd">{kbd}</span> : null}
      </label>
      {error ? (
        <span className="ds-input__error" id={noteId}>
          {error}
        </span>
      ) : hint ? (
        <span className="ds-input__hint" id={noteId}>
          {hint}
        </span>
      ) : null}
    </div>
  );
}
