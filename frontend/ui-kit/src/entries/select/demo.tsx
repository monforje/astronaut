/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useState } from "react";
import { Icon, type IconName } from "@/engine/Icon";
import { PortalHost, useIds } from "../../ui/internal";
import { Select } from "./index";
import {
  SelectPanel,
  SelectTrigger as BaseTrigger,
  type SelectOption as RealOption,
} from "./SelectParts";
import "./select.force.css";

export interface SelectOption {
  v: string;
  label: string;
  icon?: IconName;
  hint?: string;
  off?: boolean;
}

export type SelectForce = "hover" | "focus" | "open";

export const CLIENTS: SelectOption[] = [
  "ООО «Дальснаб»",
  "ИП Кравец",
  "ООО «Порт-Трейд»",
  "АО «Приморье-Опт»",
  "ООО «Восток-Карго»",
  "ИП Лозовой",
].map((c) => ({ v: c, label: c }));

export const STATUSES: SelectOption[] = [
  { v: "ok", label: "Сверено", icon: "check", hint: "Документы совпадают" },
  { v: "err", label: "Расхождение", icon: "warn", hint: "Найдена разница" },
  { v: "w", label: "Ждём документ", icon: "doc" },
  { v: "x", label: "Архив", icon: "box", off: true, hint: "Недоступно для этого груза" },
];

export const SORTS: SelectOption[] = [
  { v: "n", label: "Новые сверху" },
  { v: "o", label: "Старые сверху" },
  { v: "w", label: "По весу" },
];

function toReal(option: SelectOption): RealOption {
  return {
    value: option.v,
    label: option.label,
    icon: option.icon ? <Icon name={option.icon} /> : undefined,
    hint: option.hint,
    disabled: option.off,
  };
}

export interface PopProps {
  options: SelectOption[];
  value: string;
  title?: string;
  search?: boolean;
  q?: string;
  act?: number;
  kb?: boolean;
  isStatic?: boolean;
  listId?: string;
  optionPrefix?: string;
}

export function SelectPop({
  options,
  value,
  title,
  search,
  q,
  act,
  kb,
  isStatic,
  listId,
  optionPrefix,
}: PopProps) {
  const own = useIds(["list", "o"]);
  return (
    <SelectPanel
      className={isStatic ? "ds-select__pop--static" : undefined}
      options={options.map(toReal)}
      value={value}
      title={title}
      searchable={search}
      query={q}
      active={act}
      keyboard={kb}
      listId={listId ?? own.list}
      optionIdPrefix={optionPrefix ?? own.o}
    />
  );
}

export interface TriggerProps {
  options: SelectOption[];
  value: string;
  placeholder?: string;
  control?: boolean;
  controlLabel?: string;
  open?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  force?: SelectForce;
  listId?: string;
  labelledBy?: string;
}

export function SelectTrigger({
  options,
  value,
  placeholder = "Выберите",
  control,
  controlLabel,
  open,
  invalid,
  disabled,
  force,
  listId,
  labelledBy,
}: TriggerProps) {
  const own = useIds(["list"]);
  const selected = options.find((o) => o.v === value);
  return (
    <BaseTrigger
      selected={selected ? toReal(selected) : undefined}
      placeholder={placeholder}
      variant={control ? "control" : "field"}
      controlLabel={controlLabel}
      open={open}
      invalid={invalid}
      disabled={disabled}
      listId={listId ?? own.list}
      aria-labelledby={labelledBy}
      data-force={force}
    />
  );
}

export function DemoSelectTrigger(
  props: Omit<TriggerProps, "options" | "value"> & {
    options?: SelectOption[];
    value?: string;
    label?: string;
    error?: string;
  },
) {
  const { options = CLIENTS, value = "", label, error, ...rest } = props;
  const ids = useIds(["l"]);
  return (
    <div className="ds-select__field">
      {label ? (
        <span className="ds-select__label" id={ids.l}>
          {label}
        </span>
      ) : null}
      <SelectTrigger
        {...rest}
        options={options}
        value={value}
        labelledBy={label ? ids.l : undefined}
      />
      {error ? <span className="ds-select__error">{error}</span> : null}
    </div>
  );
}

export interface SelectState {
  open: boolean;
  q: string;
  act: number;
  val: string;
  kb: boolean;
  force?: SelectForce;
}

export function SelectScene({
  state,
  options = CLIENTS,
  title = "Клиент",
  search,
  placeholder = "Все клиенты",
  label = "Клиент",
}: {
  state: SelectState;
  options?: SelectOption[];
  title?: string;
  search?: boolean;
  placeholder?: string;
  label?: string;
}) {
  const ids = useIds(["l", "list", "o"]);
  return (
    <div className="ds-select__stage">
      <div className="ds-select__field">
        <span className="ds-select__label" id={ids.l}>
          {label}
        </span>
        <div className="ds-select__host">
          <SelectTrigger
            options={options}
            value={state.val}
            placeholder={placeholder}
            open={state.open}
            force={state.force}
            listId={ids.list}
            labelledBy={ids.l}
          />
          {state.open ? (
            <SelectPop
              options={options}
              value={state.val}
              title={title}
              search={search}
              q={state.q}
              act={state.act}
              kb={state.kb}
              listId={ids.list}
              optionPrefix={ids.o}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function DemoSelect({
  options = CLIENTS,
  defaultValue = "",
  title,
  search,
  placeholder = "Все клиенты",
  label,
  control,
  controlLabel,
  invalid,
  error,
  disabled,
  wide,
  flow,
}: {
  options?: SelectOption[];
  defaultValue?: string;
  title?: string;
  search?: boolean;
  placeholder?: string;
  label?: string;
  control?: boolean;
  controlLabel?: string;
  invalid?: boolean;
  error?: string;
  disabled?: boolean;
  wide?: boolean;
  flow?: boolean;
}) {
  const [open, setOpen] = useState(!!flow);
  const holdOpen = flow
    ? {
        open,
        onOpenChange: (next: boolean, reason: string) => {
          if (reason !== "dismiss") setOpen(next);
        },
      }
    : {};
  return (
    <PortalHost
      className={`ds-select__stage${flow ? " ds-select__stage--flow" : wide ? "" : " ds-select__stage--short"}`}
    >
      <Select
        {...holdOpen}
        options={options.map(toReal)}
        defaultValue={defaultValue}
        title={title}
        searchable={search}
        placeholder={placeholder}
        label={label}
        variant={control ? "control" : "field"}
        controlLabel={controlLabel}
        invalid={invalid}
        error={error}
        disabled={disabled}
      />
    </PortalHost>
  );
}

export function DemoSelectOpen({
  options = CLIENTS,
  value = CLIENTS[0].v,
  title = "Клиент",
  search,
  q,
  act = 1,
  kb,
}: {
  options?: SelectOption[];
  value?: string;
  title?: string;
  search?: boolean;
  q?: string;
  act?: number;
  kb?: boolean;
}) {
  const ids = useIds(["list", "o"]);
  return (
    <div className="ds-select__field">
      <SelectTrigger options={options} value={value} open listId={ids.list} />
      <SelectPop
        isStatic
        options={options}
        value={value}
        title={title}
        search={search}
        q={q}
        act={act}
        kb={kb}
        listId={ids.list}
        optionPrefix={ids.o}
      />
    </div>
  );
}

const CLIENT_OPTIONS = CLIENTS.map(toReal);
const SORT_OPTIONS = SORTS.map(toReal);

export function ClientSelectExample() {
  const [client, setClient] = useState(CLIENT_OPTIONS[0].value);
  return (
    <div className="ds-select__example">
      <Select
        label="Клиент"
        searchable
        title="Клиент"
        value={client}
        onValueChange={setClient}
        options={CLIENT_OPTIONS}
        placeholder="Выберите клиента"
      />
    </div>
  );
}

export function SortSelectExample() {
  const [sort, setSort] = useState("n");
  return (
    <div className="ds-select__example">
      <Select
        variant="control"
        controlLabel="Сортировка"
        value={sort}
        onValueChange={setSort}
        options={SORT_OPTIONS}
      />
    </div>
  );
}
