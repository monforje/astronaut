/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import {
  useId,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from "react";
import { Button } from "../button/Button";
import { Btn, type Force } from "../dialog/demo";
import { SHEET_NEXT_SIZE, SHEET_SIZE_LABEL, Sheet, SheetPanel, type SheetSize } from "./index";
import "./sheet.force.css";

export type { SheetSize } from "./index";

export const SIZE_NEXT = SHEET_NEXT_SIZE;
export const SIZE_LABEL = SHEET_SIZE_LABEL;

export function CargoBody({ status = 1 }: { status?: number }) {
  const id = useId();
  return (
    <>
      <dl className="ds-sheet__dl">
        <dt>Клиент</dt>
        <dd>ООО «Дальснаб»</dd>
        <dt>Прибытие</dt>
        <dd>14.11.2026</dd>
        <dt>Вес по накладной</dt>
        <dd>18 420 кг</dd>
        <dt>Вес в декларации</dt>
        <dd data-bad>18 240 кг</dd>
      </dl>
      <div className="ds-sheet__field">
        <label htmlFor={`${id}-c`}>Комментарий</label>
        <textarea
          id={`${id}-c`}
          className="ds-sheet__input"
          rows={3}
          placeholder="Что нужно уточнить у клиента"
        />
      </div>
      <div className="ds-sheet__field">
        <span id={`${id}-s`}>Статус</span>
        <div className="ds-sheet__seg" role="radiogroup" aria-labelledby={`${id}-s`}>
          {["Черновик", "В работе", "Сверен"].map((t, i) => (
            <button key={t} type="button" role="radio" aria-checked={i === status}>
              {t}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export function SheetView({
  size,
  title = "Груз MSKU4821907",
  desc = "ООО «Дальснаб» · Нинбо → Владивосток",
  children,
  footer = true,
  sheetRef,
  onSize,
  onClose,
  closeForce,
  sizeForce,
  labelId,
  noAnim,
  flow,
  footerButtons,
}: {
  size: SheetSize;
  title?: string;
  desc?: string;
  children?: ReactNode;
  footer?: boolean;
  sheetRef?: Ref<HTMLElement>;
  onSize?: () => void;
  onClose?: () => void;
  closeForce?: Force;
  sizeForce?: Force;
  labelId?: string;
  noAnim?: boolean;
  flow?: boolean;
  footerButtons?: ReactNode;
}) {
  return (
    <SheetPanel
      ref={sheetRef}
      size={size}
      title={title}
      description={desc}
      titleId={labelId}
      className={flow ? "ds-sheet--flow" : noAnim ? "ds-sheet--still" : undefined}
      onResize={onSize}
      onClose={onClose}
      sizeButtonProps={sizeForce ? ({ "data-force": sizeForce } as object) : undefined}
      closeButtonProps={closeForce ? ({ "data-force": closeForce } as object) : undefined}
      footer={
        footer
          ? (footerButtons ?? (
              <>
                <Btn onClick={onClose}>Отмена</Btn>
                <Btn variant="primary" onClick={onClose}>
                  Сохранить
                </Btn>
              </>
            ))
          : undefined
      }
    >
      {children ?? <CargoBody />}
    </SheetPanel>
  );
}

export function SheetStage({
  open,
  out,
  size,
  small,
  opener,
  sheetProps,
  openerForce,
}: {
  open: boolean;
  out?: boolean;
  size: SheetSize;
  small?: boolean;
  opener?: ReactNode;
  sheetProps?: Partial<ComponentProps<typeof SheetView>>;
  openerForce?: Force;
}) {
  return (
    <div className={`ds-sheet-stage${small ? " ds-sheet-stage--sm" : ""}`}>
      <div className="ds-sheet-stage__page">
        {opener ?? (
          <div>
            <Btn size="sm" force={openerForce}>
              Открыть карточку
            </Btn>
          </div>
        )}
        <i style={{ width: "30%" }} />
        <i />
        <i style={{ width: "70%" }} />
      </div>
      {open ? (
        <div className="ds-sheet-root" data-size={size} data-out={out || undefined}>
          <div className="ds-sheet-scrim" />
          <SheetView size={size} {...sheetProps} />
        </div>
      ) : null}
    </div>
  );
}

export function SheetMini({ mode }: { mode: SheetSize }) {
  const w = { panel: "36%", wide: "64%", full: "100%" }[mode];
  const px = { panel: "430 px", wide: "760 px", full: "весь экран" }[mode];
  return (
    <div className="ds-sheet-mini" aria-hidden="true">
      {mode !== "full" ? <span className="ds-sheet-mini__scrim" /> : null}
      <span className="ds-sheet-mini__panel" style={{ "--w": w } as CSSProperties}>
        <b>Груз MSKU4821907</b>
        <i />
        <i style={{ width: "70%" }} />
        <i style={{ width: "85%" }} />
      </span>
      <span className="ds-sheet-mini__w">{px}</span>
    </div>
  );
}

export function SheetLive() {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<HTMLDivElement | null>(null);

  return (
    <div className="ds-sheet-stage" ref={setStage}>
      <div className="ds-sheet-stage__page">
        <div>
          <Btn size="sm" variant="primary" onClick={() => setOpen(true)}>
            Открыть карточку
          </Btn>
        </div>
        <i style={{ width: "30%" }} />
        <i />
        <i style={{ width: "70%" }} />
      </div>
      <Sheet
        open={open}
        onOpenChange={setOpen}
        container={stage}
        title="Груз MSKU4821907"
        description="ООО «Дальснаб» · Нинбо → Владивосток"
        footer={
          <>
            <Btn onClick={() => setOpen(false)}>Отмена</Btn>
            <Btn variant="primary" onClick={() => setOpen(false)}>
              Сохранить
            </Btn>
          </>
        }
      >
        <CargoBody />
      </Sheet>
    </div>
  );
}

export function CargoSheetExample() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Открыть карточку
      </Button>
      <Sheet
        open={open}
        onOpenChange={setOpen}
        title="Груз MSKU4821907"
        description="ООО «Дальснаб» · Нинбо → Владивосток"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button onClick={() => setOpen(false)}>Сохранить</Button>
          </>
        }
      >
        <CargoBody />
      </Sheet>
    </>
  );
}
