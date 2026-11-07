/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ComponentPropsWithRef } from "react";
import { Icon } from "@/engine/Icon";
import { DemoBadge } from "../badge/demo";
import { Button } from "../button/Button";
import { Popover, PopoverBody, PopoverFoot, PopoverHead } from "./index";
import "./popover.force.css";

export type PopKind = "status" | "filter" | "help";
export type Force = "hover" | "active" | "focus";

export function PopoverContent({ kind, onClose }: { kind: PopKind; onClose?: () => void }) {
  if (kind === "status")
    return (
      <>
        <PopoverHead>Расхождение по весу</PopoverHead>
        <PopoverBody>
          <span>
            Вес в декларации меньше веса по накладной на <b>180 кг</b>.
          </span>
          <dl className="ds-popover__diff" style={{ margin: 0 }}>
            <dt>Накладная</dt>
            <dd>18 420 кг</dd>
            <dt>Декларация</dt>
            <dd>18 240 кг</dd>
          </dl>
        </PopoverBody>
        <PopoverFoot>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Скрыть
          </Button>
          <Button size="sm" onClick={onClose}>
            Исправить в 1С
          </Button>
        </PopoverFoot>
      </>
    );
  if (kind === "filter")
    return (
      <>
        <PopoverHead>Фильтр</PopoverHead>
        <PopoverBody>
          <div className="ds-popover__field">
            <span>Прибытие</span>
            <div className="ds-popover__pair">
              <input className="ds-popover__input" placeholder="С" aria-label="Прибытие с" />
              <input className="ds-popover__input" placeholder="По" aria-label="Прибытие по" />
            </div>
          </div>
          <label className="ds-popover__check">
            <input type="checkbox" defaultChecked /> Только с расхождениями
          </label>
          <label className="ds-popover__check">
            <input type="checkbox" /> Ждут документов
          </label>
        </PopoverBody>
        <PopoverFoot>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Сбросить
          </Button>
          <Button size="sm" onClick={onClose}>
            Применить
          </Button>
        </PopoverFoot>
      </>
    );
  return (
    <>
      <PopoverHead>Что значит «Сверено»</PopoverHead>
      <PopoverBody>
        <span>Вес, код ТН ВЭД и номера совпадают в накладной, декларации и инвойсе.</span>
        <button type="button" className="ds-popover__link" onClick={onClose}>
          Как работает сверка ›
        </button>
      </PopoverBody>
    </>
  );
}

export function PopoverCard({ kind }: { kind: PopKind }) {
  return (
    <div className="ds-popover ds-popover--static" role="dialog" aria-label="Подробности">
      <PopoverContent kind={kind} />
    </div>
  );
}

export interface PopTriggerProps extends ComponentPropsWithRef<"button"> {
  kind: PopKind;
  expanded?: boolean;
  force?: Force;
}

export function PopTrigger({ kind, expanded, force, ...rest }: PopTriggerProps) {
  const common = {
    "aria-haspopup": "dialog" as const,
    "aria-expanded": !!expanded,
    "data-force": force,
    ...rest,
  };
  if (kind === "status")
    return (
      <Button {...common} variant="outline" size="sm">
        <span style={{ pointerEvents: "none", display: "inline-flex" }}>
          <DemoBadge tone="err">Расхождение</DemoBadge>
        </span>
      </Button>
    );
  if (kind === "filter")
    return (
      <Button
        {...common}
        variant="outline"
        size="sm"
        icon={<Icon name="cols" size="sm" />}
        iconEnd={<Icon name="chev" size="sm" />}
      >
        Фильтр
      </Button>
    );
  return (
    <Button
      {...common}
      aria-label="Справка"
      variant="ghost"
      size="md"
      square
      icon={<Icon name="help" />}
    />
  );
}

export function LivePopover({
  kind,
  align = "start",
  open,
  force,
}: {
  kind: PopKind;
  align?: "start" | "end";
  open?: boolean;
  force?: Force;
}) {
  return (
    <Popover
      trigger={<PopTrigger kind={kind} force={force} />}
      label="Подробности"
      align={align}
      open={open}
      focusOnOpen={open === undefined}
      flip={open === undefined}
    >
      {({ close }) => <PopoverContent kind={kind} onClose={close} />}
    </Popover>
  );
}

export function StatusPopoverExample() {
  return (
    <Popover
      trigger={
        <Button variant="outline" size="sm">
          Расхождение
        </Button>
      }
      label="Расхождение по весу"
    >
      {({ close }) => <PopoverContent kind="status" onClose={close} />}
    </Popover>
  );
}

export function HelpPopoverExample() {
  return (
    <Popover
      trigger={<Button square variant="ghost" aria-label="Справка" icon={<Icon name="help" />} />}
      label="Что значит «Сверено»"
    >
      {({ close }) => <PopoverContent kind="help" onClose={close} />}
    </Popover>
  );
}
