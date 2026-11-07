/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Marks } from "@/engine/Callout";
import { Playback } from "@/engine/Playback";
import { defineDoc, type StateSpec } from "@/engine/types";
import { DemoButton } from "../button/demo";
import { DemoSpinner, SpinnerDots, SpinnerInline, SpinnerSlot, type SpinnerSize } from "./demo";

const NA = (id: string, kind: StateSpec["kind"], title: string, note: string): StateSpec => ({
  id,
  kind,
  title,
  note,
  notApplicable: true,
});

const SIZES: [SpinnerSize, string, string][] = [
  ["txt", "text", "1em"],
  ["xs", "xs", "10 px"],
  ["sm", "sm", "14 px"],
  ["md", "md", "16 px"],
  ["lg", "lg", "24 px"],
  ["xl", "xl", "36 px"],
];

function ButtonLoadDemo() {
  return (
    <Playback<{ phase: "idle" | "busy" | "done" }>
      initial={{ phase: "idle" }}
      script={[
        { at: 500, set: { phase: "busy" } },
        { at: 2300, set: { phase: "done" } },
      ]}
      tail={900}
      hint="Кнопка не блокируется атрибутом disabled: фокус остаётся на ней, повторные клики игнорируются."
      render={(s) => (
        <DemoButton
          variant="primary"
          loading={s.phase === "busy"}
          icon={s.phase === "done" ? "ok" : undefined}
        >
          {s.phase === "busy" ? "Сохраняем" : s.phase === "done" ? "Сохранено" : "Сохранить"}
        </DemoButton>
      )}
    />
  );
}

function SlotDemo() {
  return (
    <Playback<{ busy: boolean }>
      initial={{ busy: false }}
      script={[
        { at: 400, set: { busy: true } },
        { at: 2600, set: { busy: false } },
      ]}
      tail={800}
      render={(s) => (
        <SpinnerSlot busy={s.busy}>
          {s.busy ? "Загружаем документы…" : "Документы загружены"}
        </SpinnerSlot>
      )}
    />
  );
}

export default defineDoc({
  id: "spinner",
  title: "Spinner",
  group: "feedback",
  cssPrefix: "ds-spinner",
  order: 30,
  keywords: [
    "спиннер",
    "загрузка",
    "ожидание",
    "индикатор",
    "крутилка",
    "прелоадер",
    "точки",
    "spinner",
    "loading",
    "loader",
    "busy",
    "progress ring",
    "dots",
  ],
  summary:
    "Кольцо с четвертью дуги: индикатор ожидания неопределённой длины в кнопке, строке или поле. Шесть размеров, цвет берёт у текста.",
  purpose:
    "Спиннер говорит «операция идёт, результат будет», но не сколько осталось. Он мал и живёт рядом с тем, что запустило операцию: в кнопке, в строке «Загружаем документы…», над блоком. Когда нужен процент — Progress, когда ждёт целая область или страница — Loader. Анимации знака агента и логотипа для ожидания — только из brand/animated (см. Loader); спиннер — служебный знак, не бренд.",
  related: ["loader", "progress", "button", "toast"],
  anatomy: {
    demo: (
      <Marks
        items={[
          { n: 1, anchor: ".ds-spinner", side: "l" },
          { n: 2, anchor: ".ds-spinner__label", side: "r" },
          { n: 3, anchor: ".ds-spinner-dots", side: "r" },
        ]}
      >
        <span
          style={{
            display: "inline-flex",
            flexDirection: "column",
            gap: 16,
            padding: "0 24px",
          }}
        >
          <SpinnerInline>
            <span className="ds-spinner__label">Загружаем документы…</span>
          </SpinnerInline>
          <SpinnerDots>Агент думает</SpinnerDots>
        </span>
      </Marks>
    ),
    parts: [
      {
        name: "Кольцо",
        description:
          "Коническая заливка: 27 % окружности — цвет текста, остальное — тот же цвет на 22 %. Вырез по радиусу делает толщину (2 px, у xs 1,5, у lg 2,5, у xl 3).",
      },
      {
        name: "Подпись",
        description:
          "Слово рядом: «Загружаем документы…». Подпись — это то, что услышит скринридер; без неё спиннер безымянный.",
        optional: true,
      },
      {
        name: "Три точки",
        description:
          "Вариант без кольца для «Агент думает»: три точки по 6 px мигают по очереди со сдвигом 0,15 с.",
        optional: true,
      },
    ],
  },
  variants: [
    {
      id: "ring",
      title: "Кольцо",
      description: "Основной знак. Цвет — цвет текста вокруг.",
      when: "операция в кнопке, поле, строке, над блоком.",
      demo: (
        <>
          <DemoSpinner size="lg" />
          <DemoSpinner size="lg" tone="accent" />
          <DemoSpinner size="lg" tone="warn" />
          <DemoSpinner size="lg" tone="err" />
        </>
      ),
    },
    {
      id: "inline",
      title: "С подписью",
      description: "Кольцо 14 px и фраза цветом --text-2.",
      when: "строка состояния: «Загружаем документы…», «Проверяем подключение…».",
      demo: <SpinnerInline>Загружаем документы…</SpinnerInline>,
    },
    {
      id: "dots",
      title: "Три точки",
      description: "Мигающие точки после слова.",
      when: "ответ агента: «Агент думает», где вращение лишнее.",
      demo: <SpinnerDots>Агент думает</SpinnerDots>,
    },
    {
      id: "in-button",
      title: "В кнопке",
      description: "Заменяет значок слева. Подпись глагола в настоящем времени: «Сохраняем».",
      when: "действие, которое выполняется дольше секунды.",
      demo: (
        <>
          <DemoButton variant="primary" loading>
            Сохраняем
          </DemoButton>
          <DemoButton variant="outline" loading>
            Ждём
          </DemoButton>
          <DemoButton variant="ghost" size="sm" loading>
            Проверяем
          </DemoButton>
        </>
      ),
    },
  ],
  sizes: SIZES.map(([id, title, value]) => ({
    id,
    title,
    value,
    note:
      id === "txt"
        ? "в тексте, высота строки"
        : id === "sm"
          ? "по умолчанию, в кнопке md"
          : id === "xl"
            ? "над затемнённым блоком"
            : undefined,
    demo: <DemoSpinner size={id as SpinnerSize} />,
  })),
  states: [
    {
      id: "default",
      kind: "loading",
      title: "Крутится",
      note: "Единственное состояние: оборот за 0,8 с, линейно, бесконечно.",
      demo: <DemoSpinner size="lg" />,
    },
    {
      id: "tone",
      kind: "other",
      title: "Цвет по смыслу",
      note: "Акцент (--link) для основной операции, warn при повторной попытке, err не используют: ошибка — это уже не ожидание.",
      demo: (
        <>
          <DemoSpinner size="lg" tone="accent" />
          <DemoSpinner size="lg" tone="warn" />
        </>
      ),
    },
    NA(
      "hover",
      "hover",
      "Hover",
      "Не интерактивен. Кнопка со спиннером не реагирует на hover (aria-busy).",
    ),
    NA("active", "active", "Active", "Не интерактивен."),
    NA(
      "focus",
      "focus",
      "Focus",
      "Не в порядке Tab. Фокус остаётся на кнопке или поле, которое запустило операцию.",
    ),
    NA(
      "disabled",
      "disabled",
      "Disabled",
      "Нет. Недоступность выражает родитель; спиннер есть или его нет.",
    ),
    NA(
      "error",
      "error",
      "Error",
      "Операция упала — спиннер заменяют на сообщение (Alert, Toast), а не перекрашивают.",
    ),
    NA("empty", "empty", "Empty", "Нет. Пустое ожидание — это отсутствие спиннера."),
  ],
  rules: {
    use: [
      "Ставьте спиннер рядом с тем, что запустило операцию: в кнопке, а не посреди экрана.",
      "Кнопке при ожидании — aria-busy и спиннер вместо значка; ширина остаётся прежней или растёт на подпись.",
      "Подпись в настоящем времени: «Сохраняем», «Проверяем».",
      "Если известен процент или число шагов, берите Progress.",
      "Для области или страницы берите Loader с подписью.",
    ],
    avoid: [
      "Спиннер размером больше lg внутри кнопки или строки.",
      "Несколько спиннеров в одном блоке: один на операцию, остальное — Skeleton.",
      "Вечное вращение без выхода: после 10 секунд скажите, что происходит (Toast или Alert).",
      "Красный спиннер: цвет ошибки не для ожидания.",
      "Спиннер вместо результата: по окончании покажите итог (значок ✓, тост), а не просто уберите кольцо.",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: "role=status и подпись",
      text: 'Одинокий спиннер: role="status" и aria-label ("Загрузка"). Внутри кнопки или строки с текстом он aria-hidden, а родителю ставят aria-busy="true".',
    },
    {
      kind: "aria",
      title: "aria-live",
      text: 'Результат объявляют отдельно: когда операция закончилась, текст «Сохранено» появляется в области aria-live="polite" или тосте role="status". Исчезновение спиннера скринридер не озвучит.',
    },
    {
      kind: "focus",
      title: "Фокус",
      text: "Спиннер не получает фокус и не забирает его. Кнопка сохраняет фокус при aria-busy (не disabled), иначе фокус потеряется при блокировке.",
    },
    {
      kind: "contrast",
      title: "Кольцо на фоне",
      text: "Светлая тема на белом: --text-3 4,9:1, акцент --link 4,9:1, warn 5,0:1, danger 4,9:1. Тёмная: --link (teal) 9,3:1, warn 9,6:1, danger 6,2:1. Тусклая часть кольца (22 %) — декоративная.",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Вращение не убирают совсем (иначе «ничего не происходит»), а замедляют до 3 с на оборот. Точки перестают мигать и стоят полупрозрачными.",
    },
  ],
  tokens: [
    {
      name: "currentColor",
      value: "цвет текста контекста",
      usage: "Цвет кольца и точек",
      kind: "color",
    },
    {
      name: "--link",
      value: "#007f7a (тёмная #00d4d0)",
      usage: "Акцентный спиннер",
      kind: "color",
    },
    {
      name: "--warn-text",
      value: "#b45309 (тёмная #ffb067)",
      usage: "Спиннер warn",
      kind: "color",
    },
    {
      name: "--danger",
      value: "#d03538 (тёмная #ff6b6b)",
      usage: "Спиннер err (не рекомендуется)",
      kind: "color",
    },
    {
      name: "size",
      value: "1em · 10 · 14 · 16 · 24 · 36 px",
      usage: "txt · xs · sm · md · lg · xl",
      kind: "size",
    },
    {
      name: "--ds-spinner-sw",
      value: "1,5 · 2 · 2,5 · 3 px",
      usage: "Толщина кольца (по размеру)",
      kind: "size",
    },
    {
      name: "spin",
      value: "0,8 с, linear, бесконечно",
      usage: "Оборот; при «замедлении» растягивается через --slow",
      kind: "time",
    },
    { name: "dots", value: "1 с, сдвиг 0,15 с", usage: "Три точки", kind: "time" },
  ],
  choreography: [
    {
      id: "in-button",
      title: "Кнопка: ожидание и результат",
      trigger: "нажатие на кнопку, операция длится дольше секунды",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Значок слева заменяется спиннером 14 px, ширина кнопки подстраивается; кнопка получает aria-busy, hover и active у неё отключены.",
          prop: "—",
        },
        {
          at: 0,
          dur: 800,
          what: "Кольцо крутится: полный оборот за 0,8 с, без остановок.",
          prop: "rotate",
          easing: "linear",
        },
        {
          at: 1800,
          dur: 125,
          what: "Операция закончилась: спиннер уходит, подпись меняется на результат, слева появляется ✓. Цвет кнопки не меняется.",
          prop: "background (возврат слоя)",
          easing: "ease",
        },
      ],
      focus: "Фокус остаётся на кнопке всё время: она не disabled. Повторное нажатие игнорируется.",
      reducedMotion: "Оборот замедляется до 3 с; появление и смена подписи мгновенные.",
      neighbours:
        "Соседние кнопки группы не двигаются, если подпись не стала длиннее: при смене слов ширину задают заранее (min-width).",
      demo: <ButtonLoadDemo />,
    },
    {
      id: "inline",
      title: "Строка: показать, убрать",
      trigger: "запрос ушёл / ответ пришёл",
      origin: "proposal",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Спиннер и подпись появляются сразу. [TODO] если ответ короче 300 мс, спиннер не показывать вовсе (антимерцание): в макете такой задержки нет.",
          prop: "—",
        },
        { at: 0, dur: 800, what: "Вращение 0,8 с линейно.", prop: "rotate", easing: "linear" },
        { at: 2200, dur: 0, what: "Спиннер убирается, подпись заменяется итогом.", prop: "—" },
      ],
      focus:
        "Не затрагивается. Если операция запущена с клавиатуры, фокус остаётся на запустившем элементе.",
      reducedMotion: "Оборот 3 с.",
      neighbours: "Рамка держит минимальную высоту 32 px, соседи не прыгают при смене содержимого.",
      demo: <SlotDemo />,
    },
  ],
  examples: [
    {
      id: "button",
      title: "Кнопка в процессе",
      demo: (
        <DemoButton variant="primary" loading>
          Сохраняем
        </DemoButton>
      ),
      code: "<Button loading>Сохраняем</Button>  // aria-busy, не disabled",
    },
    {
      id: "inline",
      title: "Строка состояния",
      demo: <SpinnerInline>Проверяем подключение…</SpinnerInline>,
      code: "<SpinnerInline>Проверяем подключение…</SpinnerInline>",
    },
  ],
});
