/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useEffect, useId, useRef, useState, type ReactNode, type Ref } from "react";
import { DemoAlert } from "../alert/demo";
import { Button } from "../button/Button";
import { Dialog, DialogPanel } from "./index";
import "./dialog.force.css";

export type Force = "hover" | "active" | "focus";
export type BtnVariant = "primary" | "destructive" | "outline" | "ghost" | "secondary";

export function Btn({
  variant = "outline",
  size = "md",
  force,
  loading,
  disabled,
  square,
  label,
  onClick,
  children,
  btnRef,
}: {
  variant?: BtnVariant;
  size?: "xs" | "sm" | "md" | "lg";
  force?: Force;
  loading?: boolean;
  disabled?: boolean;
  square?: boolean;
  label?: string;
  onClick?: () => void;
  children?: ReactNode;
  btnRef?: Ref<HTMLButtonElement>;
}) {
  return (
    <Button
      ref={btnRef}
      variant={variant}
      size={size}
      square={square}
      loading={loading}
      disabled={disabled}
      aria-label={label}
      data-force={force}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export type DialogKind = "confirm" | "decision" | "danger" | "form" | "long";

export interface DialogButton {
  text: string;
  variant?: BtnVariant;
  loading?: boolean;
  disabled?: boolean;
  force?: Force;
}

const Diff = () => (
  <dl className="ds-dialog__diff">
    <dt>Накладная</dt>
    <dd>18 420 кг</dd>
    <dt>Декларация</dt>
    <dd>18 240 кг</dd>
    <dt>Разница</dt>
    <dd data-bad>180 кг</dd>
  </dl>
);

export interface DialogSpec {
  size: "sm" | "md" | "lg";
  title: string;
  body: ReactNode;
  buttons: DialogButton[];
  flush?: boolean;
  load?: number;
}

const LOG = [
  ["MSKU4821907", "Дальснаб", "err", "Расхождение"],
  ["TGHU5502143", "Порт-Трейд", "ok", "Сверено"],
  ["CAIU7731820", "Приморье-Опт", "warn", "Ждём"],
  ["TCLU2290415", "Восток-Карго", "ok", "Сверено"],
  ["FCIU6618302", "ИП Кравец", "ok", "Сверено"],
  ["MRKU3304771", "Дальснаб", "warn", "Ждём"],
  ["OOLU8820034", "ИП Лозовой", "ok", "Сверено"],
  ["HLXU1143905", "Порт-Трейд", "ok", "Сверено"],
  ["TEMU9087716", "Приморье-Опт", "err", "Расхождение"],
  ["SEGU4471029", "Восток-Карго", "ok", "Сверено"],
] as const;

export const SPECS: Record<DialogKind, DialogSpec> = {
  confirm: {
    size: "sm",
    title: "Сверить документы?",
    body: (
      <p className="ds-dialog__text">
        Сравним вес, код ТН ВЭД и номера в накладной, декларации и инвойсе по 128 грузам. Это займёт
        около минуты.
      </p>
    ),
    buttons: [{ text: "Нет" }, { text: "Да, сверить", variant: "primary" }],
    load: 900,
  },
  decision: {
    size: "md",
    title: "Принять расхождение по весу?",
    body: (
      <>
        <p className="ds-dialog__text">
          Груз MSKU4821907. Мы заменим вес в карточке на данные декларации и отметим груз как
          сверенный.
        </p>
        <Diff />
      </>
    ),
    buttons: [{ text: "Отклонить" }, { text: "Принять", variant: "primary" }],
    load: 700,
  },
  danger: {
    size: "sm",
    title: "Отправить груз в архив?",
    body: (
      <p className="ds-dialog__text">
        Груз пропадёт из рабочего списка. Вернуть его можно в разделе «Архив».
      </p>
    ),
    buttons: [{ text: "Отмена" }, { text: "В архив", variant: "destructive" }],
    load: 700,
  },
  form: {
    size: "md",
    title: "Новый груз",
    body: null,
    buttons: [{ text: "Отмена" }, { text: "Создать", variant: "primary", disabled: true }],
  },
  long: {
    size: "lg",
    title: "Журнал сверки",
    flush: true,
    body: (
      <>
        {[...LOG, ...LOG, ...LOG].map(([id, c, , st], i) => (
          <div className="ds-dialog__row" key={`${id}-${i}`}>
            <span>
              {id}
              <small>{c}</small>
            </span>
            <b style={{ fontWeight: 600 }}>{st}</b>
          </div>
        ))}
      </>
    ),
    buttons: [{ text: "Закрыть", variant: "primary" }],
  },
};

export function FormBody({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const bad = !!value && !/^[A-Z]{4}\d{7}$/.test(value);
  const id = useId();
  return (
    <>
      <div className="ds-dialog__field">
        <label htmlFor={`${id}-n`}>Номер контейнера</label>
        <input
          id={`${id}-n`}
          className="ds-dialog__input"
          placeholder="MSKU4821907"
          autoComplete="off"
          value={value}
          aria-invalid={bad || undefined}
          aria-describedby={`${id}-h`}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
        />
        <span id={`${id}-h`} className="ds-dialog__hint" data-err={bad || undefined}>
          {bad ? `Нужно 4 буквы и 7 цифр, сейчас ${value.length} симв.` : "4 буквы и 7 цифр"}
        </span>
      </div>
      <div className="ds-dialog__field">
        <label htmlFor={`${id}-c`}>Комментарий</label>
        <textarea
          id={`${id}-c`}
          className="ds-dialog__input"
          rows={2}
          placeholder="Необязательно"
        />
      </div>
    </>
  );
}

export function DialogView({
  spec,
  buttons,
  error,
  body,
  forStatic,
  dialogRef,
  titleId,
  onButton,
}: {
  spec: DialogSpec;
  buttons?: DialogButton[];
  error?: ReactNode;
  body?: ReactNode;
  forStatic?: boolean;
  dialogRef?: Ref<HTMLDivElement>;
  titleId?: string;
  onButton?: (i: number) => void;
}) {
  const btns = buttons ?? spec.buttons;
  const danger = btns.some((b) => b.variant === "destructive");
  return (
    <DialogPanel
      ref={dialogRef}
      title={spec.title}
      titleId={titleId}
      size={spec.size}
      flush={spec.flush}
      error={error}
      role={danger ? "alertdialog" : "dialog"}
      className={forStatic ? "ds-dialog--static" : undefined}
      footer={btns.map((b, i) => (
        <Btn
          key={b.text}
          variant={b.variant ?? "outline"}
          force={b.force}
          loading={b.loading}
          disabled={b.disabled}
          onClick={() => onButton?.(i)}
        >
          {b.text}
        </Btn>
      ))}
    >
      {body ?? spec.body}
    </DialogPanel>
  );
}

export function DialogPlain({
  spec,
  buttons,
  error,
  body,
}: {
  spec: DialogSpec;
  buttons?: DialogButton[];
  error?: ReactNode;
  body?: ReactNode;
}) {
  return (
    <div className="ds-dialog-plain">
      <DialogView spec={spec} buttons={buttons} error={error} body={body} forStatic />
    </div>
  );
}

export const FORM_ERROR = (
  <DemoAlert
    tone="err"
    layout="stacked"
    title="Не удалось создать груз"
    hint="ПО таможни не отвечает. Данные формы сохранены."
    actions={[{ text: "Повторить" }]}
  />
);

export function FormDialogPlain({
  value,
  buttons,
  error,
}: {
  value: string;
  buttons?: DialogButton[];
  error?: ReactNode;
}) {
  return (
    <DialogPlain
      spec={SPECS.form}
      buttons={buttons}
      error={error}
      body={<FormBody value={value} onChange={() => undefined} />}
    />
  );
}

const ALL_KINDS: DialogKind[] = ["confirm", "decision", "danger", "form", "long"];

const NAMES: Record<DialogKind, string> = {
  confirm: "Подтверждение · sm",
  decision: "Принять / Отклонить · md",
  danger: "Опасное действие · sm",
  form: "Форма с ошибкой · md",
  long: "Длинное содержимое · lg",
};

export function DialogLive({ kinds = ALL_KINDS }: { kinds?: DialogKind[] }) {
  const [kind, setKind] = useState<DialogKind>("confirm");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);
  const [value, setValue] = useState("");
  const [err, setErr] = useState(false);
  const [stage, setStage] = useState<HTMLDivElement | null>(null);
  const tries = useRef(0);
  const timers = useRef<number[]>([]);
  const spec = SPECS[kind];
  const okForm = /^[A-Z]{4}\d{7}$/.test(value);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((t) => window.clearTimeout(t));
  }, []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const close = () => {
    setOpen(false);
    later(() => {
      setBusy(null);
      setErr(false);
      setValue("");
      tries.current = 0;
    }, 200);
  };

  const press = (i: number) => {
    const last = spec.buttons.length - 1;
    if (kind === "form" && i === last) {
      setErr(false);
      setBusy(i);
      later(() => {
        tries.current++;
        if (tries.current === 1) {
          setBusy(null);
          setErr(true);
        } else close();
      }, 900);
      return;
    }
    if (i === last && spec.load) {
      setBusy(i);
      later(close, spec.load);
      return;
    }
    close();
  };

  const buttons = spec.buttons.map((b, i) => ({
    ...b,
    loading: busy === i,
    disabled: busy !== null || (kind === "form" && i === spec.buttons.length - 1 && !okForm),
    text: busy === i ? (kind === "form" ? "Создаём" : b.text) : b.text,
  }));

  return (
    <div className="ds-dialog-stage" ref={setStage}>
      <div className="ds-dialog-stage__page">
        <div className="ds-dialog-stage__bar">
          {kinds.map((k) => (
            <Btn
              key={k}
              size="sm"
              onClick={() => {
                setKind(k);
                setOpen(true);
              }}
            >
              {NAMES[k]}
            </Btn>
          ))}
        </div>
        <i style={{ width: "30%" }} />
        <i />
        <i style={{ width: "70%" }} />
        <i style={{ width: "55%" }} />
      </div>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) close();
        }}
        container={stage}
        busy={busy !== null}
        title={spec.title}
        size={spec.size}
        flush={spec.flush}
        role={buttons.some((b) => b.variant === "destructive") ? "alertdialog" : "dialog"}
        error={kind === "form" && err ? FORM_ERROR : undefined}
        footer={buttons.map((b, i) => (
          <Btn
            key={b.text}
            variant={b.variant ?? "outline"}
            loading={b.loading}
            disabled={b.disabled}
            onClick={() => press(i)}
          >
            {b.text}
          </Btn>
        ))}
      >
        {kind === "form" ? <FormBody value={value} onChange={setValue} /> : spec.body}
      </Dialog>
    </div>
  );
}

export function ConfirmDialogExample() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Сверить документы
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        size="sm"
        title="Сверить документы?"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Нет
            </Button>
            <Button onClick={() => setOpen(false)}>Да, сверить</Button>
          </>
        }
      >
        <p className="ds-dialog__text">
          Сравним вес, код ТН ВЭД и номера в накладной, декларации и инвойсе по 128 грузам. Это
          займёт около минуты.
        </p>
      </Dialog>
    </>
  );
}

export function DangerDialogExample() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        В архив
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        size="sm"
        role="alertdialog"
        title="Отправить груз в архив?"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={() => setOpen(false)}>
              В архив
            </Button>
          </>
        }
      >
        <p className="ds-dialog__text">
          Груз пропадёт из рабочего списка. Вернуть его можно в разделе «Архив».
        </p>
      </Dialog>
    </>
  );
}
