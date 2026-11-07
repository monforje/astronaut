/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ComponentPropsWithRef, ReactNode, Ref } from "react";
import { cx, Icon } from "../../ui/internal";
import "./select.css";

export interface SelectOption {
  value: string;
  label: string;
  icon?: ReactNode;
  hint?: string;
  disabled?: boolean;
}

export type SelectVariant = "field" | "control";

export function filterOptions(options: SelectOption[], query: string): SelectOption[] {
  const needle = query.trim().toLowerCase();
  return options.filter((o) => !needle || o.label.toLowerCase().includes(needle));
}

function Marked({ text, query }: { text: string; query: string }) {
  const needle = query.trim();
  const at = needle ? text.toLowerCase().indexOf(needle.toLowerCase()) : -1;
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <mark className="ds-select__mark">{text.slice(at, at + needle.length)}</mark>
      {text.slice(at + needle.length)}
    </>
  );
}

export interface SelectTriggerProps extends Omit<ComponentPropsWithRef<"button">, "value"> {
  selected?: SelectOption;
  placeholder?: string;
  variant?: SelectVariant;
  controlLabel?: string;
  open?: boolean;
  invalid?: boolean;
  listId?: string;
  valueId?: string;
}

export function SelectTrigger({
  selected,
  placeholder = "Выберите",
  variant = "field",
  controlLabel,
  open,
  invalid,
  listId,
  valueId,
  className,
  type = "button",
  ...rest
}: SelectTriggerProps) {
  const control = variant === "control";
  return (
    <button
      {...rest}
      type={type}
      className={cx(control ? "ds-select__control" : "ds-select__trigger", className)}
      aria-haspopup="listbox"
      aria-expanded={open ? "true" : "false"}
      aria-controls={open ? listId : undefined}
      data-invalid={invalid || undefined}
    >
      {control ? (
        <>
          {controlLabel ? `${controlLabel}: ` : ""}
          <b id={valueId}>{selected ? selected.label : placeholder}</b>
          <Icon name="chev" size="xs" className="ds-select__caret" />
        </>
      ) : (
        <>
          <span
            id={valueId}
            className={cx("ds-select__value", !selected && "ds-select__value--ph")}
          >
            {selected?.icon ? (
              <span className="ds-select__vico" aria-hidden="true">
                {selected.icon}
              </span>
            ) : null}
            {selected ? selected.label : placeholder}
          </span>
          <Icon name="chev" size="sm" className="ds-select__caret" />
        </>
      )}
    </button>
  );
}

export interface SelectPanelProps extends Omit<
  ComponentPropsWithRef<"div">,
  "title" | "onKeyDown"
> {
  options: SelectOption[];
  value?: string;
  title?: string;
  searchable?: boolean;
  searchLabel?: string;
  searchPlaceholder?: string;
  query?: string;
  active?: number;
  keyboard?: boolean;
  listId: string;
  optionIdPrefix: string;
  emptyText?: string;
  onQueryChange?: (query: string) => void;
  onPick?: (value: string) => void;
  onHover?: (index: number) => void;
  onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
  searchRef?: Ref<HTMLInputElement>;
  listRef?: Ref<HTMLDivElement>;
}

export function SelectPanel({
  options,
  value,
  title,
  searchable,
  searchLabel = "Поиск в списке",
  searchPlaceholder = "Поиск",
  query = "",
  active = 0,
  keyboard,
  listId,
  optionIdPrefix,
  emptyText = "Ничего не нашлось",
  onQueryChange,
  onPick,
  onHover,
  onKeyDown,
  searchRef,
  listRef,
  className,
  ...rest
}: SelectPanelProps) {
  const list = filterOptions(options, query);
  const optionId = (o: SelectOption) => `${optionIdPrefix}-${options.indexOf(o)}`;
  const activeId = list[active] ? optionId(list[active]) : undefined;
  return (
    <div
      {...rest}
      role="presentation"
      className={cx("ds-select__pop", className)}
      data-kb={keyboard || undefined}
      onKeyDown={onKeyDown}
    >
      {title ? <div className="ds-select__title">{title}</div> : null}
      {searchable ? (
        <div className="ds-select__search">
          <Icon name="search" />
          <input
            ref={searchRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={activeId}
            aria-autocomplete="list"
            placeholder={searchPlaceholder}
            aria-label={searchLabel}
            value={query}
            onChange={(event) => onQueryChange?.(event.target.value)}
          />
        </div>
      ) : null}
      {list.length ? (
        <div
          ref={listRef}
          className="ds-select__list"
          id={listId}
          role="listbox"
          aria-label={title ?? "Варианты"}
          tabIndex={searchable ? -1 : 0}
          aria-activedescendant={searchable ? undefined : activeId}
        >
          {list.map((o, i) => (
            // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus -- клавиши обрабатывает listbox или поле поиска через aria-activedescendant
            <div
              key={o.value}
              id={optionId(o)}
              className="ds-select__opt"
              role="option"
              aria-selected={o.value === value}
              aria-disabled={o.disabled || undefined}
              data-active={i === active || undefined}
              onClick={() => onPick?.(o.value)}
              onMouseMove={() => onHover?.(i)}
            >
              <span className="ds-select__main">
                {o.icon ? (
                  <span className="ds-select__ico" aria-hidden="true">
                    {o.icon}
                  </span>
                ) : null}
                <span className="ds-select__tx">
                  <Marked text={o.label} query={query} />
                  {o.hint ? <span className="ds-select__hint">{o.hint}</span> : null}
                </span>
              </span>
              {o.value === value ? <Icon name="ok" /> : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="ds-select__empty" role="status">
          {emptyText}
        </div>
      )}
    </div>
  );
}
