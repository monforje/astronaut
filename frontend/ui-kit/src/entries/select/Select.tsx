/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useEffect, useRef, useState, type ComponentPropsWithRef, type KeyboardEvent } from "react";
import {
  Layer,
  cx,
  useControlled,
  useIds,
  useMergedRefs,
  type DismissReason,
} from "../../ui/internal";
import {
  SelectPanel,
  SelectTrigger,
  filterOptions,
  type SelectOption,
  type SelectVariant,
} from "./SelectParts";

export type SelectOpenReason = "trigger" | "key" | "select" | "escape" | "tab" | "dismiss";

export interface SelectProps extends Omit<
  ComponentPropsWithRef<"button">,
  "value" | "defaultValue" | "onChange" | "children" | "title"
> {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, reason: SelectOpenReason) => void;
  variant?: SelectVariant;
  label?: string;
  controlLabel?: string;
  title?: string;
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  invalid?: boolean;
  error?: string;
  name?: string;
  fieldClassName?: string;
}

const firstEnabled = (list: SelectOption[]) =>
  Math.max(
    0,
    list.findIndex((o) => !o.disabled),
  );

export function Select({
  options,
  value,
  defaultValue = "",
  onValueChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  variant = "field",
  label,
  controlLabel,
  title,
  placeholder = "Выберите",
  searchable,
  searchPlaceholder,
  emptyText,
  invalid,
  error,
  name,
  disabled,
  className,
  fieldClassName,
  onClick,
  onKeyDown,
  ref,
  ...rest
}: SelectProps) {
  const ids = useIds(["l", "v", "list", "e", "o"]);
  const { l: labelId, v: valueId, list: listId, e: errorId } = ids;
  const [current, setValue] = useControlled(value, defaultValue);
  const [openState, setOpenState] = useControlled(openProp, defaultOpen);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [keyboard, setKeyboard] = useState(false);
  const open = openState && !disabled;
  const host = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const triggerRef = useMergedRefs(trigger, ref);
  const searchEl = useRef<HTMLInputElement>(null);
  const listEl = useRef<HTMLDivElement>(null);
  const interacted = useRef(false);
  const list = filterOptions(options, query);
  const selected = options.find((o) => o.value === current);

  const setOpen = (next: boolean, reason: SelectOpenReason) => {
    setOpenState(next);
    if (next !== open) onOpenChange?.(next, reason);
  };
  const dismiss = (reason: DismissReason) =>
    setOpen(false, reason === "escape" ? "escape" : "dismiss");

  const openList = (reason: SelectOpenReason) => {
    interacted.current = true;
    setQuery("");
    setKeyboard(false);
    const at = options.findIndex((o) => o.value === current);
    setActive(at >= 0 && !options[at].disabled ? at : firstEnabled(options));
    setOpen(true, reason);
  };
  const closeList = (reason: SelectOpenReason, returnFocus: boolean) => {
    setOpen(false, reason);
    if (returnFocus) trigger.current?.focus();
  };
  const pick = (next: string) => {
    const option = options.find((o) => o.value === next);
    if (!option || option.disabled) return;
    setValue(next);
    if (next !== current) onValueChange?.(next);
    closeList("select", true);
  };

  useEffect(() => {
    if (open && interacted.current)
      (searchEl.current ?? listEl.current)?.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => {
    if (!open || !keyboard) return;
    const row = listEl.current?.querySelector<HTMLElement>("[data-active]");
    const box = listEl.current;
    if (!row || !box) return;
    if (row.offsetTop < box.scrollTop) box.scrollTop = row.offsetTop;
    else if (row.offsetTop + row.offsetHeight > box.scrollTop + box.clientHeight)
      box.scrollTop = row.offsetTop + row.offsetHeight - box.clientHeight;
    // oxlint-disable-next-line react/exhaustive-effect-dependencies
  }, [open, keyboard, active]);

  const step = (from: number, direction: 1 | -1) => {
    for (let n = 1; n <= list.length; n++) {
      const index = (from + direction * n + list.length * n) % list.length;
      if (!list[index].disabled) return index;
    }
    return from;
  };

  const handlePanelKey = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!list.length) return;
      setActive(step(active, event.key === "ArrowDown" ? 1 : -1));
      setKeyboard(true);
    } else if ((event.key === "Home" || event.key === "End") && !searchable) {
      event.preventDefault();
      if (!list.length) return;
      setActive(event.key === "Home" ? step(-1, 1) : step(list.length, -1));
      setKeyboard(true);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (list[active]) pick(list[active].value);
    } else if (event.key === "Tab") {
      setOpen(false, "tab");
    }
  };

  return (
    <div className={cx("ds-select__field", fieldClassName)}>
      {label ? (
        <span className="ds-select__label" id={labelId}>
          {label}
        </span>
      ) : null}
      <div
        ref={host}
        className={cx("ds-select__host", variant === "control" && "ds-select__host--inline")}
      >
        <SelectTrigger
          {...rest}
          ref={triggerRef}
          className={className}
          variant={variant}
          controlLabel={controlLabel}
          selected={selected}
          placeholder={placeholder}
          open={open}
          invalid={invalid || !!error}
          disabled={disabled}
          listId={listId}
          valueId={valueId}
          aria-labelledby={rest["aria-labelledby"] ?? (label ? `${labelId} ${valueId}` : undefined)}
          aria-describedby={rest["aria-describedby"] ?? (error ? errorId : undefined)}
          onClick={(event) => {
            onClick?.(event);
            if (event.defaultPrevented) return;
            if (open) closeList("trigger", false);
            else openList("trigger");
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (event.defaultPrevented || open) return;
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              openList("key");
            }
          }}
        />
        <Layer
          open={open}
          anchorRef={host}
          onDismiss={dismiss}
          returnFocusRef={trigger}
          gap={4}
          scroll
          exclusive
        >
          <SelectPanel
            options={options}
            value={current}
            title={title}
            searchable={searchable}
            searchPlaceholder={searchPlaceholder}
            emptyText={emptyText}
            query={query}
            active={active}
            keyboard={keyboard}
            listId={listId}
            optionIdPrefix={ids.o}
            searchRef={searchEl}
            listRef={listEl}
            onQueryChange={(next) => {
              setQuery(next);
              setActive(firstEnabled(filterOptions(options, next)));
            }}
            onPick={pick}
            onHover={(index) => {
              setActive(index);
              setKeyboard(false);
            }}
            onKeyDown={handlePanelKey}
          />
        </Layer>
        {name ? <input type="hidden" name={name} value={current} /> : null}
      </div>
      {error ? (
        <span className="ds-select__error" id={errorId}>
          {error}
        </span>
      ) : null}
    </div>
  );
}
