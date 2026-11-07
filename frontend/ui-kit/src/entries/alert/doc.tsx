/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useState } from "react";
import { Marks } from "@/engine/Callout";
import { Playback } from "@/engine/Playback";
import { defineDoc, type StateSpec } from "@/engine/types";
import { DemoAlert, type AlertTone } from "./demo";

const NA = (id: string, kind: StateSpec["kind"], title: string, note: string): StateSpec => ({
  id,
  kind,
  title,
  note,
  notApplicable: true,
});

const W = { width: "min(100%, 460px)" } as const;

const TONES: { tone: AlertTone; title: string; hint?: string }[] = [
  { tone: "ok", title: "Документы сверены.", hint: "Расхождений нет." },
  { tone: "info", title: "Новая версия справочника.", hint: "Обновлён список портов." },
  { tone: "warn", title: "Нет накладной.", hint: "Сверка по весу недоступна." },
  { tone: "err", title: "ПО таможни не отвечает." },
  { tone: "neutral", title: "Черновик сохранён в 10:42." },
];

function ToneStack({ stacked }: { stacked?: boolean }) {
  return (
    <div style={{ display: "grid", gap: 8, ...W }}>
      {TONES.slice(0, stacked ? 4 : 5).map((t) => (
        <DemoAlert
          key={t.tone}
          tone={t.tone}
          layout={stacked ? "stacked" : "inline"}
          title={t.title}
          hint={stacked ? (t.hint ?? "Данные не потеряны: груз остался в черновике.") : t.hint}
          actions={stacked ? [{ text: "Подробнее" }] : undefined}
        />
      ))}
    </div>
  );
}

function DismissList() {
  const [closed, setClosed] = useState<Record<string, boolean>>({});
  const items: { id: string; tone: AlertTone; title: string; hint?: string }[] = [
    { id: "a", tone: "warn", title: "Нет накладной.", hint: "Сверка по весу недоступна." },
    { id: "b", tone: "info", title: "Новая версия справочника." },
    { id: "c", tone: "ok", title: "Документы сверены." },
  ];
  return (
    <div style={{ display: "grid", gap: 0, ...W }}>
      {items.map((i) => (
        <div key={i.id} style={{ paddingBottom: closed[i.id] ? 0 : 8, transition: "padding .3s" }}>
          <DemoAlert
            tone={i.tone}
            title={i.title}
            hint={i.hint}
            closed={closed[i.id]}
            onClose={() => setClosed((c) => ({ ...c, [i.id]: true }))}
          />
        </div>
      ))}
      <div>
        <button
          type="button"
          className="ds-btn ds-btn--outline ds-btn--sm"
          onClick={() => setClosed({})}
        >
          Вернуть закрытые
        </button>
      </div>
    </div>
  );
}

function CloseDemo() {
  return (
    <Playback<{ closed: boolean; f?: "hover" | "active" }>
      initial={{ closed: false }}
      script={[
        { at: 400, set: { f: "hover" } },
        { at: 1000, set: { f: "active" } },
        { at: 1250, set: { closed: true, f: undefined } },
        { at: 2600, set: { closed: false } },
      ]}
      tail={800}
      hint="Нижняя плашка подтягивается вверх по мере схлопывания верхней: это один переход, а не два."
      render={(s) => (
        <div style={W}>
          <DemoAlert
            tone="warn"
            title="Нет накладной."
            hint="Сверка по весу недоступна."
            closed={s.closed}
            closeForce={s.f}
          />
          <div style={{ height: s.closed ? 0 : 8, transition: "height .3s var(--ease)" }} />
          <DemoAlert
            tone="ok"
            title="Документы сверены."
            hint="Расхождений нет."
            onClose={() => undefined}
          />
        </div>
      )}
    />
  );
}

function RetryDemo() {
  return (
    <Playback<{ phase: "err" | "retry" | "ok" }>
      initial={{ phase: "err" }}
      script={[
        { at: 500, set: { phase: "retry" } },
        { at: 2000, set: { phase: "ok" } },
      ]}
      tail={900}
      hint="Предложение: плашка меняет тон на месте, а не исчезает и появляется новая."
      render={(s) => (
        <div style={W}>
          {s.phase === "ok" ? (
            <DemoAlert tone="ok" title="Соединение восстановлено." hint="Выгрузка продолжится." />
          ) : (
            <DemoAlert
              tone="err"
              title="ПО таможни не отвечает."
              actions={[
                {
                  text: s.phase === "retry" ? "Повторяем" : "Повторить",
                  loading: s.phase === "retry",
                },
              ]}
            />
          )}
        </div>
      )}
    />
  );
}

export default defineDoc({
  id: "alert",
  title: "Alert",
  group: "feedback",
  cssPrefix: "ds-alert",
  order: 10,
  keywords: [
    "плашка",
    "уведомление",
    "сообщение",
    "баннер",
    "ошибка",
    "предупреждение",
    "алерт",
    "оповещение",
    "alert",
    "banner",
    "notification",
    "message",
    "warning",
    "error",
    "notice",
    "callout",
  ],
  summary:
    "Плашка с сообщением прямо в потоке страницы: тон, иконка, текст, действия и крестик. Два вида: inline в строку и stacked с заголовком и пояснением.",
  purpose:
    "Alert сообщает о том, что относится к этому месту экрана и не уходит само: ошибка отправки над формой, предупреждение над таблицей, статус подключения. Он не перекрывает интерфейс (для этого Dialog) и не исчезает по таймеру (для этого Toast). Тон — смысл: ok, info, warn, err; текст всегда объясняет, что случилось и что делать.",
  related: ["toast", "dialog", "badge", "button"],
  anatomy: {
    demo: (
      <div className="ds-alert__anat" style={{ width: "min(100%, 460px)" }}>
        <Marks
          block
          items={[
            { n: 1, anchor: ".ds-alert__panel", side: "t" },
            { n: 2, anchor: ".ds-alert__icon", side: "l" },
            { n: 3, anchor: ".ds-alert__body b", side: "t" },
            { n: 4, anchor: ".ds-alert__hint", side: "l" },
            { n: 5, anchor: ".ds-alert__actions", side: "b" },
            { n: 6, anchor: ".ds-alert__close", side: "r" },
          ]}
        >
          <DemoAlert
            tone="warn"
            layout="stacked"
            title="Расхождение по весу: 180 кг"
            hint="Вес в декларации меньше веса по накладной. Проверьте перед отправкой."
            actions={[{ text: "Исправить в 1С", variant: "primary" }, { text: "Позже" }]}
            onClose={() => undefined}
          />
        </Marks>
      </div>
    ),
    parts: [
      {
        name: "Плашка",
        description:
          "Фон тона 12–16 % поверх поверхности, кольцо 1px тона 50–55 %, радиус --r-item (8), отступы 8 × 10.",
      },
      {
        name: "Иконка",
        description:
          "14 px, у ok/warn/err/info — цветом тона, у остальных цвет текста. Не заменяет подпись.",
      },
      { name: "Заголовок", description: "Жирный (700), 12 px: одна фраза о случившемся." },
      {
        name: "Пояснение",
        description:
          "11 px, --text-2: что произошло подробнее и что делать. В inline идёт в строку после заголовка.",
      },
      {
        name: "Действия",
        description:
          "Кнопки ghost или primary размера sm: максимум две. В inline справа, в stacked под текстом.",
        optional: true,
      },
      {
        name: "Крестик",
        description:
          "18 px, прозрачность 75 %; закрывает плашку схлопыванием. Не у плашек, которые должны остаться (ошибка валидации).",
        optional: true,
      },
    ],
  },
  variants: [
    {
      id: "inline",
      title: "Inline",
      description: "Одна строка: иконка, фраза, действия справа, крестик. Выравнивание по центру.",
      when: "короткое сообщение над таблицей или формой: статус, подсказка, итог.",
      demo: <ToneStack />,
    },
    {
      id: "stacked",
      title: "Stacked",
      description: "Заголовок, пояснение, действия под текстом. Иконка выровнена по первой строке.",
      when: "сообщение, которому нужно объяснение или два действия: ошибка отправки, расхождение.",
      demo: (
        <div style={{ display: "grid", gap: 8, ...W }}>
          <DemoAlert
            tone="err"
            layout="stacked"
            title="Не удалось отправить декларацию"
            hint="Таможенное ПО вернуло ошибку 502. Данные не потеряны: груз остался в черновике."
            actions={[{ text: "Повторить", variant: "destructive" }, { text: "Подробнее" }]}
            onClose={() => undefined}
          />
        </div>
      ),
    },
    {
      id: "tones",
      title: "Тоны",
      description:
        "ok · info · warn · err для смысла; neutral для служебного («Черновик сохранён»); plain — белая с рамкой для подсказок; accent — фирменная teal-подложка.",
      when: "ok — завершено; info — просто сообщаем; warn — нужно внимание; err — не получилось.",
      demo: <ToneStack stacked />,
    },
    {
      id: "dismissible",
      title: "Закрываемая",
      description:
        "С крестиком: нажатие схлопывает плашку по высоте за 0,3 с, соседи подтягиваются.",
      when: "сообщение можно отложить: подсказка, новая версия справочника.",
      demo: <DismissList />,
    },
  ],
  states: [
    {
      id: "default",
      kind: "default",
      title: "Default",
      note: "Плашка на месте, действия доступны.",
      demo: (
        <div style={W}>
          <DemoAlert
            tone="info"
            title="Новая версия справочника."
            hint="Обновлён список портов."
            actions={[{ text: "Посмотреть" }]}
            onClose={() => undefined}
          />
        </div>
      ),
    },
    {
      id: "hover",
      kind: "hover",
      title: "Hover (крестик и кнопка)",
      note: "Слой 6 % под крестиком, непрозрачность 100 %; у ghost-кнопки слой n.",
      forced: true,
      demo: (
        <div style={W}>
          <DemoAlert
            tone="info"
            title="Новая версия."
            actions={[{ text: "Посмотреть", force: "hover" }]}
            closeForce="hover"
          />
        </div>
      ),
    },
    {
      id: "active",
      kind: "active",
      title: "Active",
      note: "Слой 9 % под нажатым крестиком и кнопкой.",
      forced: true,
      demo: (
        <div style={W}>
          <DemoAlert
            tone="info"
            title="Новая версия."
            actions={[{ text: "Посмотреть", force: "active" }]}
            closeForce="active"
          />
        </div>
      ),
    },
    {
      id: "focus",
      kind: "focus",
      title: "Focus",
      note: "Кольцо 2 px --focus вокруг крестика (смещение 1 px) и кнопки.",
      forced: true,
      demo: (
        <div style={W}>
          <DemoAlert
            tone="info"
            title="Новая версия."
            actions={[{ text: "Посмотреть", force: "focus" }]}
            closeForce="focus"
          />
        </div>
      ),
    },
    {
      id: "disabled",
      kind: "disabled",
      title: "Disabled (действие)",
      note: "Сама плашка не отключается. Недоступное действие в ней — disabled-кнопка с причиной в пояснении.",
      demo: (
        <div style={W}>
          <DemoAlert
            tone="warn"
            title="Нет накладной."
            hint="Загрузка недоступна без прав."
            actions={[{ text: "Загрузить", disabled: true }]}
          />
        </div>
      ),
    },
    {
      id: "loading",
      kind: "loading",
      title: "Loading (действие)",
      note: "Нажатое действие становится aria-busy со Spinner; плашка и фокус остаются.",
      demo: (
        <div style={W}>
          <DemoAlert
            tone="err"
            title="ПО таможни не отвечает."
            actions={[{ text: "Повторяем", loading: true }]}
          />
        </div>
      ),
    },
    {
      id: "error",
      kind: "error",
      title: "Error · тон err",
      note: "Красный: ошибка — это значение тона, а не отдельное состояние компонента.",
      demo: (
        <div style={W}>
          <DemoAlert tone="err" title="ПО таможни не отвечает." actions={[{ text: "Повторить" }]} />
        </div>
      ),
    },
    NA("empty", "empty", "Empty", "Нет. Пустая плашка не показывается: нет сообщения — нет Alert."),
  ],
  rules: {
    use: [
      "Пишите, что случилось и что делать: «Не удалось отправить. Данные не потеряны».",
      "Тон по смыслу, один смысл — один тон во всём продукте.",
      "Ставьте плашку рядом с тем, к чему она относится: над таблицей, над формой.",
      "Для ошибки операции дайте действие «Повторить»; не больше двух действий.",
      "Внутри Dialog плашку кладите между телом и подвалом (так в макете: ошибка формы).",
    ],
    avoid: [
      "Плашку без текста или только цветом.",
      "Автоисчезновение: сообщение, которое пропало само, для этого есть Toast.",
      "Несколько плашек одного тона подряд: объедините в одну.",
      "Крестик у ошибки, которую нужно исправить: закрытие скроет проблему.",
      "Alert поверх контента: плашка сдвигает содержимое, а не перекрывает.",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: "role=alert и role=status",
      text: 'В макете у всех плашек role="alert". Предложение: err и warn — role="alert" (прервёт чтение), ok, info, neutral — role="status" (polite). [TODO] подтвердить, макет различия не делает. Плашка, которая есть на странице при загрузке, роль не объявляет: объявление срабатывает только на появление после загрузки.',
    },
    {
      kind: "key",
      title: "Tab, Enter, Space",
      text: "Действия и крестик в порядке Tab, активируются Enter и Space. Alert сам не фокусируется.",
    },
    {
      kind: "aria",
      title: "Крестик",
      text: 'aria-label="Закрыть"; иконка aria-hidden. После схлопывания узел остаётся в DOM на 0,32 с, затем hidden: на время перехода ставят inert, чтобы Tab не заходил в невидимые кнопки.',
    },
    {
      kind: "focus",
      title: "Куда уходит фокус при закрытии",
      text: "[TODO] в макете фокус теряется. Предложение: на следующую плашку (её крестик), если её нет — на элемент, после которого шла область; не на body.",
    },
    {
      kind: "contrast",
      title: "Текст и иконки",
      text: "Заголовок --text на подложке тона: светлая 13,9–14,9:1, тёмная 12,4–13,9:1. Пояснение --text-2: 7,0–7,4:1 и 8,6–9,6:1. Иконки (3:1 для графики): ok 6,2:1, warn 4,5:1, info 4,4:1, err 3,6:1 — выше порога, но смысл иконка не несёт: подпись обязательна.",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Схлопывание и появление мгновенные: плашка исчезает без перехода высоты.",
    },
  ],
  tokens: [
    {
      name: "--selected / --border-selected",
      value: "teal 15 % / teal 60 %",
      usage: "Фон и кольцо accent (по умолчанию)",
      kind: "color",
    },
    {
      name: "--teal / --orange / --danger / --info",
      value: "14 / 16 / 12 / 12 % подложки; кольцо 55 / 55 / 50 / 50 %",
      usage: "Тоны ok · warn · err · info (color-mix с --surface)",
      kind: "color",
    },
    {
      name: "--surface-muted / --border",
      value: "#eceef2 / #c6cdd6",
      usage: "neutral и plain",
      kind: "color",
    },
    {
      name: "--link-strong / --warn-text / --danger / --info",
      value: "#006662 / #b45309 / #d03538 / #2563eb",
      usage: "Цвет иконки по тону",
      kind: "color",
    },
    { name: "--r-item", value: "8 px", usage: "Радиус плашки", kind: "radius" },
    { name: "padding", value: "8 × 10 px, gap 8", usage: "Внутренние отступы", kind: "size" },
    {
      name: "--dur-s / --ease",
      value: "300 мс / cubic-bezier(.6,0,.05,.95)",
      usage: "Схлопывание grid-template-rows",
      kind: "time",
    },
    { name: "--dur", value: "200 мс", usage: "Затухание opacity при закрытии", kind: "time" },
  ],
  choreography: [
    {
      id: "close",
      title: "Закрытие крестиком",
      trigger: "нажатие на «Закрыть»",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Слой под крестиком (hover → active); крестик под курсором.",
          prop: "background",
          easing: "ease",
        },
        {
          at: 0,
          dur: 300,
          what: "Плашка схлопывается: grid-template-rows 1fr → 0fr, высота уходит в ноль, содержимое обрезается.",
          prop: "grid-template-rows",
          easing: "--ease",
        },
        {
          at: 0,
          dur: 200,
          what: "Параллельно затухает прозрачность 1 → 0.",
          prop: "opacity",
          easing: "ease",
        },
        {
          at: 320,
          dur: 0,
          what: "Узел помечается hidden и исчезает из порядка Tab.",
          prop: "hidden",
        },
      ],
      focus:
        "Фокус был на крестике, который исчезает. [TODO] в макете уходит на body; предложение: на следующую плашку или на начало области.",
      reducedMotion: "Высота и прозрачность меняются мгновенно, hidden через кадр.",
      neighbours:
        "Нижние элементы потока подтягиваются вверх синхронно с высотой плашки (один переход), интервал между плашками задаёт padding родителя и схлопывается вместе с ней.",
      demo: <CloseDemo />,
    },
    {
      id: "appear",
      title: "Появление и возврат",
      trigger: "плашка добавлена в поток или кнопка «Вернуть закрытые»",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 300,
          what: "Высота растёт 0fr → 1fr: плашка раскрывается, поток раздвигается.",
          prop: "grid-template-rows",
          easing: "--ease",
        },
        { at: 0, dur: 200, what: "Прозрачность 0 → 1.", prop: "opacity", easing: "ease" },
        {
          at: 300,
          dur: 0,
          what: "Объявление: скринридер читает role=alert/status. [TODO] у плашек, вставленных первым кадром при загрузке страницы, анимацию не включать.",
          prop: "—",
        },
      ],
      focus:
        "Фокус не отнимается: плашка не получает фокус. Если сообщение блокирует работу, переведите фокус на неё программно (tabindex=-1).",
      reducedMotion: "Мгновенно, без перехода.",
      neighbours:
        "Содержимое ниже сдвигается вниз на высоту плашки; чтобы не прыгал заголовок страницы, резервируйте место, если плашка появляется после загрузки данных.",
      demo: <DismissList />,
    },
    {
      id: "retry",
      title: "Действие «Повторить» и смена тона",
      trigger: "нажатие на действие в err-плашке",
      origin: "proposal",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Кнопка получает aria-busy и Spinner, подпись «Повторяем»; плашка остаётся.",
          prop: "—",
        },
        {
          at: 1500,
          dur: 125,
          what: "Пришёл ответ: тон меняется на ok, иконка и текст заменяются; фон и кольцо идут переходом.",
          prop: "background, box-shadow",
          easing: "ease",
        },
      ],
      focus:
        "Кнопка не disabled, фокус остаётся на ней; если плашка заменена целиком, фокус переносится на её заголовок (tabindex=-1).",
      reducedMotion: "Смена цветов мгновенная.",
      neighbours:
        "Высота stacked-плашки может измениться: резервируйте место или схлопывайте через общий переход.",
      demo: <RetryDemo />,
    },
  ],
  examples: [
    {
      id: "inline",
      title: "Статус над таблицей",
      demo: (
        <div style={W}>
          <DemoAlert
            tone="warn"
            title="Нет накладной."
            hint="Сверка по весу недоступна."
            actions={[{ text: "Загрузить" }]}
            onClose={() => undefined}
          />
        </div>
      ),
      code: `<Alert tone="warn" title="Нет накладной." hint="Сверка по весу недоступна."
  actions={<Button size="sm" onClick={upload}>Загрузить</Button>} onClose={hide} />`,
    },
    {
      id: "stacked",
      title: "Ошибка отправки",
      demo: (
        <div style={W}>
          <DemoAlert
            tone="err"
            layout="stacked"
            title="Не удалось отправить декларацию"
            hint="Таможенное ПО вернуло ошибку 502. Данные не потеряны."
            actions={[{ text: "Повторить", variant: "destructive" }, { text: "Подробнее" }]}
          />
        </div>
      ),
      code: `<Alert tone="err" layout="stacked" title="Не удалось отправить декларацию"
  hint="…" actions={<Button size="sm" variant="destructive">Повторить</Button>} />`,
    },
  ],
});
