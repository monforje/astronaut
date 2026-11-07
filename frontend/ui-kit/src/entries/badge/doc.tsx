/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Marks } from "@/engine/Callout";
import { Playback } from "@/engine/Playback";
import { defineDoc, type StateSpec } from "@/engine/types";
import { DemoButton } from "../button/demo";
import { DemoBadge, TONE_LABEL, ToneRow, type BadgeTone } from "./demo";

const NA = (id: string, kind: StateSpec["kind"], title: string, note: string): StateSpec => ({
  id,
  kind,
  title,
  note,
  notApplicable: true,
});

const states: StateSpec[] = [
  {
    id: "ok",
    kind: "other",
    title: "Сверено · ok",
    note: "Данные совпали, документ принят. Teal-подложка, текст --ok-text.",
    demo: <DemoBadge tone="ok">Сверено</DemoBadge>,
  },
  {
    id: "warn",
    kind: "other",
    title: "Ждём · warn",
    note: "Ждём ответа или документ. Orange-подложка, текст --warn-text.",
    demo: <DemoBadge tone="warn">Ждём</DemoBadge>,
  },
  {
    id: "err",
    kind: "other",
    title: "Расхождение · err",
    note: "Нужно решение человека. Красная подложка, текст --err-text.",
    demo: <DemoBadge tone="err">Расхождение</DemoBadge>,
  },
  {
    id: "info",
    kind: "other",
    title: "В пути · info",
    note: "Процесс идёт, ничего делать не нужно. Синяя подложка.",
    demo: <DemoBadge tone="info">В пути</DemoBadge>,
  },
  {
    id: "idle",
    kind: "default",
    title: "Черновик · idle",
    note: "Нейтральный: черновик, архив, «не задано». Серая подложка; это и значение по умолчанию.",
    demo: <DemoBadge tone="idle">Черновик</DemoBadge>,
  },
  NA(
    "hover",
    "hover",
    "Hover",
    "Бейдж не интерактивен. В кнопке он получает hover кнопки, сам не меняется (pointer-events: none).",
  ),
  NA("active", "active", "Active", "Нет. Нужна нажимаемая метка — берите Toggle-chip."),
  NA(
    "focus",
    "focus",
    "Focus",
    "Не в порядке Tab. Смысл бейджа читается из текста, а не из фокуса.",
  ),
  NA(
    "disabled",
    "disabled",
    "Disabled",
    "Нет. «Недоступно» выражается тоном idle и текстом, а не затемнением.",
  ),
  NA("loading", "loading", "Loading", "Нет. Пока статус неизвестен — Skeleton на месте бейджа."),
  NA(
    "error",
    "error",
    "Error",
    "Ошибка — это тон err, то есть значение, а не состояние компонента.",
  ),
  NA("empty", "empty", "Empty", "Пустой бейдж не показывают: нет статуса — нет бейджа."),
];

function StatusChangeDemo() {
  return (
    <Playback<{ tone: BadgeTone }>
      initial={{ tone: "err" }}
      script={[
        { at: 500, set: { tone: "warn" } },
        { at: 1500, set: { tone: "ok" } },
      ]}
      tail={900}
      hint="Предложение для проверки: смена статуса идёт переходом цвета, а не заменой узла."
      render={(s) => <DemoBadge tone={s.tone}>{TONE_LABEL[s.tone]}</DemoBadge>}
    />
  );
}

function InButtonDemo() {
  return (
    <Playback<{ f?: "hover" | "active" }>
      initial={{}}
      script={[
        { at: 400, set: { f: "hover" } },
        { at: 1300, set: { f: "active" } },
        { at: 1600, set: { f: "hover" } },
        { at: 2400, set: { f: undefined } },
      ]}
      tail={600}
      render={(s) => (
        <>
          <DemoButton variant="outline" size="sm" force={s.f}>
            <DemoBadge tone="err">Расхождение</DemoBadge>
          </DemoButton>
          <DemoButton variant="outline" size="sm" icon="cols" iconEnd="chev" force={s.f}>
            Фильтр
          </DemoButton>
        </>
      )}
    />
  );
}

function PingDemo() {
  return (
    <Playback<{ n: number }>
      initial={{ n: 0 }}
      script={[
        { at: 300, set: { n: 1 } },
        { at: 6200, set: { n: 0 } },
      ]}
      tail={600}
      hint="Пульс бесконечен, пока счётчик на экране: 2,4 с на кольцо. Здесь его показывает шесть секунд."
      render={(s) =>
        s.n ? (
          <span style={{ display: "inline-flex", padding: 14 }}>
            <DemoBadge form="counter" pulse>
              1
            </DemoBadge>
          </span>
        ) : (
          <span style={{ color: "var(--text-3)" }}>счётчика нет</span>
        )
      }
    />
  );
}

export default defineDoc({
  id: "badge",
  title: "Badge",
  group: "data",
  cssPrefix: "ds-badge",
  order: 20,
  keywords: [
    "статус",
    "status",
    "метка",
    "label",
    "тег",
    "tag",
    "счётчик",
    "counter",
    "chip",
    "чип",
    "плашка",
    "бейдж",
    "badge",
    "индикатор",
    "точка",
    "dot",
    "pill",
    "уведомление",
  ],
  summary:
    "Короткая метка со статусом, количеством или категорией. Пять тонов, четыре формы, два размера.",
  purpose:
    "Бейдж сообщает состояние объекта в строке, карточке или шапке: «Сверено», «Расхождение», «В пути». Он не нажимается и не заменяет кнопку. Тон — это смысл (успех, ожидание, ошибка, процесс, нейтральный), цвет без текста смысл не передаёт: подпись обязательна.",
  related: ["avatar", "alert", "button"],
  anatomy: {
    demo: (
      <Marks
        items={[
          { n: 1, anchor: ".ds-badge", side: "t" },
          { n: 2, anchor: ".ds-badge__dot", side: "l" },
          { n: 3, anchor: ".ds-badge__label", side: "r" },
          { n: 4, anchor: ".ds-badge .ds-icon", side: "b" },
        ]}
      >
        <DemoBadge tone="err" icon="alert">
          Расхождение
        </DemoBadge>
      </Marks>
    ),
    parts: [
      {
        name: "Подложка",
        description:
          "Высота 20 (16 в sm), радиус pill (4 у tag), цвет тона 16 % и кольцо 1px 28 %.",
      },
      {
        name: "Точка",
        description: "6 px цветом тона; у статуса в таблице. В sm, tag и счётчике нет.",
        optional: true,
      },
      {
        name: "Подпись",
        description:
          "Onest 600, 12 px (11 в sm и tag). Текст тона: --ok-text, --err-text… — темнее самого цвета, чтобы читался.",
      },
      {
        name: "Значок",
        description: "12 px перед подписью: часы у SLA, флажок у вехи.",
        optional: true,
      },
    ],
  },
  variants: [
    {
      id: "dot",
      title: "Статус с точкой",
      description: "Основной бейдж таблицы и карточки: точка + слово.",
      when: "статус объекта: Сверено, Ждём, Расхождение, В пути, Черновик.",
      demo: (
        <ToneRow>
          {(t) => (
            <DemoBadge key={t} tone={t}>
              {TONE_LABEL[t]}
            </DemoBadge>
          )}
        </ToneRow>
      ),
    },
    {
      id: "plain",
      title: "Компактный",
      description: "16 px, без точки. Короткое слово или число.",
      when: "количество рядом с заголовком, «Ок» в списке документов.",
      demo: (
        <>
          <DemoBadge size="sm" form="plain" tone="ok">
            Ок
          </DemoBadge>
          <DemoBadge size="sm" form="plain" tone="err">
            7
          </DemoBadge>
          <DemoBadge size="sm" form="plain" tone="warn">
            Ждём
          </DemoBadge>
        </>
      ),
    },
    {
      id: "solid",
      title: "Залитый",
      description: "Сплошная заливка тона вместо подложки. Текст navy (на err — белый).",
      when: "«Новое», «Ошибка»: когда метку нужно увидеть издалека. Не более одной на экран.",
      demo: (
        <>
          <DemoBadge size="sm" form="plain" tone="ok" solid>
            Новое
          </DemoBadge>
          <DemoBadge size="sm" form="plain" tone="err" solid>
            Ошибка
          </DemoBadge>
        </>
      ),
    },
    {
      id: "tag",
      title: "Тег",
      description: "Квадратный (радиус 4), заглавные, 11 px, 700, разрядка 0,04 em.",
      when: "категория объекта, не статус: Морской, ЭДО, ВЭД.",
      demo: (
        <>
          <DemoBadge form="tag" tone="info">
            Морской
          </DemoBadge>
          <DemoBadge form="tag" tone="idle">
            ЭДО
          </DemoBadge>
          <DemoBadge form="tag" tone="warn">
            ВЭД
          </DemoBadge>
        </>
      ),
    },
    {
      id: "icon",
      title: "Со значком",
      description: "Значок 12 px вместо точки: срок, веха, закрепление.",
      when: "SLA («до прибытия 2 д 4 ч»), вехи («Таможня»).",
      demo: (
        <>
          <DemoBadge form="plain" tone="ok" icon="clock">
            6 ч 20 м
          </DemoBadge>
          <DemoBadge form="plain" tone="warn" icon="clock">
            1 ч 05 м
          </DemoBadge>
          <DemoBadge form="plain" tone="err" icon="clock">
            −45 м
          </DemoBadge>
          <DemoBadge form="plain" tone="info" icon="flag">
            Таможня
          </DemoBadge>
        </>
      ),
    },
    {
      id: "counter",
      title: "Счётчик",
      description: "Красный круглый, 17 px, кольцо цвета поверхности. Может пульсировать.",
      when: "количество непрочитанного на значке (язычок агента). Не для статуса.",
      demo: (
        <span style={{ display: "inline-flex", padding: 6 }}>
          <DemoBadge form="counter" pulse>
            3
          </DemoBadge>
        </span>
      ),
    },
  ],
  sizes: [
    {
      id: "heights",
      title: "Высота",
      value: "20 · 16 px",
      note: "по умолчанию · sm",
      demo: (
        <>
          <DemoBadge tone="ok">Сверено</DemoBadge>
          <DemoBadge tone="ok" size="sm" form="plain">
            Сверено
          </DemoBadge>
          <DemoBadge form="counter">12</DemoBadge>
        </>
      ),
    },
  ],
  states,
  stateMatrix: {
    columns: ["Подложка", "Залитый", "Тег"],
    rows: (["ok", "warn", "err", "info", "idle"] as BadgeTone[]).map((t) => ({
      label: t,
      cells: [
        <DemoBadge key="a" tone={t}>
          {TONE_LABEL[t]}
        </DemoBadge>,
        <DemoBadge key="b" tone={t} form="plain" solid>
          {TONE_LABEL[t]}
        </DemoBadge>,
        <DemoBadge key="c" tone={t} form="tag">
          ЭДО
        </DemoBadge>,
      ],
    })),
  },
  choreography: [
    {
      id: "status-change",
      title: "Смена статуса",
      trigger: "статус объекта изменился (агент исправил расхождение, пришёл документ)",
      origin: "proposal",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Подложка, кольцо и цвет текста идут к новому тону; текст меняется сразу.",
          prop: "background, color, box-shadow",
          easing: "ease",
        },
        {
          at: 0,
          dur: 125,
          what: "Точка перекрашивается тем же переходом.",
          prop: "background",
          easing: "ease",
        },
      ],
      focus: "Бейдж не получает фокус; если рядом строка в фокусе, она его не теряет.",
      reducedMotion: "Переход отключается: цвет меняется мгновенно.",
      neighbours:
        "Ширина бейджа может измениться вместе с текстом, соседние ячейки не пересчитываются: таблице задают ширину колонки со статусом. [TODO] подтвердить: макет перерисовывает бейдж без перехода.",
      demo: <StatusChangeDemo />,
    },
    {
      id: "in-button",
      title: "Бейдж внутри кнопки или строки",
      trigger: "наведение и нажатие на кнопку, в которой лежит бейдж",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Кнопка получает слой hover. Бейдж не меняется.",
          prop: "background (кнопки)",
          easing: "ease",
        },
        {
          at: 900,
          dur: 125,
          what: "Нажатие: слой active у кнопки; бейдж не реагирует.",
          prop: "background (кнопки)",
          easing: "ease",
        },
      ],
      focus: "Кольцо рисует кнопка вокруг себя вместе с бейджем; сам бейдж в Tab не входит.",
      reducedMotion: "Переход слоя кнопки отключается.",
      neighbours:
        "Бейдж в кнопке — pointer-events: none: события идут кнопке, подсказки у бейджа нет.",
      demo: <InButtonDemo />,
    },
    {
      id: "ping",
      title: "Пульс счётчика",
      trigger: "счётчик появился и не обнулён",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 1680,
          what: "Кольцо за счётчиком растёт от 1× до 2,1× и тает с 55 % до 0 (на 70 % цикла).",
          prop: "scale, opacity",
          easing: "ease-out",
        },
        { at: 1680, dur: 720, what: "Пауза до конца цикла 2,4 с, затем снова.", prop: "—" },
      ],
      focus:
        "Не связан: пульс декоративный, смысл несёт число. Объявляйте обновление счётчика через aria-live у контейнера, а не через анимацию.",
      reducedMotion: "Пульс выключается, остаётся статичный счётчик.",
      neighbours:
        "Кольцо уходит за границы счётчика (до 2,1×), но лежит под ним (z-index −1) и не двигает соседей.",
      demo: <PingDemo />,
    },
  ],
  rules: {
    use: [
      "Статус объекта в таблице или карточке: слово + цвет тона.",
      "Категория или канал: tag («ЭДО», «Морской»).",
      "Число рядом с заголовком: компактный sm.",
      "Срок: значок часов и время, тон по запасу времени (запас · мало · просрочено).",
      "Один смысл — один тон во всём продукте: «Расхождение» везде err.",
    ],
    avoid: [
      "Нажимаемый бейдж: нужна кнопка или Toggle-chip.",
      "Цвет без слова: тон дублируется подписью.",
      "Длинные фразы: бейдж — одно-два слова; остальное в подсказку или текст рядом.",
      "Залитые бейджи в каждой строке: заливка — исключение.",
      "Красный счётчик как статус «ошибка»: счётчик — про количество.",
    ],
  },
  a11y: [
    {
      kind: "note",
      title: "Роль",
      text: 'Обычный текст в <span>. Role="status" не ставят: бейдж в списке — не событие. Для обновляемого счётчика — aria-live="polite" на контейнере.',
    },
    {
      kind: "key",
      title: "Клавиатура",
      text: "Бейдж не фокусируется. Если нужен переход по метке, это кнопка или link.",
    },
    {
      kind: "aria",
      title: "aria-hidden на точке и значке",
      text: "Точка и значок декоративны; смысл — в тексте.",
    },
    {
      kind: "aria",
      title: "Счётчик",
      text: "Читается как число; для «непрочитано» добавляйте скрытое слово («3 непрочитанных») или aria-label у родителя.",
    },
    {
      kind: "contrast",
      title: "Текст тона на подложке",
      text: "Светлая тема, подложка 16 % тона поверх белого. Сам --ok-text / --warn-text / --err-text на ней даёт 4,3 / 4,5 / 4,4:1 — на пределе, поэтому текст бейджа смешан с --text (75 / 25): ok 5,9:1, warn 6,2:1, err 6,1:1, info 6,9:1, idle 8,1:1. Палитра бренда и роли в tokens.css не менялись. Тёмная тема: смесь светлее исходного текста, контраст выше прежних 7,6:1.",
    },
    {
      kind: "contrast",
      title: "Залитые",
      text: "Navy на teal 7,4:1 и на orange 6,2:1. Idle-solid: --surface на --text-3, 4,9:1 (светлая) и 7,6:1 (тёмная). Info-solid: --on-danger на --info, 5,2:1 и 8,3:1. Err-solid и счётчик: фон — --danger, белый текст в светлой теме даёт 4,9:1, в тёмной --on-danger на #ff6b6b 6,6:1. Палитра бренда не менялась.",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Пульс счётчика выключается; переход цвета при смене тона отключается.",
    },
  ],
  tokens: [
    {
      name: "--teal / --ok-text",
      value: "#00d4d0 / #00807a (тёмная #2de3df)",
      usage: "Тон ok: цвет подложки и цвет текста",
      kind: "color",
    },
    {
      name: "--orange / --warn-text",
      value: "#ff9455 / #b45309 (тёмная #ffb067)",
      usage: "Тон warn",
      kind: "color",
    },
    {
      name: "--danger / --err-text",
      value: "#d03538 / #c92a2a (тёмная #ff6b6b / #ff8d8d)",
      usage: "Тон err и красный счётчик",
      kind: "color",
    },
    {
      name: "--info / --info-text",
      value: "#2563eb / #1d4ed8 (тёмная #7ab0ff / #9cc4ff)",
      usage: "Тон info",
      kind: "color",
    },
    {
      name: "--text-3 / --text-2",
      value: "#66727f / #44505d",
      usage: "Тон idle: цвет и текст",
      kind: "color",
    },
    {
      name: "--on-primary / --on-danger",
      value: "navy / белый",
      usage: "Текст залитых бейджей и счётчика",
      kind: "color",
    },
    {
      name: "--surface",
      value: "#fff / #151b23",
      usage: "Кольцо 2px вокруг счётчика",
      kind: "color",
    },
    {
      name: "height",
      value: "20 · 16 · 17 (счётчик) px",
      usage: "Обычный · sm · counter",
      kind: "size",
    },
    {
      name: "--r-pill / --r-control",
      value: "999 / 4 px",
      usage: "Радиус бейджа · тега",
      kind: "radius",
    },
    {
      name: "--fs-control / --fs-info",
      value: "12 / 11 px, вес 600 (tag 700)",
      usage: "Размер подписи",
      kind: "font",
    },
    {
      name: "--dur-f",
      value: "125 мс",
      usage: "Переход цвета при смене тона (предложение)",
      kind: "time",
    },
    {
      name: "ping",
      value: "2,4 с, ease-out, бесконечно",
      usage: "Пульс счётчика: scale 1→2,1, opacity .55→0",
      kind: "time",
    },
  ],
  examples: [
    {
      id: "row",
      title: "Статус в строке груза",
      demo: (
        <>
          <b>MSKU4821907</b>
          <DemoBadge tone="err">Расхождение</DemoBadge>
          <DemoBadge form="tag" tone="info">
            Морской
          </DemoBadge>
        </>
      ),
      code: `<Badge tone="err">Расхождение</Badge>
<Badge tone="info" form="tag">Морской</Badge>`,
    },
    {
      id: "counter",
      title: "Счётчик в заголовке",
      demo: (
        <>
          <b>Расхождения</b>
          <DemoBadge size="sm" form="plain" tone="err">
            8
          </DemoBadge>
        </>
      ),
      code: `<Badge tone="err" form="plain" size="sm">8</Badge>`,
    },
  ],
});
