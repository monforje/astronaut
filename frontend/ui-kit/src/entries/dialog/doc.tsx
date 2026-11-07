/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ReactNode } from "react";
import { Marks } from "@/engine/Callout";
import { Playback } from "@/engine/Playback";
import { defineDoc, type StateSpec } from "@/engine/types";
import "../popover/popover.css";
import {
  Btn,
  ConfirmDialogExample,
  DangerDialogExample,
  DialogLive,
  DialogPlain,
  DialogView,
  FORM_ERROR,
  FormBody,
  FormDialogPlain,
  SPECS,
  type DialogButton,
  type DialogKind,
  type Force,
} from "./demo";

const NA = (id: string, kind: StateSpec["kind"], title: string, note: string): StateSpec => ({
  id,
  kind,
  title,
  note,
  notApplicable: true,
});

type Phase = "closed" | "open" | "out";

function Stage({
  phase,
  kind = "confirm",
  buttons,
  openerForce,
  error,
  form,
  value = "",
  extra,
}: {
  phase: Phase;
  kind?: DialogKind;
  buttons?: DialogButton[];
  openerForce?: Force;
  error?: ReactNode;
  form?: boolean;
  value?: string;
  extra?: ReactNode;
}) {
  return (
    <div className="ds-dialog-stage" style={{ height: 300 }}>
      <div className="ds-dialog-stage__page">
        <div className="ds-dialog-stage__bar">
          <Btn size="sm" force={openerForce}>
            Сверить документы
          </Btn>
        </div>
        <i style={{ width: "30%" }} />
        <i />
        <i style={{ width: "70%" }} />
      </div>
      {phase !== "closed" ? (
        <div className="ds-dialog-overlay" data-out={phase === "out" || undefined}>
          <DialogView
            spec={SPECS[kind]}
            buttons={buttons}
            error={error}
            body={form ? <FormBody value={value} onChange={() => undefined} /> : undefined}
          />
          {extra}
        </div>
      ) : null}
    </div>
  );
}

function OpenDemo() {
  return (
    <Playback<{ f?: Force; p: Phase }>
      initial={{ p: "closed" }}
      script={[
        { at: 300, set: { f: "hover" } },
        { at: 800, set: { f: "active" } },
        { at: 1000, set: { f: "focus", p: "open" } },
      ]}
      tail={1500}
      render={(s) => <Stage phase={s.p} openerForce={s.p === "closed" ? s.f : undefined} />}
    />
  );
}

function CloseDemo() {
  return (
    <Playback<{ p: Phase; b?: Force }>
      initial={{ p: "open" }}
      script={[
        { at: 900, set: { b: "hover" } },
        { at: 1500, set: { b: "active" } },
        { at: 1700, set: { p: "out", b: undefined } },
        { at: 1900, set: { p: "closed" } },
      ]}
      tail={1400}
      hint="Фокус возвращается на кнопку, открывшую окно, в момент начала закрытия, а не после анимации."
      render={(s) => (
        <Stage
          phase={s.p}
          openerForce={s.p === "closed" ? "focus" : undefined}
          buttons={[
            { text: "Нет", force: s.b },
            { text: "Да, сверить", variant: "primary" },
          ]}
        />
      )}
    />
  );
}

function LoadDemo() {
  return (
    <Playback<{ p: Phase; st: 0 | 1 | 2 | 3 }>
      initial={{ p: "open", st: 0 }}
      script={[
        { at: 700, set: { st: 1 } },
        { at: 1200, set: { st: 2 } },
        { at: 2300, set: { st: 3, p: "out" } },
        { at: 2500, set: { p: "closed" } },
      ]}
      tail={1300}
      hint="«Да» не закрывает окно сразу: кнопка получает Spinner, всё остальное отключается. В макете 0,9 с."
      render={(s) => (
        <Stage
          phase={s.p}
          openerForce={s.p === "closed" ? "focus" : undefined}
          buttons={[
            { text: "Нет", disabled: s.st >= 2 },
            {
              text: "Да, сверить",
              variant: "primary",
              loading: s.st === 2,
              force: s.st === 1 ? "hover" : undefined,
              disabled: false,
            },
          ]}
        />
      )}
    />
  );
}

function ErrorDemo() {
  return (
    <Playback<{ st: 0 | 1 | 2 | 3 | 4; p: Phase }>
      initial={{ st: 0, p: "open" }}
      script={[
        { at: 500, set: { st: 1 } },
        { at: 1500, set: { st: 2 } },
        { at: 2300, set: { st: 3 } },
        { at: 3300, set: { st: 4, p: "out" } },
        { at: 3500, set: { p: "closed" } },
      ]}
      tail={1300}
      hint="Ошибка не закрывает окно: плашка встаёт между телом и подвалом, введённое сохраняется."
      render={(s) => (
        <div style={{ width: "100%" }}>
          <div className="ds-dialog-stage" style={{ height: 420 }}>
            {s.p !== "closed" ? (
              <div className="ds-dialog-overlay" data-out={s.p === "out" || undefined}>
                <DialogView
                  spec={SPECS.form}
                  body={<FormBody value="MSKU4821907" onChange={() => undefined} />}
                  error={s.st === 2 ? FORM_ERROR : undefined}
                  buttons={[
                    { text: "Отмена", disabled: s.st === 1 || s.st === 3 },
                    {
                      text: s.st === 1 || s.st === 3 ? "Создаём" : "Создать",
                      variant: "primary",
                      loading: s.st === 1 || s.st === 3,
                    },
                  ]}
                />
              </div>
            ) : null}
          </div>
        </div>
      )}
    />
  );
}

function LayersDemo() {
  const list = (
    <div
      className="ds-popover ds-popover--static"
      style={{
        position: "absolute",
        zIndex: 900,
        top: "52%",
        left: "calc(50% - 150px)",
        width: 300,
        minWidth: 0,
        padding: 6,
        animation: "ds-popover-in .125s var(--ease)",
      }}
      role="listbox"
    >
      {["ООО «Дальснаб»", "ИП Кравец", "ООО «Порт-Трейд»"].map((c) => (
        <div key={c} style={{ padding: "5px 8px", borderRadius: 8, color: "var(--text-2)" }}>
          {c}
        </div>
      ))}
    </div>
  );
  return (
    <Playback<{ p: Phase; pop: boolean }>
      initial={{ p: "closed", pop: false }}
      script={[
        { at: 300, set: { p: "open" } },
        { at: 1400, set: { pop: true } },
        { at: 2800, set: { pop: false } },
        { at: 3800, set: { p: "out" } },
        { at: 4000, set: { p: "closed" } },
      ]}
      tail={900}
      hint="Список поверх окна (z-index 900 > 800). Первый Esc закрывает только его, второй — окно."
      render={(s) => (
        <Stage phase={s.p} kind="form" form value="MSKU" extra={s.pop ? list : null} />
      )}
    />
  );
}

export default defineDoc({
  id: "dialog",
  title: "Dialog",
  group: "overlays",
  cssPrefix: "ds-dialog",
  order: 30,
  keywords: ["окно", "модальное", "modal", "подтверждение", "alertdialog", "диалог"],
  summary:
    "Модальное окно с решением: шапка, середина, подвал. Без крестика: выход только кнопками, «нет» слева, «да» справа, ширина 50/50.",
  purpose:
    "Dialog останавливает работу, чтобы получить решение: подтвердить действие, принять расхождение, заполнить короткую форму. Он перекрывает страницу затемнением и забирает фокус. Крестика нет намеренно: у закрытия должен быть явный смысл («Нет», «Отмена», «Отклонить»). Информация без решения — Alert или Toast; просмотр и правка карточки — Sheet.",
  related: ["sheet", "popover", "alert", "button", "toast"],
  anatomy: {
    demo: (
      <Marks
        block
        items={[
          { n: 1, anchor: ".ds-dialog-plain", side: "t" },
          { n: 2, anchor: ".ds-dialog", side: "r" },
          { n: 3, anchor: ".ds-dialog__header", side: "l" },
          { n: 4, anchor: ".ds-dialog__main", side: "l" },
          { n: 5, anchor: ".ds-dialog__error", side: "r" },
          { n: 6, anchor: ".ds-dialog__footer", side: "l" },
        ]}
      >
        <FormDialogPlain value="MSKU4821907" error={FORM_ERROR} />
      </Marks>
    ),
    parts: [
      {
        name: "Затемнение",
        description:
          "Слой на весь экран, цвет --overlay (45 % тёмный, в тёмной теме 62 %), z-index 800, по центру окно с отступом 16 px. Клик по затемнению окно не закрывает.",
      },
      {
        name: "Окно",
        description:
          "Фон --surface, кольцо 1px --border, тень --shadow-dialog, радиус --r-panel (14). Ширина 400 / 520 / 720, не шире экрана; высота до 100dvh − 32.",
      },
      {
        name: "Шапка",
        description:
          "Минимум 64 px, отступы 16 × 24, заголовок 18 px, 700; снизу линия --divider. Креста нет.",
      },
      {
        name: "Середина",
        description:
          "Прокручивается сама (тонкая полоса), отступы 24, интервал 16, текст --text-2. Шапка и подвал остаются на месте.",
      },
      {
        name: "Плашка ошибки",
        description: "Alert err между серединой и подвалом; появляется при неудачной попытке.",
        optional: true,
      },
      {
        name: "Подвал",
        description:
          "Минимум 64 px, отступы 16 × 24, линия сверху. Две кнопки равной ширины: «нет» (outline) слева, «да» (primary или destructive) справа.",
      },
    ],
  },
  variants: [
    {
      id: "confirm",
      title: "Подтверждение · sm 400",
      description: "Короткий вопрос и пояснение: «Сверить документы?» «Нет» — «Да, сверить».",
      when: "действие дорогое по времени или необратимое наполовину: запуск сверки, отправка.",
      demo: <DialogPlain spec={SPECS.confirm} />,
    },
    {
      id: "decision",
      title: "Принять / Отклонить · md 520",
      description:
        "Вопрос с данными решения (сводка «было/стало»); кнопки называют исход, а не «Да/Нет».",
      when: "решение по объекту: принять расхождение, подписать, отправить.",
      demo: <DialogPlain spec={SPECS.decision} />,
    },
    {
      id: "danger",
      title: "Опасное действие · sm",
      description:
        "«Да» становится destructive и называет действие («В архив»), текст говорит, как вернуть.",
      when: "архивирование, удаление, отключение: последствия трудно откатить.",
      demo: <DialogPlain spec={SPECS.danger} />,
    },
    {
      id: "form",
      title: "Форма · md 520",
      description:
        "Поля в середине; «да» отключено, пока форма невалидна; ошибка отправки — плашкой над подвалом.",
      when: "создание объекта из 2–5 полей; больше — Sheet.",
      demo: (
        <FormDialogPlain
          value="MSKU482"
          buttons={[{ text: "Отмена" }, { text: "Создать", variant: "primary", disabled: true }]}
        />
      ),
    },
    {
      id: "long",
      title: "Длинное содержимое · lg 720",
      description:
        "Середина прокручивается, шапка и подвал на месте. Одна кнопка — справа, не уже половины.",
      when: "журнал, список, текст для чтения; решение не нужно — тогда лучше Sheet.",
      demo: (
        <div style={{ width: "100%" }}>
          <div className="ds-dialog-plain" style={{ maxHeight: 360, overflow: "hidden" }}>
            <DialogView spec={{ ...SPECS.long, size: "lg" }} forStatic />
          </div>
        </div>
      ),
    },
    {
      id: "live",
      title: "Живой",
      description:
        "Все пять окон в рамке: фокус-ловушка, Esc = «нет», выполнение с Spinner, ошибка формы при первой попытке.",
      when: "проверить поведение руками и клавиатурой.",
      demo: <DialogLive />,
    },
  ],
  sizes: [
    {
      id: "sm",
      title: "sm",
      value: "400 px",
      note: "подтверждение, опасное действие",
      demo: <span className="ds-dialog__hint">ширина окна 400</span>,
    },
    {
      id: "md",
      title: "md",
      value: "520 px",
      note: "по умолчанию: решение, форма",
      demo: <span className="ds-dialog__hint">ширина окна 520</span>,
    },
    {
      id: "lg",
      title: "lg",
      value: "720 px",
      note: "длинное содержимое",
      demo: <span className="ds-dialog__hint">ширина окна 720</span>,
    },
  ],
  states: [
    {
      id: "default",
      kind: "default",
      title: "Default",
      note: "Окно открыто, фокус на «да» (в форме — на первом поле).",
      demo: (
        <DialogPlain
          spec={SPECS.confirm}
          buttons={[{ text: "Нет" }, { text: "Да, сверить", variant: "primary" }]}
        />
      ),
    },
    {
      id: "hover",
      kind: "hover",
      title: "Hover кнопки",
      note: "Слой поверх кнопки: 8 % у primary, 6 % у outline. Окно и затемнение не реагируют.",
      forced: true,
      demo: (
        <DialogPlain
          spec={SPECS.confirm}
          buttons={[
            { text: "Нет", force: "hover" },
            { text: "Да, сверить", variant: "primary" },
          ]}
        />
      ),
    },
    {
      id: "active",
      kind: "active",
      title: "Active кнопки",
      note: "Слой плотнее hover: 15 % у primary, 9 % у outline.",
      forced: true,
      demo: (
        <DialogPlain
          spec={SPECS.confirm}
          buttons={[{ text: "Нет" }, { text: "Да, сверить", variant: "primary", force: "active" }]}
        />
      ),
    },
    {
      id: "focus",
      kind: "focus",
      title: "Focus",
      note: "Кольцо 2 px --focus на кнопке «да» при открытии; Tab ходит по кругу внутри окна.",
      forced: true,
      demo: (
        <DialogPlain
          spec={SPECS.confirm}
          buttons={[{ text: "Нет" }, { text: "Да, сверить", variant: "primary", force: "focus" }]}
        />
      ),
    },
    {
      id: "disabled",
      kind: "disabled",
      title: "Disabled «да»",
      note: "Форма невалидна: «Создать» отключено своими цветами (не прозрачностью); подсказка у поля объясняет, что исправить.",
      demo: (
        <FormDialogPlain
          value="MSKU482"
          buttons={[{ text: "Отмена" }, { text: "Создать", variant: "primary", disabled: true }]}
        />
      ),
    },
    {
      id: "loading",
      kind: "loading",
      title: "Loading",
      note: "Нажатое «да» с Spinner, «нет» отключена, Esc не работает; окно закроется само, когда операция закончится.",
      demo: (
        <DialogPlain
          spec={SPECS.confirm}
          buttons={[
            { text: "Нет", disabled: true },
            { text: "Да, сверить", variant: "primary", loading: true },
          ]}
        />
      ),
    },
    {
      id: "error",
      kind: "error",
      title: "Error",
      note: "Плашка err между серединой и подвалом; данные формы сохранены, кнопки снова доступны.",
      demo: (
        <FormDialogPlain
          value="MSKU4821907"
          error={FORM_ERROR}
          buttons={[{ text: "Отмена" }, { text: "Создать", variant: "primary" }]}
        />
      ),
    },
    NA(
      "empty",
      "empty",
      "Empty",
      "Нет. Окно без содержимого не открывают; пустой список внутри — пустое состояние в середине.",
    ),
  ],
  rules: {
    use: [
      "Заголовок — вопрос или решение: «Сверить документы?», «Отправить груз в архив?».",
      "Кнопки называют исход: «Да, сверить», «В архив», «Принять», а не «ОК».",
      "«Нет» всегда слева, «да» — справа; на destructive повесьте красную кнопку «да» и опишите, как вернуть.",
      "Esc равен левой кнопке («нет»); оно же закрытие без последствий.",
      "Не больше двух кнопок; три выбора — это Sheet или страница.",
    ],
    avoid: [
      "Крестик в шапке: у закрытия должен быть явный исход.",
      "Окно поверх окна: если нужен выбор внутри формы, используйте Select/Popover (они выше по z-index).",
      "Dialog для сообщения без решения: это Alert или Toast.",
      "Закрытие по клику на затемнение: решение потеряется незаметно (в макете клик не закрывает).",
      "Длинная форма: от шести полей берите Sheet.",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: "role=dialog и alertdialog",
      text: 'Окно — role="dialog", aria-modal="true", aria-labelledby на заголовок (в макете aria-labelledby нет — добавлено). Для опасного действия предложено role="alertdialog" [TODO]: макет везде ставит dialog.',
    },
    {
      kind: "focus",
      title: "Фокус-ловушка",
      text: "Tab и Shift+Tab ходят по кругу внутри окна (кнопки, поля); страница под ним недоступна (inert). Окно имеет tabindex=-1, чтобы принять фокус, если фокусируемых элементов нет.",
    },
    {
      kind: "focus",
      title: "Куда идёт фокус при открытии",
      text: "На главную кнопку («да», у destructive — тоже на красную; [TODO] предложение: безопасную «нет», чтобы Enter не удалял), в форме — на первое поле.",
    },
    {
      kind: "focus",
      title: "Куда фокус возвращается при закрытии",
      text: "На элемент, открывший окно (запомнен до открытия), в момент начала закрытия. Если он исчез (строку удалили), — на заголовок страницы [TODO].",
    },
    {
      kind: "key",
      title: "Esc",
      text: "Esc = левая кнопка («нет»), пока нет операции; во время выполнения — игнорируется. Открытый поверх Popover закрывается первым: Esc принадлежит верхнему слою.",
    },
    {
      kind: "key",
      title: "Enter",
      text: "Нажимает кнопку в фокусе. В форме Enter в поле отправляет форму [TODO] макет не обрабатывает.",
    },
    {
      kind: "contrast",
      title: "Контраст",
      text: "Текст --text на surface 16,5:1 (тёмная 16,4:1), пояснение --text-2 8,2:1 (11,3:1). Затемнение 45 % на белом даёт границу 3,0:1 между окном и фоном.",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Появление и уход без масштаба и сдвига; затемнение включается мгновенно.",
    },
  ],
  tokens: [
    {
      name: "--overlay",
      value: "rgba(14,20,28,.45) (тёмная rgba(0,0,0,.62))",
      usage: "Затемнение",
      kind: "color",
    },
    {
      name: "--surface / --border / --divider",
      value: "#fff / #c6cdd6 / #e0e4e9",
      usage: "Фон, кольцо, линии между частями",
      kind: "color",
    },
    {
      name: "--shadow-dialog",
      value: "0 24px 64px · 0 2px 6px",
      usage: "Тень окна",
      kind: "shadow",
    },
    { name: "--r-panel", value: "14 px", usage: "Радиус окна", kind: "radius" },
    {
      name: "width",
      value: "400 · 520 · 720 px",
      usage: "sm · md · lg; ≤ 100 % − 32",
      kind: "size",
    },
    {
      name: "header / footer",
      value: "min 64 px, padding 16 × 24",
      usage: "Шапка и подвал",
      kind: "size",
    },
    { name: "body padding / gap", value: "24 / 16 px", usage: "Середина", kind: "size" },
    { name: "--fs-heading", value: "18 px, 700", usage: "Заголовок", kind: "font" },
    {
      name: "z-index",
      value: "800",
      usage: "Окно и Sheet; Popover 900, Tooltip 1000, Loader 1100, Toast 1200",
      kind: "other",
    },
    {
      name: "overlay fade",
      value: "200 мс ease",
      usage: "Появление и уход затемнения",
      kind: "time",
    },
    {
      name: "dialog in",
      value: "300 мс, --ease",
      usage: "opacity 0, scale .96, сдвиг 8 px → 1",
      kind: "time",
    },
    {
      name: "dialog out",
      value: "200 мс, ease",
      usage: "opacity → 0, scale .98, сдвиг 4 px",
      kind: "time",
    },
  ],
  choreography: [
    {
      id: "open",
      title: "Открытие",
      trigger: "нажатие на кнопку, открывающую окно",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Кнопка-источник: hover, затем active, фокус остаётся на ней до открытия.",
          prop: "background",
          easing: "ease",
        },
        {
          at: 0,
          dur: 0,
          what: "Запоминается элемент в фокусе. Затемнение и окно вставляются в body (z-index 800); страница под ними получает inert.",
          prop: "—",
        },
        { at: 0, dur: 200, what: "Затемнение: opacity 0 → 1.", prop: "opacity", easing: "ease" },
        {
          at: 0,
          dur: 300,
          what: "Окно: opacity 0 → 1, scale .96 → 1, сдвиг вниз 8 px → 0.",
          prop: "opacity, scale, translate",
          easing: "--ease",
        },
        {
          at: 0,
          dur: 0,
          what: "Фокус уходит на главную кнопку (в форме — на первое поле).",
          prop: "focus",
        },
      ],
      focus:
        "С кнопки-источника на «да» (в форме — на поле). Дальше Tab ходит по кругу внутри окна.",
      reducedMotion: "Затемнение и окно появляются мгновенно, без масштаба и сдвига.",
      neighbours:
        "Страница остаётся на месте и не прокручивается [TODO] блокировка прокрутки в макете не сделана. Нижний слой (Sheet тоже 800) остаётся под окном: выше в DOM — выше на экране.",
      demo: <OpenDemo />,
    },
    {
      id: "close",
      title: "Закрытие",
      trigger: "кнопка «нет» / «да» после выполнения / Esc",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Окно снимается со стека, фокус сразу возвращается на кнопку-источник.",
          prop: "focus",
        },
        { at: 0, dur: 200, what: "Затемнение: opacity 1 → 0.", prop: "opacity", easing: "ease" },
        {
          at: 0,
          dur: 200,
          what: "Окно: opacity → 0, scale → .98, сдвиг вниз 4 px.",
          prop: "opacity, scale, translate",
          easing: "ease",
        },
        { at: 200, dur: 0, what: "Узлы удаляются из DOM, inert со страницы снят.", prop: "—" },
      ],
      focus: "На кнопку, открывшую окно — сразу, не после анимации.",
      reducedMotion: "Мгновенно.",
      neighbours: "Слои под окном (страница, поповеры) возвращаются без анимации.",
      demo: <CloseDemo />,
    },
    {
      id: "loading",
      title: "«Да» с выполнением",
      trigger: "нажатие на «да»",
      origin: "mockup",
      steps: [
        { at: 0, dur: 125, what: "Слой hover/active у «да».", prop: "background", easing: "ease" },
        {
          at: 0,
          dur: 0,
          what: "«Да» получает Spinner и aria-busy, pointer-events отключены; «нет» блокируется; Esc перестаёт работать.",
          prop: "—",
        },
        {
          at: 900,
          dur: 0,
          what: "Операция закончилась (в макете 0,9 с для подтверждения, 0,7 с для остальных): запускается закрытие.",
          prop: "—",
        },
      ],
      focus: "Остаётся на «да»: кнопка не disabled, а aria-busy. После закрытия — на источник.",
      reducedMotion: "Spinner замедляется до 3 с на оборот; остальное без переходов.",
      neighbours:
        "Размер окна не меняется: подпись «Да, сверить» остаётся, добавляется только Spinner.",
      demo: <LoadDemo />,
    },
    {
      id: "error",
      title: "Ошибка формы и повтор",
      trigger: "«Создать» вернула ошибку",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "«Создать» → Spinner, подпись «Создаём»; «Отмена» отключена.",
          prop: "—",
        },
        {
          at: 900,
          dur: 0,
          what: "Ответ с ошибкой: Spinner уходит, кнопки доступны, между серединой и подвалом появляется плашка err «Не удалось создать груз» с действием «Повторить». Данные формы сохранены.",
          prop: "—",
        },
        {
          at: 900,
          dur: 0,
          what: "Окно растёт на высоту плашки; середина при необходимости прокручивается.",
          prop: "height",
        },
        {
          at: 1800,
          dur: 900,
          what: "Повтор: те же 0,9 с с Spinner; на успех окно закрывается.",
          prop: "—",
        },
      ],
      focus:
        "Кнопка «Создать» была отключена на время выполнения и потеряла фокус [TODO]: вернуть его на «Создать» или на плашку ошибки.",
      reducedMotion: "Без переходов.",
      neighbours: "Подвал остаётся на месте внизу окна, середина сжимается.",
      demo: <ErrorDemo />,
    },
    {
      id: "layers",
      title: "Слои: список поверх окна",
      trigger: "открыт Select/Popover внутри Dialog",
      origin: "mockup",
      steps: [
        { at: 0, dur: 300, what: "Dialog z-index 800 над страницей.", prop: "z-index" },
        {
          at: 1100,
          dur: 125,
          what: "Popover z-index 900 появляется поверх окна: pop .125 с.",
          prop: "opacity, scale, translate",
          easing: "--ease",
        },
        {
          at: 2500,
          dur: 0,
          what: "Esc: закрывается только поповер (Esc принадлежит верхнему слою), окно остаётся.",
          prop: "—",
        },
        {
          at: 3500,
          dur: 200,
          what: "Второй Esc: закрывается окно (как «нет»).",
          prop: "opacity, scale",
          easing: "ease",
        },
      ],
      focus:
        "Фокус уходит в поповер, при его закрытии возвращается на поле в окне; при закрытии окна — на источник.",
      reducedMotion: "Появление поповера мгновенное.",
      neighbours:
        "Слои: Dialog 800 < Popover 900 < Tooltip 1000 < Loader 1100 < Toast 1200 (язычок и пузырь агента 810 — над Dialog/Sheet 800, но под Popover).",
      demo: <LayersDemo />,
    },
  ],
  examples: [
    {
      id: "confirm",
      title: "Подтверждение",
      demo: <ConfirmDialogExample />,
      code: `<Button variant="outline" onClick={() => setOpen(true)}>Сверить документы</Button>

<Dialog
  open={open}
  onOpenChange={setOpen}
  size="sm"
  title="Сверить документы?"
  footer={
    <>
      <Button variant="outline" onClick={() => setOpen(false)}>Нет</Button>
      <Button onClick={run}>Да, сверить</Button>
    </>
  }
>
  <p className="ds-dialog__text">
    Сравним вес, код ТН ВЭД и номера в накладной, декларации и инвойсе по 128 грузам.
  </p>
</Dialog>`,
    },
    {
      id: "danger",
      title: "Опасное действие",
      demo: <DangerDialogExample />,
      code: `<Button variant="destructive" onClick={() => setOpen(true)}>В архив</Button>

<Dialog
  open={open}
  onOpenChange={setOpen}
  size="sm"
  role="alertdialog"
  title="Отправить груз в архив?"
  footer={
    <>
      <Button variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
      <Button variant="destructive" onClick={archive}>В архив</Button>
    </>
  }
>
  <p className="ds-dialog__text">
    Груз пропадёт из рабочего списка. Вернуть его можно в разделе «Архив».
  </p>
</Dialog>`,
    },
  ],
});
