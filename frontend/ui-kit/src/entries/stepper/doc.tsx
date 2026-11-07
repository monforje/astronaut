/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Marks } from "@/engine/Callout";
import { Playback } from "@/engine/Playback";
import { defineDoc } from "@/engine/types";
import { CARGO_STEPS, DemoStepper, DemoWizard, FLOW_STEPS, STEPS4, type StepForce } from "./demo";

const W = { width: "100%", maxWidth: 520 } as const;

function AdvanceDemo() {
  return (
    <Playback<{ c: number; e?: number }>
      initial={{ c: 0 }}
      script={[
        { at: 600, set: { c: 1 } },
        { at: 1500, set: { c: 2 } },
        { at: 2400, set: { e: 2 } },
        { at: 3200, set: { e: undefined, c: 3 } },
      ]}
      tail={900}
      hint="Шаг 3 «Сверка» сначала сбоит (err), затем процесс идёт дальше."
      render={(s) => (
        <div style={W}>
          <DemoStepper variant="below" steps={STEPS4} current={s.c} err={s.e} />
        </div>
      )}
    />
  );
}

function ClickDemo() {
  return (
    <Playback<{ c: number; f?: Record<number, StepForce> }>
      initial={{ c: 2 }}
      script={[
        { at: 500, set: { f: { 0: "hover" } } },
        { at: 1100, set: { f: { 0: "active" } } },
        { at: 1250, set: { c: 0, f: { 0: "focus" } } },
        { at: 2400, set: { f: undefined } },
      ]}
      tail={800}
      hint="Клик по пройденному шагу возвращает на него; будущие шаги заблокированы."
      render={(s) => (
        <div style={W}>
          <DemoStepper
            variant="below"
            steps={STEPS4}
            current={s.c}
            clickable
            lockAhead
            force={s.f}
          />
        </div>
      )}
    />
  );
}

function VerticalDemo() {
  return (
    <Playback<{ c: number }>
      initial={{ c: 0 }}
      script={[
        { at: 600, set: { c: 1 } },
        { at: 1500, set: { c: 2 } },
        { at: 2400, set: { c: 3 } },
      ]}
      tail={900}
      render={(s) => (
        <div style={{ width: "100%", maxWidth: 360 }}>
          <DemoStepper variant="vertical" steps={FLOW_STEPS} current={s.c} />
        </div>
      )}
    />
  );
}

export default defineDoc({
  id: "stepper",
  title: "Stepper",
  group: "navigation",
  cssPrefix: "ds-stp",
  order: 60,
  wideDemos: { variants: true },
  keywords: [
    "шаги",
    "мастер",
    "мастер настройки",
    "пошаговый",
    "wizard",
    "stepper",
    "steps",
    "step",
    "progress",
    "прогресс",
    "этапы",
    "статус процесса",
    "timeline",
    "таймлайн",
    "процесс",
  ],
  summary:
    "Шаги процесса: в строку, с подписями снизу, вертикальный и рабочий мастер. Шаг пройден, текущий, с ошибкой, впереди или недоступен.",
  purpose:
    "Stepper показывает, где объект в последовательном процессе и сколько осталось: статус расхождения («Новый → В работе → Сверка → Решено»), ход груза («Заявка → Таможня → Выдача»), мастер подключения программы. Порядок важен. Если шаги можно проходить в любом порядке или это просто представления одного объекта, нужны вкладки.",
  related: ["tabs", "badge", "accordion"],
  anatomy: {
    demo: (
      <Marks
        block
        items={[
          { n: 1, anchor: ".ds-stp", side: "l" },
          { n: 2, anchor: ".ds-stp__li:nth-child(2) .ds-stp__n", side: "l" },
          { n: 3, anchor: ".ds-stp__li:nth-child(3) .ds-stp__t", side: "r" },
          { n: 4, anchor: ".ds-stp__li:nth-child(1) .ds-stp__ln", side: "l" },
          { n: 5, anchor: ".ds-stp__detail", side: "r" },
        ]}
      >
        <DemoStepper variant="vertical" steps={FLOW_STEPS} current={2} />
      </Marks>
    ),
    parts: [
      {
        name: "Список шагов (ol)",
        description:
          "Упорядоченный список с aria-label. Раскладка зависит от вида: строка, колонки с подписями, вертикальная колонка.",
      },
      {
        name: "Кружок",
        description:
          "24 px: номер (11 px, 700), галочка у пройденного, «!» у ошибки. Заливка primary — пройден; кольцо 2 px primary с ореолом 4 px — текущий; заливка danger — ошибка; кольцо --border — впереди.",
      },
      {
        name: "Подпись",
        description:
          "Название шага 12 px, 600: у пройденного и текущего --text, у остальных --text-3. Под ним необязательная дата или пояснение (11 px, 400).",
      },
      {
        name: "Линия-соединитель",
        description:
          "2 px, радиус 2: --divider, у пройденных primary. Между кружками; в вертикальном — под кружком.",
      },
      {
        name: "Содержимое шага",
        description:
          "Только вертикальный вид: у текущего и ошибочного шага под подписью плашка на --surface-muted (кому и что нужно сделать).",
        optional: true,
      },
    ],
  },
  variants: [
    {
      id: "inline",
      title: "Компактный (в строку)",
      description: "Кружок, подпись и линия по горизонтали, всё в одну строку.",
      when: "заголовки и панели: статус расхождения рядом с названием. Не больше 4–5 шагов.",
      demo: (
        <div style={W}>
          <DemoStepper variant="inline" steps={STEPS4} current={2} />
        </div>
      ),
    },
    {
      id: "below",
      title: "Горизонтальный (подписи снизу)",
      description:
        "Колонки равной ширины, подпись и дата под кружком, линия между центрами кружков.",
      when: "ход груза, длинные процессы, мастер: подписи не вытесняют друг друга.",
      demo: (
        <div style={W}>
          <DemoStepper variant="below" steps={CARGO_STEPS} current={2} />
        </div>
      ),
    },
    {
      id: "vertical",
      title: "Вертикальный",
      description:
        "Кружки столбцом, линия уходит вниз. У текущего шага есть содержимое: кому и что делать.",
      when: "ход одного объекта с комментариями и временем; боковые панели.",
      demo: (
        <div style={{ width: "100%", maxWidth: 360 }}>
          <DemoStepper variant="vertical" steps={FLOW_STEPS} current={2} />
        </div>
      ),
    },
    {
      id: "wizard",
      title: "Рабочий мастер",
      description:
        "Горизонтальный stepper + область шага + «Назад / Далее». Клик по пройденному шагу возвращает; «Далее» заблокирован, пока шаг не готов (на «Проверке» — пока идёт прогресс).",
      when: "подключение программ, импорт, всё, что нельзя сделать в один экран. Попробуйте: он живой.",
      demo: (
        <div style={{ width: "100%", maxWidth: 460 }}>
          <DemoWizard />
        </div>
      ),
    },
  ],
  states: [
    {
      id: "default",
      kind: "default",
      title: "Todo (впереди)",
      note: "Кружок с кольцом 1,5 px --border, номер и подпись --text-3.",
      demo: <DemoStepper variant="below" steps={STEPS4.slice(0, 2)} current={-1} />,
    },
    {
      id: "current",
      kind: "selected",
      title: "Current",
      note: 'Кольцо 2 px primary + ореол 4 px 20 %, номер --link-strong, подпись --text. aria-current="step".',
      demo: <DemoStepper variant="below" steps={STEPS4.slice(0, 2)} current={0} />,
    },
    {
      id: "done",
      kind: "other",
      title: "Done",
      note: "Заливка primary, галочка navy, линия за ним primary.",
      demo: <DemoStepper variant="below" steps={STEPS4.slice(0, 2)} current={2} />,
    },
    {
      id: "error",
      kind: "error",
      title: "Error",
      note: "Заливка danger, «!» на --on-danger, ореол 4 px 18 %. Подпись --text. Текст ошибки — в содержимом шага или рядом.",
      demo: <DemoStepper variant="below" steps={STEPS4.slice(0, 3)} current={1} err={1} />,
    },
    {
      id: "hover",
      kind: "hover",
      title: "Hover (кликабельный)",
      note: "Кольцо --border темнеет до --text-3; у пройденного заливка primary темнеет на 9 %. Только у кнопок-шагов.",
      forced: true,
      demo: (
        <DemoStepper
          variant="below"
          steps={STEPS4.slice(0, 3)}
          current={2}
          clickable
          force={{ 0: "hover" }}
        />
      ),
    },
    {
      id: "active",
      kind: "active",
      title: "Active",
      note: "Кружок сжимается до 94 %. [TODO] предложение: в макете у нажатия отдельного вида нет.",
      forced: true,
      demo: (
        <DemoStepper
          variant="below"
          steps={STEPS4.slice(0, 3)}
          current={2}
          clickable
          force={{ 0: "active" }}
        />
      ),
    },
    {
      id: "focus",
      kind: "focus",
      title: "Focus",
      note: "Кольцо 2 px --focus вокруг шага, отступ 3 px, радиус 8.",
      forced: true,
      demo: (
        <DemoStepper
          variant="below"
          steps={STEPS4.slice(0, 3)}
          current={2}
          clickable
          force={{ 0: "focus" }}
        />
      ),
    },
    {
      id: "disabled",
      kind: "disabled",
      title: "Disabled",
      note: "Будущие шаги мастера: кнопки disabled, подпись --text-ph. В макете они кликабельны, но клик игнорируется: [TODO] исправлено в словаре.",
      demo: (
        <DemoStepper variant="below" steps={STEPS4.slice(0, 3)} current={0} clickable lockAhead />
      ),
    },
    {
      id: "clickable",
      kind: "other",
      title: "Clickable",
      note: "Пройденные шаги — кнопки (возврат). Текущий и будущие — нет. Курсор pointer только у пройденных.",
      demo: (
        <DemoStepper variant="below" steps={STEPS4.slice(0, 3)} current={2} clickable lockAhead />
      ),
    },
    {
      id: "loading",
      kind: "loading",
      title: "Loading",
      note: "Шаг в работе (идёт проверка): остаётся current; прогресс показывает содержимое шага (полоса в мастере), кружок не вращается. [TODO] предложение.",
      wide: true,
      demo: <DemoWizard start={2} />,
    },
    {
      id: "empty",
      kind: "empty",
      title: "Empty",
      note: "Шагов нет — stepper не рисуют. Один шаг — тоже не процесс.",
      notApplicable: true,
    },
  ],
  rules: {
    use: [
      "Шаги идут строго по порядку: 3–6 штук, названия — короткие существительные («Сверка»).",
      "Один текущий шаг; при ошибке именно этот шаг красный, а остальные не меняются.",
      "В мастере возвращаться можно, перепрыгивать вперёд — нет.",
      "Вертикальный вид — когда у шагов есть время и комментарии; детали только у текущего.",
      "«Далее» блокируется, пока шаг не готов, а подпись объясняет почему.",
    ],
    avoid: [
      "Stepper как навигация между равноправными разделами: это Tabs.",
      "Больше 7 шагов в строку: подписи не поместятся; берите вертикальный.",
      "Цвет без галочки и «!»: статус должен читаться без цвета.",
      "Пропуск шагов без пояснения: если шаг не нужен, его убирают из списка.",
      "Прогресс в процентах вместо шагов: для этого Progress.",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: 'ol + aria-current="step"',
      text: 'Упорядоченный список с aria-label; текущий и ошибочный шаг получают aria-current="step". К подписи каждого шага добавлено скрытое слово статуса («Сверка, текущий», «…, пройден»), потому что галочка и цвет скринридеру не видны.',
    },
    {
      kind: "aria",
      title: "Кнопки-шаги",
      text: "Кликабельные шаги — button; будущие — disabled (не aria-disabled на ссылке). Кружок aria-hidden.",
    },
    {
      kind: "aria",
      title: "aria-live у области мастера",
      text: 'Область шага — aria-live="polite": смена шага и прогресс объявляются без перехвата фокуса. [TODO] в макете live-области нет.',
    },
    {
      kind: "key",
      title: "Tab, Enter, Space",
      text: "Идут по кликабельным шагам и кнопкам мастера. Стрелок нет: это не tablist.",
    },
    {
      kind: "focus",
      title: "Куда идёт фокус",
      text: "«Далее»/«Назад» остаются на месте при смене шага. Если «Назад» стал disabled на первом шаге, фокус переходит на «Далее» (иначе теряется). Клик по пройденному шагу оставляет фокус на нём.",
    },
    {
      kind: "contrast",
      title: "Контраст",
      text: "Номер текущего --link-strong на --surface 7,2:1; галочка navy на teal 7,4:1; «!» белый на danger 4,9:1; подпись --text-3 4,9:1. Кольцо кружка --border 1,7:1 дополнено номером и подписью.",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Смена статуса кружка и заполнение линии — без перехода.",
    },
  ],
  tokens: [
    {
      name: "--primary",
      value: "teal #00d4d0",
      usage: "Пройденный кружок, кольцо текущего, заполненная линия",
      kind: "color",
    },
    {
      name: "--on-primary",
      value: "navy / #082f53",
      usage: "Галочка на пройденном",
      kind: "color",
    },
    { name: "--link-strong", value: "#006662 / teal", usage: "Номер текущего шага", kind: "color" },
    {
      name: "--danger / --on-danger",
      value: "#d03538 / #fff",
      usage: "Ошибка: заливка и «!»",
      kind: "color",
    },
    {
      name: "--border / --divider",
      value: "#c6cdd6 / #e0e4e9",
      usage: "Кольцо кружка впереди · линия",
      kind: "color",
    },
    {
      name: "--text / --text-3",
      value: "#15202b / #66727f",
      usage: "Подпись достигнутого · будущего",
      kind: "color",
    },
    { name: "кружок", value: "24 px, шрифт 11 / 700", usage: "Размер и цифра", kind: "size" },
    { name: "линия", value: "2 px, радиус 2", usage: "Соединитель", kind: "size" },
    {
      name: "ореол",
      value: "4 px: primary 20 % · danger 18 %",
      usage: "Текущий · ошибка",
      kind: "shadow",
    },
    {
      name: "--dur",
      value: "200 мс",
      usage: "Кружок (background, box-shadow, color) и линия (background)",
      kind: "time",
    },
    { name: "--r-item", value: "8 px", usage: "Кольцо фокуса, плашка содержимого", kind: "radius" },
  ],
  choreography: [
    {
      id: "advance",
      title: "Переход к следующему шагу",
      trigger: "процесс дошёл до следующего шага (или «Далее» в мастере)",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 200,
          what: "Текущий кружок заполняется primary: фон, цвет и кольцо меняются, на нём появляется галочка вместо номера.",
          prop: "background, box-shadow, color",
          easing: "ease",
        },
        {
          at: 0,
          dur: 200,
          what: "Линия после него заполняется primary.",
          prop: "background",
          easing: "ease",
        },
        {
          at: 0,
          dur: 200,
          what: "Следующий кружок получает кольцо и ореол текущего; подпись уходит от --text-3 к --text.",
          prop: "box-shadow, color",
          easing: "ease",
        },
        {
          at: 0,
          dur: 0,
          what: "Номер сменяется галочкой мгновенно, без перекрёстного перехода.",
          prop: "content",
        },
      ],
      focus: "Остаётся на кнопке «Далее» (мастер) или не затрагивается (индикатор статуса).",
      reducedMotion: "Кружки и линия меняют цвет мгновенно.",
      neighbours:
        "Подписи не сдвигаются: ширина колонок равна, раскладка стабильна. [TODO] в макете DOM перерисовывается целиком, поэтому переход в нём не виден; в ui-kit элементы должны сохраняться.",
      demo: <AdvanceDemo />,
    },
    {
      id: "back",
      title: "Возврат к пройденному шагу",
      trigger: "клик по пройденному шагу мастера",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Наведение: кольцо кружка темнеет (у пройденного — заливка primary −9 %).",
          prop: "box-shadow, background",
        },
        { at: 600, dur: 0, what: "Нажатие: кружок сжимается до 94 %.", prop: "scale" },
        {
          at: 750,
          dur: 200,
          what: "Выбранный шаг снова становится current, шаги после него — todo, их линии теряют заливку.",
          prop: "background, box-shadow",
          easing: "ease",
        },
        {
          at: 750,
          dur: 0,
          what: "Область шага заменяется содержимым выбранного (без перехода); остановленный прогресс сбрасывается.",
          prop: "content",
        },
      ],
      focus: "Остаётся на нажатом шаге; клавиатурный возврат — Enter/Space на шаге.",
      reducedMotion: "Мгновенная смена цвета, без сжатия.",
      neighbours:
        "Размеры не меняются; кнопка «Назад» отключается на первом шаге, фокус при этом уходит на «Далее».",
      demo: <ClickDemo />,
    },
    {
      id: "vertical",
      title: "Вертикальный ход",
      trigger: "статус процесса продвинулся",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 200,
          what: "Кружок и участок линии под ним заливаются primary.",
          prop: "background",
          easing: "ease",
        },
        {
          at: 0,
          dur: 0,
          what: "Содержимое (плашка) уходит у завершённого шага и появляется у нового текущего: высота меняется скачком. [TODO] предложение: анимировать как Accordion (grid 0fr→1fr, 250 мс).",
          prop: "height",
        },
        {
          at: 0,
          dur: 0,
          what: "Подпись следующего шага из --text-3 становится --text.",
          prop: "color",
        },
      ],
      focus: "Не затрагивается: вертикальный stepper чаще бывает индикатором.",
      reducedMotion: "Цвета меняются мгновенно.",
      neighbours: "Ниже идущие шаги сдвигаются вместе с плашкой содержимого.",
      demo: <VerticalDemo />,
    },
    {
      id: "wizard",
      title: "Шаг мастера целиком",
      trigger: "«Далее» в мастере",
      origin: "proposal",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Проверка готовности шага: пока «Далее» disabled, шаг не завершён (на «Проверке» — пока полоса не дойдёт до 100 %).",
          prop: "disabled",
        },
        {
          at: 0,
          dur: 200,
          what: "Stepper продвигается (см. «Переход к следующему шагу»).",
          prop: "background, box-shadow",
          easing: "ease",
        },
        {
          at: 100,
          dur: 0,
          what: "Область шага заменяется новым содержимым; aria-live озвучивает заголовок.",
          prop: "content",
        },
        {
          at: 100,
          dur: 125,
          what: "[TODO] предложение: затухание содержимого 125 мс вместо мгновенной замены.",
          prop: "opacity",
          easing: "ease",
        },
      ],
      focus:
        "Остаётся на «Далее»; на первом шаге «Назад» блокируется, фокус уходит на «Далее»; закрытие мастера возвращает фокус на кнопку, открывшую его.",
      reducedMotion: "Всё без переходов; содержимое заменяется мгновенно.",
      neighbours:
        "Размер области шага зафиксирован (min-height 118 px), чтобы кнопки внизу не прыгали при смене содержимого.",
      demo: (
        <div style={{ width: "100%", maxWidth: 460 }}>
          <DemoWizard />
        </div>
      ),
    },
  ],
  examples: [
    {
      id: "status",
      title: "Статус расхождения в панели",
      demo: (
        <div style={W}>
          <DemoStepper variant="inline" steps={STEPS4} current={2} />
        </div>
      ),
      code: `<Stepper variant="inline" current={2} steps={[{ title: "Новый" }, { title: "В работе" }, { title: "Сверка" }, { title: "Решено" }]} />`,
    },
    {
      id: "cargo",
      title: "Ход груза",
      demo: (
        <div style={W}>
          <DemoStepper variant="below" steps={CARGO_STEPS} current={2} />
        </div>
      ),
      code: `<Stepper variant="below" current={2} steps={[{ title: "Заявка", hint: "09 ноя" }, …]} />`,
    },
    {
      id: "wizard",
      title: "Мастер подключения",
      demo: (
        <div style={{ width: "100%", maxWidth: 460 }}>
          <DemoWizard />
        </div>
      ),
      code: `<Stepper variant="below" current={step} clickable lockAhead onStepClick={setStep} aria-label="Шаги подключения"
  steps={[{ title: "Программа" }, { title: "Доступ" }, { title: "Проверка" }, { title: "Готово" }]} />`,
    },
  ],
});
