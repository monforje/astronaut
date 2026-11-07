/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Marks } from "@/engine/Callout";
import { Playback, type PlaybackStep } from "@/engine/Playback";
import { defineDoc, type StateSpec } from "@/engine/types";
import {
  DemoFile,
  DemoProgress,
  DemoProgressButton,
  DemoProgressCircle,
  DemoSegments,
} from "./demo";

const NA = (id: string, kind: StateSpec["kind"], title: string, note: string): StateSpec => ({
  id,
  kind,
  title,
  note,
  notApplicable: true,
});

const RUN: PlaybackStep<{ v: number }>[] = [0, 12, 27, 41, 58, 63, 79, 91, 100].map((v, i) => ({
  at: 300 + i * 450,
  set: { v },
}));

function RunDemo() {
  return (
    <Playback<{ v: number }>
      initial={{ v: 0 }}
      script={RUN}
      tail={900}
      hint="Заливка догоняет значение за 0,35 с: рывки значений сглаживаются."
      render={(s) => (
        <div style={{ width: "min(100%, 320px)" }}>
          <DemoProgress
            label="Сверка в процессе"
            value={s.v}
            size="lg"
            mode={s.v < 100 ? "str" : undefined}
            tone={s.v === 100 ? "primary" : "primary"}
          />
        </div>
      )}
    />
  );
}

function ButtonRunDemo() {
  return (
    <Playback<{ v: number; st?: "running" | "done" }>
      initial={{ v: 0 }}
      script={[
        { at: 300, set: { v: 3, st: "running" } },
        { at: 900, set: { v: 34 } },
        { at: 1600, set: { v: 68 } },
        { at: 2300, set: { v: 100 } },
        { at: 2800, set: { v: 100, st: "done" } },
      ]}
      tail={900}
      hint="Предложение: заливка внутри кнопки; по завершении кнопка становится primary с галочкой."
      render={(s) => <DemoProgressButton value={s.v} status={s.st} />}
    />
  );
}

function IndDemo() {
  return (
    <Playback<{ mode: "ind" | "det"; v: number }>
      initial={{ mode: "ind", v: 0 }}
      script={[
        { at: 2800, set: { mode: "det", v: 58 } },
        { at: 3600, set: { v: 100 } },
      ]}
      tail={900}
      hint="Предложение: пока размер неизвестен — бегущий отрезок; как только известен — обычная полоса."
      render={(s) => (
        <div style={{ width: "min(100%, 320px)" }}>
          <DemoProgress
            label="Идёт синхронизация…"
            value={s.v}
            mode={s.mode === "ind" ? "ind" : undefined}
            valueText={s.v === 100 ? "79 из 79" : s.v ? "58 из 79" : undefined}
          />
        </div>
      )}
    />
  );
}

export default defineDoc({
  id: "progress",
  title: "Progress",
  group: "feedback",
  cssPrefix: "ds-progress",
  order: 40,
  keywords: [
    "прогресс",
    "прогресс-бар",
    "полоса",
    "полоса загрузки",
    "загрузка",
    "процент",
    "шкала",
    "прогрессбар",
    "кнопка-прогресс",
    "progress",
    "progress bar",
    "progressbar",
    "meter",
    "percent",
    "upload",
    "stepper",
  ],
  summary:
    "Линейный прогресс: полоса с подписью и значением. Тона, неопределённый режим, круговой и сегментный вид, строка загрузки файла и кнопка-прогресс.",
  purpose:
    "Прогресс отвечает «сколько уже». Он нужен, когда у операции есть длина: сверка 128 грузов, загрузка файлов, лимит запросов. Если длины нет — Spinner или неопределённая полоса. Полоса всегда с подписью и числом: цвет и длина смысл не передают.",
  related: ["spinner", "loader", "button", "alert"],
  anatomy: {
    demo: (
      <div className="ds-progress__anat" style={{ width: "min(100%, 360px)" }}>
        <Marks
          block
          items={[
            { n: 1, anchor: ".ds-progress__label", side: "l" },
            { n: 2, anchor: ".ds-progress__value", side: "t" },
            { n: 3, anchor: ".ds-progress__track", side: "b" },
            { n: 4, anchor: ".ds-progress__fill", side: "t" },
            { n: 5, anchor: ".ds-progress__fill", side: "b" },
          ]}
        >
          <DemoProgress
            label="Позиции с ценой"
            value={73}
            valueText="58 из 79"
            mode="str"
            size="lg"
          />
        </Marks>
      </div>
    ),
    parts: [
      {
        name: "Подпись",
        description: "Слева над полосой, --text-2, 12 px: что считаем («Позиции с ценой»).",
      },
      {
        name: "Значение",
        description:
          "Справа, 600, цифры табличные: «58 из 79», «91%». У неопределённой — «неопределённо» или статус.",
      },
      {
        name: "Трек",
        description:
          "Фон полосы --tone (слой 7 %), радиус pill. Высота 4 (sm) / 8 (md) / 12 px (lg).",
      },
      {
        name: "Заливка",
        description: "Цвет тона, радиус как у трека, ширина = значение; растёт за 0,35 с.",
      },
      {
        name: "Полоски",
        description:
          "Диагональные полоски на заливке, бегущие вправо: «работа идёт»; для долгих процессов.",
        optional: true,
      },
    ],
  },
  variants: [
    {
      id: "linear",
      title: "Линейный",
      description: "Подпись, значение и полоса 8 px.",
      when: "известно, сколько сделано: позиции, документы, шаги.",
      demo: (
        <div style={{ width: "min(100%, 280px)" }}>
          <DemoProgress label="Сверено документов" value={91} size="lg" />
        </div>
      ),
    },
    {
      id: "tones",
      title: "Тоны",
      description:
        "primary по умолчанию; info — фоновый процесс; warn — лимит близко; err — лимит исчерпан; idle — не активен.",
      when: "вместе с числом: цвет усиливает смысл, но не заменяет его.",
      demo: (
        <div style={{ display: "grid", gap: 12, width: "min(100%, 280px)" }}>
          <DemoProgress label="Загрузка накладных" value={34} size="sm" tone="info" />
          <DemoProgress label="Лимит запросов к 1С" value={86} tone="warn" />
          <DemoProgress label="Квота хранилища" value={98} tone="err" />
        </div>
      ),
    },
    {
      id: "indeterminate",
      title: "Неопределённый",
      description: "Отрезок 38 % едет слева направо за 1,3 с, значение «неопределённо».",
      when: "размер работы неизвестен: «Идёт синхронизация…».",
      demo: (
        <div style={{ width: "min(100%, 280px)" }}>
          <DemoProgress label="Идёт синхронизация…" mode="ind" />
        </div>
      ),
    },
    {
      id: "striped",
      title: "С полосками",
      description: "Заливка с бегущими диагональными полосками, 1 с на период.",
      when: "долгая операция с известным процентом: сверка, импорт.",
      demo: (
        <div style={{ width: "min(100%, 280px)" }}>
          <DemoProgress label="Сверка в процессе" value={46} size="lg" mode="str" />
        </div>
      ),
    },
    {
      id: "circle",
      title: "Круговой",
      description: "Кольцо 56 px, число в центре.",
      when: "сводка на карточке: квота, готовность.",
      demo: (
        <>
          <DemoProgressCircle value={72} label="Сверка" />
          <DemoProgressCircle value={35} label="Импорт" tone="info" />
        </>
      ),
    },
    {
      id: "segments",
      title: "Сегменты",
      description: "Равные отрезки по 6 px: шаги внутри списка. Ошибочный шаг — красный.",
      when: "известное малое число этапов (3–6): документы, таможня, оплата.",
      demo: (
        <div style={{ display: "grid", gap: 10, width: "min(100%, 220px)" }}>
          <DemoSegments total={4} on={2} label="Таможня" />
          <DemoSegments total={3} on={1} err={1} label="Оплата" />
        </div>
      ),
    },
    {
      id: "file",
      title: "Файл загружается",
      description: "Строка файла: тип, имя, статус и тонкая полоса sm.",
      when: "список загрузок: у каждого файла свой процент.",
      demo: (
        <div style={{ display: "grid", gap: 8, width: "min(100%, 300px)" }}>
          <DemoFile name="Накладная_4821907.pdf" ext="PDF" value={62} />
          <DemoFile name="Инвойс_июнь.xlsx" ext="XLS" value={100} status="ok" />
        </div>
      ),
    },
    {
      id: "button",
      title: "Кнопка-прогресс",
      description:
        "Кнопка, внутри которой растёт заливка; подпись «Сверяем · 34%». [TODO] в макете нет, предложено словарём.",
      when: "одна операция запущена с этой кнопки и важно видеть её ход на месте.",
      demo: <DemoProgressButton value={34} status="running" />,
    },
  ],
  sizes: [
    {
      id: "heights",
      title: "Высота полосы",
      value: "4 · 8 · 12 px",
      note: "sm · md · lg",
      demo: (
        <div style={{ display: "grid", gap: 10, width: "min(100%, 260px)" }}>
          <DemoProgress label="sm" value={50} size="sm" />
          <DemoProgress label="md" value={50} />
          <DemoProgress label="lg" value={50} size="lg" />
        </div>
      ),
    },
  ],
  states: [
    {
      id: "default",
      kind: "default",
      title: "Идёт",
      note: "Значение между 0 и 100, заливка цвета тона.",
      demo: (
        <div style={{ width: "min(100%, 240px)" }}>
          <DemoProgress label="Позиции с ценой" value={73} valueText="58 из 79" />
        </div>
      ),
    },
    {
      id: "loading",
      kind: "loading",
      title: "Неопределённый",
      note: "Размер неизвестен: aria-valuenow нет, отрезок едет.",
      demo: (
        <div style={{ width: "min(100%, 240px)" }}>
          <DemoProgress label="Синхронизация" mode="ind" />
        </div>
      ),
    },
    {
      id: "empty",
      kind: "empty",
      title: "0 %",
      note: "Операция запущена, ничего не сделано: пустой трек. Не скрывайте полосу.",
      demo: (
        <div style={{ width: "min(100%, 240px)" }}>
          <DemoProgress label="Загрузка накладных" value={0} />
        </div>
      ),
    },
    {
      id: "done",
      kind: "selected",
      title: "100 %",
      note: "Полная полоса. Через секунду её заменяют итогом (тост, значок), оставлять 100 % не нужно.",
      demo: (
        <div style={{ width: "min(100%, 240px)" }}>
          <DemoProgress label="Сверка" value={100} />
        </div>
      ),
    },
    {
      id: "error",
      kind: "error",
      title: "Ошибка",
      note: "Тон err: заливка красная, значение остановилось. Рядом — причина и «Повторить».",
      demo: (
        <div style={{ width: "min(100%, 240px)" }}>
          <DemoProgress label="Оплата" value={98} tone="err" valueText="ошибка" />
        </div>
      ),
    },
    {
      id: "button-hover",
      kind: "hover",
      title: "Кнопка · hover",
      note: "Слой 6 % поверх фона кнопки; у кнопки в работе hover отключён (aria-busy).",
      forced: true,
      demo: <DemoProgressButton force="hover" />,
    },
    {
      id: "button-focus",
      kind: "focus",
      title: "Кнопка · focus",
      note: "Кольцо 2 px --focus.",
      forced: true,
      demo: <DemoProgressButton force="focus" />,
    },
    {
      id: "button-active",
      kind: "active",
      title: "Кнопка · active",
      note: "Слой 9 %.",
      forced: true,
      demo: <DemoProgressButton force="active" />,
    },
    NA(
      "hover",
      "hover",
      "Полоса · hover",
      "Полоса не интерактивна. Для нажимаемого вида — кнопка-прогресс.",
    ),
    NA("disabled", "disabled", "Disabled", "Нет. «Не активен» выражает тон idle (серая заливка)."),
  ],
  rules: {
    use: [
      "Подпись и число всегда рядом с полосой: «58 из 79», а не только длина.",
      "Тон по смыслу: info для фона, warn при 80–95 %, err при исчерпании.",
      "Для известной малой серии шагов берите сегменты, для хода работы — линейную полосу.",
      "После 100 % замените полосу результатом: тост «Файлы загружены».",
      "Неопределённую полосу переведите в обычную, как только появится размер работы.",
    ],
    avoid: [
      "Полоса без числа и подписи: цвет и длина не читаются скринридером.",
      "Фальшивый прогресс, который не связан с работой: лучше Spinner.",
      "Прогресс назад: если значение уменьшилось, перезапустите полосу, а не анимируйте откат.",
      "Больше двух полос с полосками на экране: они отвлекают.",
      "Красная полоса без объяснения: рядом пишут, что случилось.",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: "role=progressbar",
      text: 'Трек: role="progressbar", aria-valuemin 0, aria-valuemax 100, aria-valuenow, aria-label из подписи. Для неопределённой aria-valuenow не ставят.',
    },
    {
      kind: "aria",
      title: "aria-valuetext",
      text: "Человеческая фраза: «58 из 79», «выполняется». Скринридер читает её вместо процента.",
    },
    {
      kind: "aria",
      title: "Обновления",
      text: "Не объявляйте каждый процент. Итог («Сверка завершена») отдайте в aria-live=polite области; у кнопки-прогресса обновляйте aria-label не чаще раза в пять секунд [TODO] подтвердить частоту.",
    },
    {
      kind: "key",
      title: "Клавиатура",
      text: "Полоса не фокусируется. Кнопка-прогресс — обычная кнопка: Enter и Space запускают, во время работы нажатие игнорируется (aria-busy, не disabled).",
    },
    {
      kind: "contrast",
      title: "Заливка на треке (3:1 для графики)",
      text: "Светлая тема: teal на треке 1,6:1 и orange 1,9:1 — ниже 3:1; danger 3,7:1; info 4,5:1; idle 4,3:1. Тёмная: все выше 5:1. [TODO] в светлой теме заливку primary и warn нужно затемнить или обвести (число рядом передаёт значение, но порог 1.4.11 не выполнен).",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Рост заливки и полоски отключаются; неопределённый отрезок стоит на месте и не едет (смысл «идёт» передаёт подпись).",
    },
  ],
  tokens: [
    { name: "--primary", value: "#00d4d0", usage: "Заливка по умолчанию", kind: "color" },
    {
      name: "--info / --orange / --danger / --text-3",
      value: "#2563eb / #ff9455 / #d03538 / #66727f",
      usage: "Тоны info · warn · err · idle",
      kind: "color",
    },
    { name: "--tone", value: "ink 7 %", usage: "Трек полосы, круга и сегментов", kind: "color" },
    { name: "height", value: "4 · 8 · 12 px", usage: "sm · md · lg", kind: "size" },
    { name: "--r-pill", value: "999 px", usage: "Радиус трека и заливки", kind: "radius" },
    {
      name: "width transition",
      value: "0,35 с, --ease",
      usage: "Рост заливки, смещение круга",
      kind: "time",
    },
    {
      name: "indeterminate",
      value: "1,3 с, ease-in-out, бесконечно",
      usage: "Отрезок 38 %: translate −100 % → 270 %",
      kind: "time",
    },
    {
      name: "stripe",
      value: "1 с, linear, бесконечно",
      usage: "Полоски 135°, период 40 px",
      kind: "time",
    },
  ],
  choreography: [
    {
      id: "run",
      title: "Ход операции",
      trigger: "приходит новое значение от процесса",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 350,
          what: "Ширина заливки идёт к новому значению, значение справа меняется сразу.",
          prop: "width",
          easing: "--ease",
        },
        {
          at: 0,
          dur: 1000,
          what: "Полоски (если включены) бегут вправо непрерывно, период 40 px за 1 с.",
          prop: "background-position",
          easing: "linear",
        },
        {
          at: 4100,
          dur: 350,
          what: "100 %: полоски останавливаются, значение «100%». [TODO] макет это не оговаривает: предложено через секунду заменить полосу итогом.",
          prop: "—",
        },
      ],
      focus: "Не затрагивается: полоса не фокусируется.",
      reducedMotion: "Заливка встаёт мгновенно, полоски стоят.",
      neighbours:
        "Высота полосы фиксирована, соседний текст не прыгает. Ширина значения табличная, число не дёргает подпись.",
      demo: <RunDemo />,
    },
    {
      id: "indeterminate",
      title: "Неопределённая → определённая",
      trigger: "размер работы неизвестен, затем стал известен",
      origin: "proposal",
      steps: [
        {
          at: 0,
          dur: 1300,
          what: "Отрезок 38 % едет с −100 % до 270 % своей ширины и по кругу.",
          prop: "translate",
          easing: "ease-in-out",
        },
        {
          at: 2800,
          dur: 0,
          what: "Размер известен: бегущий отрезок заменяется обычной заливкой, aria-valuenow появляется.",
          prop: "width",
          easing: "--ease",
        },
        { at: 3600, dur: 350, what: "Заливка растёт до 100 %.", prop: "width", easing: "--ease" },
      ],
      focus: "Не затрагивается.",
      reducedMotion: "Отрезок стоит на месте, значение «неопределённо» остаётся в подписи.",
      neighbours: "Подпись и значение не двигаются.",
      demo: <IndDemo />,
    },
    {
      id: "button",
      title: "Кнопка-прогресс",
      trigger: "нажатие «Сверить документы»",
      origin: "proposal",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Кнопка получает aria-busy, слева — Spinner 10 px, подпись «Сверяем · 3%», hover отключён.",
          prop: "—",
        },
        {
          at: 600,
          dur: 350,
          what: "Заливка внутри кнопки растёт слева направо вместе со значением.",
          prop: "width (::before)",
          easing: "--ease",
        },
        {
          at: 2500,
          dur: 125,
          what: "100 %: кнопка заливается primary, спиннер уходит, слева ✓, подпись «Сверено».",
          prop: "background, color",
          easing: "ease",
        },
      ],
      focus: "Фокус остаётся на кнопке (aria-busy, не disabled). После завершения остаётся там же.",
      reducedMotion: "Заливка и смена цвета мгновенные.",
      neighbours: "Ширина кнопки фиксирована (min-width 168 px), смена подписи не двигает соседей.",
      demo: <ButtonRunDemo />,
    },
  ],
  examples: [
    {
      id: "linear",
      title: "Сверка документов",
      demo: (
        <div style={{ width: "min(100%, 320px)" }}>
          <DemoProgress label="Сверено документов" value={91} size="lg" />
        </div>
      ),
      code: '<Progress label="Сверено документов" value={91} size="lg" />',
    },
    {
      id: "limit",
      title: "Лимит запросов",
      demo: (
        <div style={{ width: "min(100%, 320px)" }}>
          <DemoProgress label="Лимит запросов к 1С" value={86} tone="warn" />
        </div>
      ),
      code: '<Progress label="Лимит запросов к 1С" value={86} tone="warn" />',
    },
  ],
});
