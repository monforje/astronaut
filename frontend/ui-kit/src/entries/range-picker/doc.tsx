/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ReactNode } from "react";
import { Marks } from "@/engine/Callout";
import { Playback } from "@/engine/Playback";
import { defineDoc } from "@/engine/types";
import { DemoField } from "../date-picker/demo";
import { TODAY, dayKey } from "../calendar/demo";
import {
  DEFAULT_RANGE,
  DemoRangePanel,
  DemoRangePicker,
  DemoRangeTrigger,
  ReportRangeExample,
} from "./demo";

const d = (m: number, n: number) => new Date(2026, m, n);
const Field = ({ children }: { children: ReactNode }) => (
  <DemoField label="Период" width={260}>
    {children}
  </DemoField>
);
const Stage = ({ children }: { children: ReactNode }) => (
  <div className="ds-rangepicker__stage">{children}</div>
);

function PresetDemo() {
  type S = {
    open: boolean;
    pf?: "hover";
    preset: number | null;
    a: Date;
    b: Date;
    val: [Date, Date];
    ok?: boolean;
  };
  return (
    <Playback<S>
      initial={{
        open: false,
        preset: null,
        a: DEFAULT_RANGE[0],
        b: DEFAULT_RANGE[1],
        val: DEFAULT_RANGE,
      }}
      script={[
        { at: 400, set: { open: true } },
        { at: 1300, set: { pf: "hover" } },
        { at: 1700, set: { preset: 3, a: d(9, 14), b: d(10, 12), pf: undefined } },
        { at: 2800, set: { ok: true } },
        { at: 3200, set: { open: false, val: [d(9, 14), d(10, 12)], ok: false } },
      ]}
      tail={900}
      hint="Открытие, быстрый период «Последние 30 дней», «Применить»."
      render={(s) => (
        <Stage>
          <Field>
            <div className="ds-datepicker__anchor">
              <DemoRangeTrigger value={s.val} open={s.open} />
              {s.open ? (
                <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 5 }}>
                  <DemoRangePanel
                    a={s.a}
                    b={s.b}
                    preset={s.preset}
                    presetForce={s.pf ? { index: 3, force: s.pf } : undefined}
                  />
                </div>
              ) : null}
            </div>
          </Field>
        </Stage>
      )}
    />
  );
}

function PickDemo() {
  type S = { a: Date | null; b: Date | null; hover: Date | null };
  return (
    <Playback<S>
      initial={{ a: null, b: null, hover: null }}
      script={[
        { at: 400, set: { a: d(10, 16) } },
        { at: 800, set: { hover: d(10, 18) } },
        { at: 1100, set: { hover: d(10, 20) } },
        { at: 1400, set: { hover: d(10, 24) } },
        { at: 1900, set: { b: d(10, 24), hover: null } },
      ]}
      tail={1100}
      hint="До второго клика «Применить» неактивна, подпись просит выбрать конец."
      render={(s) => (
        <Stage>
          <div style={{ width: "100%", display: "grid", justifyItems: "center" }}>
            <DemoRangePanel
              a={s.a}
              b={s.b}
              hover={s.hover}
              view={d(10, 1)}
              calendar={{ force: s.hover ? { [dayKey(s.hover)]: "hover" } : {} }}
            />
          </div>
        </Stage>
      )}
    />
  );
}

export default defineDoc({
  id: "range-picker",
  title: "RangePicker",
  group: "time",
  cssPrefix: "ds-rangepicker",
  order: 30,
  keywords: [
    "период",
    "диапазон",
    "диапазон дат",
    "от и до",
    "с по",
    "фильтр по дате",
    "быстрый период",
    "отчёт",
    "range",
    "range picker",
    "date range",
    "period",
    "presets",
    "from to",
  ],
  summary:
    "Кнопка-поле с периодом «6 ноября – 12 ноября 2026»: открывает панель с быстрыми периодами слева и календарём справа; значение меняется только по «Применить».",
  purpose:
    "RangePicker нужен фильтрам и отчётам: период чаще берут готовым («Последние 7 дней»), чем отмечают в календаре. Пока пользователь выбирает, значение черновое; «Отмена» и Esc его отбрасывают. В отличие от DatePicker, вписывать период руками нельзя [TODO] решить, нужен ли ввод с клавиатуры.",
  related: ["calendar", "date-picker", "time-picker", "select"],
  anatomy: {
    demo: (
      <Marks
        items={[
          { n: 1, anchor: ".ds-rangepicker__trigger", side: "t" },
          { n: 2, anchor: ".ds-rangepicker__v svg", side: "l" },
          { n: 3, anchor: ".ds-rangepicker__pre", side: "l" },
          { n: 4, anchor: ".ds-rangepicker__main .ds-cal", side: "t" },
          { n: 5, anchor: ".ds-rangepicker__actions", side: "b" },
        ]}
      >
        <div className="ds-rangepicker__anat">
          <div style={{ width: 280 }}>
            <DemoRangeTrigger open />
          </div>
          <DemoRangePanel a={DEFAULT_RANGE[0]} b={DEFAULT_RANGE[1]} preset={2} view={TODAY} />
        </div>
      </Marks>
    ),
    parts: [
      {
        name: "Поле-кнопка",
        description:
          "Кнопка во всю ширину с рамкой поля; значение «12 ноября» без года у начала, год один у конца.",
      },
      {
        name: "Иконка календаря",
        description:
          "Слева в цвете --link, всегда. Справа шеврон: при открытой панели поворачивается на 180°.",
      },
      {
        name: "Быстрые периоды",
        description:
          "Колонка 160 px слева: Сегодня, Вчера, Последние 7 дней, Последние 30 дней, Этот месяц. Активный период — в --selected.",
      },
      {
        name: "Календарь периода",
        description: "Calendar в режиме range: полоса при наведении, цифры без точек событий.",
      },
      {
        name: "Подпись и кнопки",
        description:
          "«Выберите конец периода» или «6 ноября – 12 ноября 2026 · 7 дн.»; «Отмена» и «Применить», активная только при полном периоде.",
      },
    ],
  },
  variants: [
    {
      id: "default",
      title: "Период по умолчанию",
      description: "В макете поле создаётся со значением «Последние 7 дней» (сегодня и 6 дней до).",
      when: "отчёт или таблица, которая не бывает без периода.",
      demo: (
        <div style={{ width: 280 }}>
          <DemoRangeTrigger />
        </div>
      ),
    },
    {
      id: "live",
      title: "Живой",
      description: "Выберите быстрый период или отметьте два дня.",
      wide: true,
      demo: (
        <div className="ds-rangepicker__stage">
          <DemoRangePicker defaultOpen />
        </div>
      ),
    },
    {
      id: "empty",
      title: "Без периода",
      description: "Предложение: период необязательный — placeholder «Выберите период».",
      demo: (
        <div style={{ width: 280 }}>
          <DemoRangeTrigger empty />
        </div>
      ),
    },
  ],
  extra: [
    {
      id: "panel",
      title: "Панель открыта",
      content: (
        <article className="dx-state">
          <div className="dx-canvas">
            <DemoRangePanel a={DEFAULT_RANGE[0]} b={DEFAULT_RANGE[1]} preset={2} view={TODAY} />
          </div>
          <div className="dx-state__cap">
            <b>Быстрые периоды, календарь, подпись, действия</b>
            <small>Ширина 448 px: колонка 160 и календарь 288.</small>
          </div>
        </article>
      ),
    },
  ],
  states: [
    {
      id: "default",
      kind: "default",
      title: "Default",
      note: "Рамка --border, иконка --link, текст --text.",
      demo: (
        <Field>
          <DemoRangeTrigger />
        </Field>
      ),
    },
    {
      id: "hover",
      kind: "hover",
      title: "Hover",
      note: "Рамка --text-3.",
      forced: true,
      demo: (
        <Field>
          <DemoRangeTrigger force="hover" />
        </Field>
      ),
    },
    {
      id: "focus",
      kind: "focus",
      title: "Focus",
      note: "Рамка --focus и кольцо 3 px --selected. То же при открытой панели (aria-expanded).",
      forced: true,
      demo: (
        <Field>
          <DemoRangeTrigger force="focus" />
        </Field>
      ),
    },
    {
      id: "active",
      kind: "active",
      title: "Active",
      note: "Нет отдельного вида: нажатие открывает панель, поле показывает «открыто».",
      notApplicable: true,
    },
    {
      id: "open",
      kind: "selected",
      title: "Open",
      note: "aria-expanded=true: рамка фокуса, шеврон перевёрнут.",
      demo: (
        <Field>
          <DemoRangeTrigger open />
        </Field>
      ),
    },
    {
      id: "disabled",
      kind: "disabled",
      title: "Disabled",
      note: "Фон прозрачный, рамка --divider, текст --text-ph. Панель не открывается.",
      demo: (
        <Field>
          <DemoRangeTrigger disabled />
        </Field>
      ),
    },
    {
      id: "loading",
      kind: "loading",
      title: "Loading",
      note: "Предложение: заглушка вместо периода, пока значение загружается.",
      demo: (
        <Field>
          <DemoRangeTrigger loading />
        </Field>
      ),
    },
    {
      id: "error",
      kind: "error",
      title: "Error",
      note: "Предложение: рамка --danger и текст причины под полем («Период длиннее 90 дней»). В макете ошибок у периода нет.",
      demo: (
        <DemoField label="Период" width={260} error="Период длиннее 90 дней">
          <DemoRangeTrigger invalid />
        </DemoField>
      ),
    },
    {
      id: "empty",
      kind: "empty",
      title: "Empty",
      note: "Предложение: «Выберите период» цветом --text-ph.",
      demo: (
        <Field>
          <DemoRangeTrigger empty />
        </Field>
      ),
    },
    {
      id: "apply-off",
      kind: "other",
      title: "«Применить» недоступна",
      note: "Пока конец не выбран: серая подложка, текст --text-ph. Подпись «Выберите конец периода».",
      demo: (
        <button
          type="button"
          className="ds-rangepicker__act ds-rangepicker__act--primary"
          disabled
          style={{ width: 120 }}
        >
          Применить
        </button>
      ),
    },
  ],
  choreography: [
    {
      id: "preset",
      title: "Быстрый период и «Применить»",
      trigger: "клик по полю, клик по «Последние 30 дней», клик по «Применить»",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Панель всплывает под полем: прозрачность 0→1, масштаб .96→1, сдвиг 4 px; шеврон поворачивается на 180° за 200 мс.",
          prop: "opacity, scale, translate, rotate",
          easing: "--ease",
        },
        {
          at: 900,
          dur: 125,
          what: "Наведение на период: слой 9 %.",
          prop: "background",
          easing: "ease",
        },
        {
          at: 1300,
          dur: 0,
          what: "Клик по периоду: полоса и месяц календаря меняются сразу (в макете календарь перерисовывается мгновенно), подпись «14 октября – 12 ноября 2026 · 30 дн.», пункт подсвечивается --selected [TODO] в макете подсветки нет.",
          prop: "background",
        },
        {
          at: 2800,
          dur: 0,
          what: "«Применить»: значение пишется в поле, панель исчезает мгновенно, без обратной анимации.",
        },
      ],
      focus:
        "Фокус уходит в панель на выбранный период (proposal); после «Применить» или Esc возвращается на поле.",
      reducedMotion: "Панель без анимации, шеврон переворачивается мгновенно.",
      neighbours:
        "Панель лежит поверх, ширина 448 px; у правого края окна сдвигается влево, чтобы поместиться (maxWidth: none в макете).",
      demo: <PresetDemo />,
    },
    {
      id: "pick",
      title: "Выбор дней мышью",
      trigger: "клик по началу, наведение, клик по концу",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Начало заливается --primary, подпись просит выбрать конец; «Применить» недоступна.",
          prop: "background",
          easing: "ease",
        },
        {
          at: 400,
          dur: 125,
          what: "Полоса растёт и сжимается вслед за курсором; в подписи период без числа дней.",
          prop: "background",
          easing: "ease",
        },
        {
          at: 1500,
          dur: 125,
          what: "Клик по концу: подпись показывает период с числом дней, «Применить» оживает (серый → teal).",
          prop: "background, color",
          easing: "ease",
        },
      ],
      focus: "Фокус остаётся на нажатом дне.",
      reducedMotion: "Фон меняется без перехода.",
      neighbours:
        "Сетка не двигается; подпись под сеткой меняется текстом. Подробнее — Calendar, «Выбор периода».",
      demo: <PickDemo />,
    },
  ],
  rules: {
    use: [
      "Готовые периоды слева: чаще нужен «последний месяц», а не отмечать дни.",
      "Показывать число дней в подписи, пока выбирают: ошибка в день заметна сразу.",
      "Значение меняется только по «Применить»: пока выбирают, таблица за панелью не перестраивается.",
      "Для периода по умолчанию брать «Последние 7 дней».",
    ],
    avoid: [
      "Применять период после первого клика: конец ещё не выбран.",
      "Прятать «Применить»: пользователь не поймёт, как закончить.",
      "Ставить год у обеих дат: «6 ноября 2026 – 12 ноября 2026»; год пишут один раз.",
      "Использовать для одной даты: берите DatePicker.",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: "Поле-кнопка",
      text: 'button с aria-haspopup="dialog" и aria-expanded. Имя — подпись и значение: «Период: 6 ноября – 12 ноября 2026».',
    },
    {
      kind: "aria",
      title: "Панель и календарь",
      text: 'role="dialog", внутри быстрые периоды (кнопки в role=group, текущий — aria-pressed) и календарь role=grid. Подпись внизу — aria-live=polite.',
    },
    {
      kind: "key",
      title: "Enter / Space / Esc",
      text: "Enter и Space открывают панель; Esc закрывает без применения и возвращает фокус на кнопку.",
    },
    {
      kind: "key",
      title: "Внутри календаря",
      text: "Стрелки, Home/End, PageUp/PageDown и Enter — как в Calendar. Первое Enter — начало, второе — конец.",
    },
    {
      kind: "focus",
      title: "Порядок Tab",
      text: "Поле → быстрые периоды → календарь → Отмена → Применить. После «Применить» фокус на поле.",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Анимации панели и шеврона выключены.",
    },
  ],
  tokens: [
    {
      name: "panel",
      value: "160 + 288 px",
      usage: "Быстрые периоды · календарь; --r-popover 12px",
      kind: "size",
    },
    {
      name: "--field / --border",
      value: "#fff / #c6cdd6",
      usage: "Поле-кнопка: фон и рамка",
      kind: "color",
    },
    { name: "--link", value: "#007f7a / teal", usage: "Иконка календаря", kind: "color" },
    {
      name: "--selected / --link-strong",
      value: "teal 15 % · #006662",
      usage: "Текущий быстрый период (предложение)",
      kind: "color",
    },
    {
      name: "--primary / --on-primary",
      value: "teal / navy",
      usage: "«Применить»; края периода",
      kind: "color",
    },
    {
      name: "--surface-muted / --text-ph",
      value: "#eceef2 / #8792a0",
      usage: "«Применить» недоступна",
      kind: "color",
    },
    {
      name: "--dur-f / --dur / --ease",
      value: "125 / 200 мс",
      usage: "Панель; шеврон",
      kind: "time",
    },
  ],
  examples: [
    {
      id: "report",
      title: "Период отчёта",
      demo: <ReportRangeExample />,
      code: `const [range, setRange] = useState<[Date, Date] | null>(lastSevenDays);

<RangePicker label="Период" value={range} onChange={setRange} presets />`,
    },
  ],
});
