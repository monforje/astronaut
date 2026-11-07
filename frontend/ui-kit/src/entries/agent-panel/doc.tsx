/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Marks } from "@/engine/Callout";
import { Playback, type PlaybackStep } from "@/engine/Playback";
import { defineDoc, type StateSpec } from "@/engine/types";
import {
  AgentPanelLive,
  AgentPanelView,
  DEMO_Q,
  PanelFrame,
  wordCount,
  type Msg,
  type PanelSize,
  type Phase,
} from "./demo";

const NA = (id: string, kind: StateSpec["kind"], title: string, note: string): StateSpec => ({
  id,
  kind,
  title,
  note,
  notApplicable: true,
});

const TOTAL = wordCount(DEMO_Q);
const msg = (phase: Phase, words = TOTAL, extra: Partial<Msg> = {}): Msg => ({
  id: 1,
  q: DEMO_Q,
  phase,
  words,
  ...extra,
});

const NO_MSGS: Msg[] = [];
const P = ({
  msgs = NO_MSGS,
  size = "panel",
  ...rest
}: Partial<React.ComponentProps<typeof AgentPanelView>>) => (
  <PanelFrame size={size} h={380}>
    <AgentPanelView size={size} msgs={msgs} {...rest} />
  </PanelFrame>
);

const STEPS = 6;
const streamSteps: PlaybackStep<S>[] = Array.from({ length: Math.ceil(TOTAL / STEPS) }, (_, i) => ({
  at: 2900 + i * 130,
  set: { phase: "streaming" as Phase, words: Math.min(TOTAL, (i + 1) * STEPS) },
}));
interface S {
  typed: boolean;
  sent: boolean;
  phase: Phase;
  words: number;
  open?: boolean;
  stopAt?: boolean;
}

function SendDemo() {
  return (
    <Playback<S>
      initial={{ typed: false, sent: false, phase: "thinking", words: 0 }}
      script={[
        { at: 300, set: { typed: true } },
        { at: 1400, set: { sent: true } },
        { at: 2900, set: { phase: "streaming" } },
        ...streamSteps,
        { at: 2900 + Math.ceil(TOTAL / STEPS) * 130 + 100, set: { phase: "done", words: TOTAL } },
      ]}
      tail={1400}
      hint="Время сжато: в продукте слова идут по два за 32 мс; здесь по шесть за 130 мс, чтобы было видно курсор."
      render={(s) => (
        <PanelFrame>
          <AgentPanelView
            msgs={s.sent ? [msg(s.phase, s.words)] : []}
            text={s.typed && !s.sent ? DEMO_Q : ""}
            busy={s.sent && s.phase !== "done"}
          />
        </PanelFrame>
      )}
    />
  );
}

function StopDemo() {
  return (
    <Playback<{ phase: Phase; words: number }>
      initial={{ phase: "streaming", words: 4 }}
      script={[
        { at: 400, set: { words: 10 } },
        { at: 700, set: { words: 16 } },
        { at: 1000, set: { words: 22 } },
        { at: 1500, set: { phase: "stopped" } },
      ]}
      tail={1500}
      hint="«Остановить» обрывает вывод: написанное остаётся, курсор пропадает, действий под ответом нет. [TODO] макет не помечает остановленный ответ."
      render={(s) => (
        <PanelFrame h={420}>
          <AgentPanelView
            msgs={[msg(s.phase, s.words)]}
            busy={s.phase === "streaming"}
            sendForce={s.phase === "streaming" && s.words >= 22 ? "hover" : undefined}
          />
        </PanelFrame>
      )}
    />
  );
}

function SizeDemo() {
  return (
    <Playback<{ size: PanelSize }>
      initial={{ size: "panel" }}
      script={[
        { at: 800, set: { size: "wide" } },
        { at: 2400, set: { size: "full" } },
        { at: 4000, set: { size: "panel" } },
      ]}
      tail={900}
      hint="Подсказки: 1 колонка → 2 колонки; в full слева появляется история чатов, переписка в колонке до 760 px по центру."
      render={(s) => (
        <PanelFrame size={s.size} h={400}>
          <AgentPanelView size={s.size} msgs={[]} />
        </PanelFrame>
      )}
    />
  );
}

function ThinkDemo() {
  return (
    <Playback<{ open: boolean }>
      initial={{ open: false }}
      script={[
        { at: 800, set: { open: true } },
        { at: 3000, set: { open: false } },
      ]}
      tail={800}
      render={(s) => (
        <PanelFrame h={420}>
          <AgentPanelView msgs={[msg("done", TOTAL, { open: s.open })]} />
        </PanelFrame>
      )}
    />
  );
}

function ErrorDemo() {
  return (
    <Playback<{ phase: Phase; words: number }>
      initial={{ phase: "thinking", words: 0 }}
      script={[
        { at: 1400, set: { phase: "error" } },
        { at: 3000, set: { phase: "thinking" } },
        { at: 3900, set: { phase: "streaming", words: 14 } },
      ]}
      tail={1200}
      hint="Предложение: ошибка встаёт на место ответа плашкой err с «Повторить»; вопрос не пропадает."
      render={(s) => (
        <PanelFrame h={420}>
          <AgentPanelView
            msgs={[msg(s.phase, s.words)]}
            busy={s.phase === "thinking" || s.phase === "streaming"}
          />
        </PanelFrame>
      )}
    />
  );
}

export default defineDoc({
  id: "agent-panel",
  title: "AgentPanel / Chat",
  group: "overlays",
  cssPrefix: "ds-agent-panel",
  order: 60,
  keywords: [
    "агент",
    "панель агента",
    "чат",
    "чат-бот",
    "чатбот",
    "ассистент",
    "помощник",
    "ии",
    "переписка",
    "стриминг",
    "поле ввода",
    "agent",
    "agent panel",
    "chat",
    "chatbot",
    "chatgpt",
    "gemini",
    "composer",
    "streaming",
    "assistant",
    "copilot",
    "ai",
    "prompt",
  ],
  summary:
    "Панель агента в стиле ChatGPT и Gemini: приветствие и подсказки, переписка, поле ввода с кнопкой «Отправить / Остановить», стриминг ответа. Живёт внутри Sheet.",
  purpose:
    "AgentPanel — основное рабочее место с агентом. Пустая панель приветствует и предлагает четыре вопроса; вопрос запускает ответ, который сначала «думает», потом выводится словами с курсором; под ответом — карточка с действиями и оценка. Агент может ошибаться, а изменения делает только после подтверждения: об этом напоминает строка под полем. Панель открывается язычком (AgentTab) в Sheet трёх режимов.",
  related: ["agent-tab", "sheet", "avatar", "badge", "alert"],
  anatomy: {
    demo: (
      <div style={{ display: "grid", gap: 16, width: "100%" }}>
        <Marks
          block
          items={[
            { n: 1, anchor: ".ds-agent-panel__head", side: "t" },
            { n: 4, anchor: ".ds-agent-panel__user", side: "r" },
            { n: 5, anchor: ".ds-agent-panel__reply", side: "l" },
            { n: 6, anchor: ".ds-agent-panel__text", side: "r" },
            { n: 7, anchor: ".ds-agent-panel__composer", side: "r" },
            { n: 8, anchor: ".ds-agent-panel__note", side: "l" },
          ]}
        >
          <PanelFrame h={520}>
            <AgentPanelView msgs={[msg("streaming", 14)]} busy />
          </PanelFrame>
        </Marks>
        <Marks
          block
          items={[
            { n: 2, anchor: ".ds-agent-panel__empty", side: "l" },
            { n: 3, anchor: ".ds-agent-panel__sugs", side: "r" },
          ]}
        >
          <PanelFrame h={780}>
            <AgentPanelView msgs={[]} />
          </PanelFrame>
        </Marks>
      </div>
    ),
    parts: [
      {
        name: "Шапка",
        description:
          "История чатов (в full — боковая колонка), выбор режима «Агент: Быстрый / Точный», новый чат, развернуть и закрыть (крест у Sheet).",
      },
      {
        name: "Приветствие",
        description:
          "Знак агента 56 px, «Чем помочь, Ирина?», пояснение и подсказки; пока нет переписки.",
      },
      {
        name: "Подсказки",
        description:
          "Четыре карточки с иконкой, вопросом и пояснением; в panel — в одну колонку, в wide/full — в две.",
        optional: true,
      },
      {
        name: "Реплика пользователя",
        description:
          "Справа, пузырь surface-muted радиуса 18, не шире 82 %; при наведении или фокусе слева внизу «Копировать» и «Изменить».",
      },
      {
        name: "Ответ агента",
        description:
          "Слева знак sm и тело: строка «думает» или «Проверил 128 грузов · 3 источника» (раскрывает шаги), текст, карточка действия, ряд «Копировать · Хорошо · Плохо · Заново».",
      },
      {
        name: "Курсор стриминга",
        description:
          "Прямоугольник 7 × 14 px после последнего слова, мигает 1 с (steps(2)); пока ответ пишется.",
      },
      {
        name: "Поле ввода",
        description:
          "Скругление 24, textarea растёт до 160 px, внизу «+», чипы режимов («Сверка», «Поиск по документам») и круглая кнопка «Отправить» ↔ «Остановить».",
      },
      {
        name: "Предупреждение",
        description:
          "Под полем 11 px --text-3: «Агент может ошибаться. Проверяйте важные данные. Изменения — только после вашего подтверждения».",
      },
    ],
  },
  variants: [
    {
      id: "empty",
      title: "Приветствие",
      description:
        "Знак, «Чем помочь, Ирина?», четыре подсказки. Нажатие на подсказку сразу отправляет вопрос.",
      when: "новый чат, переписки ещё нет.",
      demo: (
        <PanelFrame h="auto">
          <AgentPanelView msgs={[]} />
        </PanelFrame>
      ),
    },
    {
      id: "chat",
      title: "Переписка",
      description: "Вопрос и ответ с проверенными шагами, карточкой «Исправить в 1С» и оценкой.",
      when: "агент ответил.",
      demo: (
        <PanelFrame h="auto">
          <AgentPanelView msgs={[msg("done")]} />
        </PanelFrame>
      ),
    },
    {
      id: "streaming",
      title: "Идёт ответ",
      description: "Часть текста выведена, на конце курсор; кнопка превращена в «Остановить».",
      when: "агент пишет ответ.",
      demo: (
        <PanelFrame h={440}>
          <AgentPanelView msgs={[msg("streaming", 14)]} busy />
        </PanelFrame>
      ),
    },
    {
      id: "full",
      title: "Во весь экран",
      description:
        "Слева история чатов 272 px, колонка переписки до 760 px по центру, подсказки в две колонки.",
      when: "режим full у Sheet: длинная работа с агентом.",
      wide: true,
      demo: (
        <PanelFrame size="full" h="auto">
          <AgentPanelView size="full" msgs={[msg("done")]} />
        </PanelFrame>
      ),
    },
    {
      id: "live",
      title: "Живая панель",
      description:
        "Выберите подсказку или напишите свой вопрос: «думает», стриминг, карточка, оценка. «Остановить» прерывает вывод.",
      when: "посмотреть руками.",
      demo: <AgentPanelLive />,
    },
  ],
  states: [
    {
      id: "default",
      kind: "default",
      title: "Default · приветствие",
      note: "Пустая панель: подсказки, поле пусто, «Отправить» отключена.",
      demo: <P />,
    },
    {
      id: "hover",
      kind: "hover",
      title: "Hover",
      note: "Подсказка: слой 4 % и кольцо --text-3; поле ввода — кольцо --text-3.",
      forced: true,
      demo: <P sugForce="hover" composerForce="hover" />,
    },
    {
      id: "active",
      kind: "active",
      title: "Active",
      note: "Нажатая подсказка и кнопка отправки: слой 7 % / 15 %.",
      forced: true,
      demo: <P text={DEMO_Q} sendForce="active" />,
    },
    {
      id: "focus",
      kind: "focus",
      title: "Focus",
      note: "Поле ввода: кольцо --focus 1px и ореол 3 px --selected; кнопки — 2 px.",
      forced: true,
      demo: <P composerForce="focus" text="Какие" />,
    },
    {
      id: "disabled",
      kind: "disabled",
      title: "Disabled «Отправить»",
      note: "Поле пусто — кнопка отключена своими цветами (primary-off). Когда есть текст, она активна.",
      demo: <P />,
    },
    {
      id: "loading",
      kind: "loading",
      title: "Loading · думает",
      note: "Строка «Анализирую грузы…» с бегущим градиентом, кнопка — «Остановить».",
      demo: <P msgs={[msg("thinking", 0)]} busy />,
    },
    {
      id: "streaming",
      kind: "other",
      title: "Стриминг",
      note: "Слова, курсор на конце, «Остановить».",
      demo: <P msgs={[msg("streaming", 14)]} busy />,
    },
    {
      id: "stopped",
      kind: "other",
      title: "Остановлено",
      note: "Написанное остаётся, курсора и действий нет. [TODO] маркер «Ответ остановлен» в макете отсутствует.",
      demo: <P msgs={[msg("stopped", 14)]} />,
    },
    {
      id: "error",
      kind: "error",
      title: "Error",
      note: "Плашка err на месте ответа с «Повторить»; вопрос сохранён. [TODO] в макете ошибки агента нет, предложено словарём.",
      demo: <P msgs={[msg("error", 0)]} />,
    },
    NA(
      "empty",
      "empty",
      "Empty",
      "Это приветствие (Default): пустая переписка показывает подсказки, а не пустое место.",
    ),
  ],
  rules: {
    use: [
      "Приветствие с четырьмя подсказками в новом чате; подсказка отправляется одним нажатием.",
      "Пока агент отвечает, кнопка отправки — «Остановить»; пользователь всегда может прервать.",
      "Изменения данных — только после подтверждения: карточка с кнопкой, не молчаливая правка.",
      "Строка «Агент может ошибаться» под полем всегда на месте.",
      "Источники: «Проверил 128 грузов · 3 источника» раскрывает шаги, чтобы ответу можно было доверять.",
    ],
    avoid: [
      "Блокировать поле ввода на время ответа: пользователь может писать следующее, но отправка ждёт.",
      "Убирать «Остановить» из длинных ответов.",
      "Выводить ответ целиком сразу после долгой паузы: стриминг показывает, что работа идёт.",
      "Автоматически выполнять действия по тексту ответа без карточки подтверждения.",
      "Анимации агента вне brand/animated: знак берётся готовый, а мигание курсора и градиент строки — единственные движения в панели.",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: "Переписка как log",
      text: 'Колонка сообщений — role="log" с aria-label «Переписка»; текст ответа в aria-live="polite". Стриминг по словам объявляется скринридером урывками: [TODO] предложить объявлять ответ целиком по окончании, а во время вывода — «Агент отвечает».',
    },
    {
      kind: "aria",
      title: "Кнопка «Отправить / Остановить»",
      text: "Одна кнопка меняет иконку и aria-label («Отправить» ↔ «Остановить»); отключена, пока поле пусто и нет ответа в процессе. Фокус не теряется при смене.",
    },
    {
      kind: "key",
      title: "Enter, Shift+Enter, Esc",
      text: "Enter отправляет, Shift+Enter — перенос строки. Esc внутри панели закрывает Sheet [TODO] во время стриминга Esc сначала предлагается остановить, потом закрывать.",
    },
    {
      kind: "key",
      title: "Ctrl J",
      text: "Открывает и закрывает панель из любого места, см. AgentTab.",
    },
    {
      kind: "focus",
      title: "Куда идёт фокус",
      text: "При открытии панели — в поле «Спросите агента». После отправки и после ответа фокус остаётся в поле. «Новый чат» возвращает фокус в поле. При закрытии — на язычок.",
    },
    {
      kind: "aria",
      title: "Оценка и копирование",
      text: "«Хороший/Плохой ответ» — кнопки-переключатели (aria-pressed), одна из двух. «Копировать» на 1,2 с меняет значок на ✓ (объявите «Скопировано» в aria-live).",
    },
    {
      kind: "contrast",
      title: "Контраст",
      text: "Текст ответа --text на surface 16,5:1; пояснения --text-3 4,9:1. Бегущая строка «Анализирую грузы…» (градиент text-3 → text → text-3) в крайних точках 4,9:1. Подсказка в поле --text-ph 3,2:1 — ниже 4,5, но не несёт единственный смысл [TODO] общее замечание из Fields.",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Строка «думает» без градиента и без бега; курсор без мигания; раскладка и смена режимов мгновенные. Стриминг по словам остаётся: это содержание, а не украшение (альтернатива: выводить ответ сразу).",
    },
  ],
  tokens: [
    {
      name: "--surface / --surface-muted / --field",
      value: "#fff / #eceef2 / #fff",
      usage: "Фон панели · пузырь пользователя, история · поле ввода",
      kind: "color",
    },
    {
      name: "--selected / --border-selected",
      value: "teal 15 % / 60 %",
      usage: "Чип режима включён, ореол поля при фокусе",
      kind: "color",
    },
    {
      name: "--border / --text-3 / --focus",
      value: "#c6cdd6 / #66727f / #00968f",
      usage: "Кольцо поля: покой · hover · focus",
      kind: "color",
    },
    {
      name: "composer radius",
      value: "24 px",
      usage: "Скругление поля ввода; пузырь 18, карточка --r-card",
      kind: "radius",
    },
    {
      name: "column",
      value: "до 760 px, padding 24 / 20",
      usage: "Колонка переписки; подвал по ней же",
      kind: "size",
    },
    { name: "history", value: "272 px", usage: "Боковая история только в full", kind: "size" },
    {
      name: "textarea",
      value: "от 24 до 160 px",
      usage: "Растёт с текстом, дальше прокручивается",
      kind: "size",
    },
    {
      name: "font",
      value: "14 px / 1,6 (ответ), 12 px (служебное)",
      usage: "Текст ответа и реплик",
      kind: "font",
    },
    { name: "thinking delay", value: "900 мс", usage: "От вопроса до первого слова", kind: "time" },
    {
      name: "streaming",
      value: "2 слова / 32 мс",
      usage: "Скорость стриминга, ≈ 60 слов/с",
      kind: "time",
    },
    {
      name: "shimmer",
      value: "1,4 с, linear, бесконечно",
      usage: "Бегущий градиент «Анализирую грузы…»",
      kind: "time",
    },
    {
      name: "cursor",
      value: "1 с, steps(2), бесконечно",
      usage: "Мигание курсора стриминга",
      kind: "time",
    },
    {
      name: "width (Sheet)",
      value: "300 мс, --ease",
      usage: "Смена panel · wide · full",
      kind: "time",
    },
  ],
  choreography: [
    {
      id: "send",
      title: "Отправка → думает → стриминг → готово",
      trigger: "Enter или кнопка «Отправить», либо подсказка",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Приветствие исчезает, вопрос встаёт справа пузырём; поле очищается и возвращается к 24 px; кнопка превращается в «Остановить» (иконка квадрат), прокрутка вниз.",
          prop: "—",
        },
        {
          at: 0,
          dur: 1400,
          what: "Слева знак агента и строка «Анализирую грузы…» с бегущим градиентом (1,4 с, linear, по кругу).",
          prop: "background-position",
          easing: "linear",
        },
        {
          at: 900,
          dur: 0,
          what: "Через 0,9 с «думает» заменяется строкой «Проверил 128 грузов · 3 источника» (свёрнута), начинается вывод текста.",
          prop: "—",
        },
        {
          at: 900,
          dur: 0,
          what: "Каждые 32 мс добавляется ещё два слова; в конце текста мигает курсор; колонка прокручивается вниз после каждого шага.",
          prop: "scrollTop",
        },
        {
          at: 2600,
          dur: 0,
          what: "Ответ готов: курсор исчезает; под текстом вставляется карточка действия (если есть) и ряд «Копировать · Хорошо · Плохо · Заново». «Остановить» превращается в «Отправить» (отключена, поле пусто).",
          prop: "—",
        },
      ],
      focus:
        "В поле ввода остаётся во всём процессе: отправка не уводит фокус. Новый ответ не забирает его.",
      reducedMotion:
        "Строка «думает» без бега и градиента, курсор без мигания; вывод по словам остаётся или заменяется на мгновенный [TODO].",
      neighbours:
        "Колонка растёт вниз и прокручивается; шапка и поле остаются на месте. Sheet своего размера не меняет.",
      demo: <SendDemo />,
    },
    {
      id: "stop",
      title: "Остановка",
      trigger: "кнопка «Остановить» во время ответа",
      origin: "mockup",
      steps: [
        { at: 0, dur: 0, what: "Таймеры вывода сняты; уже выведенный текст остаётся.", prop: "—" },
        {
          at: 0,
          dur: 0,
          what: "Курсор убирается; ряд действий не добавляется; кнопка снова «Отправить» (disabled при пустом поле).",
          prop: "—",
        },
        {
          at: 0,
          dur: 125,
          what: "Слой hover/active у кнопки в момент нажатия.",
          prop: "background",
          easing: "ease",
        },
      ],
      focus:
        "Фокус остаётся в поле ввода (кнопка не забирает его, если остановка с клавиатуры — Esc [TODO]).",
      reducedMotion: "Без отличий.",
      neighbours: "Переписка и шапка не двигаются.",
      demo: <StopDemo />,
    },
    {
      id: "size",
      title: "Режимы panel · wide · full",
      trigger: "кнопка «развернуть» в шапке Sheet",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 300,
          what: "Ширина Sheet меняется 430 → 760 → 100 %; содержимое панели растягивается вместе с ней.",
          prop: "width",
          easing: "--ease",
        },
        {
          at: 0,
          dur: 0,
          what: "Подсказки: в panel одна колонка, в wide и full две.",
          prop: "grid-template-columns",
        },
        {
          at: 1600,
          dur: 0,
          what: "В full слева встаёт история чатов 272 px; колонка переписки и поле ввода центрируются по ширине до 760 px.",
          prop: "display",
        },
        {
          at: 3200,
          dur: 300,
          what: "Возврат в panel: история скрывается, подсказки снова в одну колонку.",
          prop: "width",
          easing: "--ease",
        },
      ],
      focus: "Остаётся там, где был (обычно в поле ввода).",
      reducedMotion: "Мгновенно.",
      neighbours: "Язычок агента идёт за кромкой панели, в full скрыт (AgentTab).",
      demo: <SizeDemo />,
    },
    {
      id: "think",
      title: "Раскрытие шагов «Проверил 128 грузов»",
      trigger: "нажатие на строку источников",
      origin: "mockup",
      steps: [
        { at: 0, dur: 200, what: "Шеврон поворачивается на 90°.", prop: "rotate", easing: "ease" },
        {
          at: 0,
          dur: 0,
          what: "Под строкой показываются три шага: «Загрузил накладные из ЭДО», «Сопоставил с декларациями из ПО таможни», «Сравнил вес, ТН ВЭД и номера».",
          prop: "hidden",
        },
        {
          at: 2200,
          dur: 200,
          what: "Повторное нажатие: шеврон возвращается, шаги скрыты.",
          prop: "rotate",
          easing: "ease",
        },
      ],
      focus: "На кнопке строки (aria-expanded).",
      reducedMotion: "Шеврон без поворота-перехода.",
      neighbours: "Текст ответа и ряд действий сдвигаются вниз на высоту шагов.",
      demo: <ThinkDemo />,
    },
    {
      id: "error",
      title: "Ошибка и повтор",
      trigger: "агент не ответил",
      origin: "proposal",
      steps: [
        {
          at: 0,
          dur: 1400,
          what: "«Анализирую грузы…» с бегущим градиентом.",
          prop: "background-position",
          easing: "linear",
        },
        {
          at: 1400,
          dur: 0,
          what: "Ответ не пришёл: строка «думает» заменяется плашкой err «Не удалось получить ответ» с кнопкой «Повторить»; вопрос на месте.",
          prop: "—",
        },
        {
          at: 3000,
          dur: 0,
          what: "«Повторить»: плашка уходит, снова «думает», затем стриминг.",
          prop: "—",
        },
      ],
      focus: "Остаётся в поле; кнопка «Повторить» — в порядке Tab после ответа.",
      reducedMotion: "Без бега градиента.",
      neighbours: "Колонка немного меняет высоту; прокрутка остаётся внизу.",
      demo: <ErrorDemo />,
    },
  ],
  examples: [
    {
      id: "greeting",
      title: "Новый чат",
      demo: <AgentPanelLive />,
      code: `const [messages, setMessages] = useState<AgentMessage[]>([]);
const [value, setValue] = useState("");

const ask = (question: string) => {
  const id = messages.length + 1;
  setMessages((list) => [...list, { id, question, phase: "thinking" }]);
  setValue("");
  streamAnswer(id, question);
};

<AgentPanel
  messages={messages}
  value={value}
  onValueChange={setValue}
  greeting="Чем помочь, Ирина?"
  suggestions={SUGGESTIONS}
  onAsk={ask}
  onSend={() => ask(value)}
  onStop={stop}
/>`,
    },
    {
      id: "chat",
      title: "Ответ агента",
      demo: <AgentPanelLive initial={[msg("done")]} />,
      code: `const [messages, setMessages] = useState<AgentMessage[]>([
  {
    id: 1,
    question,
    phase: "done",
    answer,
    summary: "Проверил 128 грузов · 3 источника",
    attachment: <CargoCard />,
  },
]);

<AgentPanel messages={messages} value={value} onValueChange={setValue} onSend={() => ask(value)} />`,
    },
  ],
});
