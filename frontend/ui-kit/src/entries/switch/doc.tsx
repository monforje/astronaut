/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
/* oxlint-disable jsx-a11y/label-has-associated-control -- label оборачивает DemoXxx, внутри нативный input */
import { Marks } from "@/engine/Callout";
import { Playback } from "@/engine/Playback";
import { defineDoc, type StateSpec } from "@/engine/types";
import {
  DemoSwitch,
  DemoSwitchLabel,
  DemoSwitchList,
  DemoSwitchRow,
  type SwitchForce,
} from "./demo";

const NA = (id: string, kind: StateSpec["kind"], title: string, note: string): StateSpec => ({
  id,
  kind,
  title,
  note,
  notApplicable: true,
});

function FlipDemo() {
  return (
    <Playback<{ on: boolean; f?: SwitchForce }>
      initial={{ on: false }}
      script={[
        { at: 400, set: { f: "hover" } },
        { at: 1000, set: { on: true } },
        { at: 2200, set: { on: false } },
        { at: 3000, set: { f: undefined } },
      ]}
      tail={700}
      render={(s) => (
        <>
          <DemoSwitch checked={s.on} force={s.f} label="Автосверка" />
          <DemoSwitch size="sm" checked={s.on} force={s.f} label="Компактный вид" />
        </>
      )}
    />
  );
}

function KeyDemo() {
  return (
    <Playback<{ on: boolean; f?: SwitchForce }>
      initial={{ on: false }}
      script={[
        { at: 400, set: { f: "focus" } },
        { at: 1300, set: { on: true } },
        { at: 2300, set: { on: false } },
      ]}
      tail={700}
      hint="Tab ставит фокус, Space переключает. Enter переключатель не нажимает (как нативный checkbox)."
      render={(s) => (
        <label className="ds-switch__label">
          <DemoSwitch checked={s.on} force={s.f} />
          Автосверка при загрузке
        </label>
      )}
    />
  );
}

const states: StateSpec[] = [
  {
    id: "default",
    kind: "default",
    title: "Выключен",
    note: "Дорожка ink 24 % на --surface, бегунок слева.",
    demo: <DemoSwitch label="Off" />,
  },
  {
    id: "hover",
    kind: "hover",
    title: "Hover",
    note: "Дорожка темнее: ink 34 % вместо 24 %.",
    forced: true,
    demo: <DemoSwitch force="hover" label="Hover" />,
  },
  {
    id: "active",
    kind: "active",
    title: "Active",
    note: "Отдельного вида нет: нажатие сразу переключает, а hover остаётся под курсором. [TODO] решить, нужен ли слой на время нажатия.",
    notApplicable: true,
  },
  {
    id: "focus",
    kind: "focus",
    title: "Focus",
    note: "Кольцо 2px --focus с отступом 2px вокруг дорожки, только от клавиатуры.",
    forced: true,
    demo: <DemoSwitch force="focus" label="Focus" />,
  },
  {
    id: "on",
    kind: "selected",
    title: "Включён",
    note: "Дорожка --primary (teal), бегунок справа (сдвиг 16 px).",
    demo: <DemoSwitch defaultChecked label="On" />,
  },
  {
    id: "on-hover",
    kind: "hover",
    title: "Hover включённого",
    note: "Дорожка темнее на 9 % (смешение с чёрным в oklch).",
    forced: true,
    demo: <DemoSwitch defaultChecked force="hover" label="Hover on" />,
  },
  {
    id: "disabled",
    kind: "disabled",
    title: "Disabled выключен",
    note: "Дорожка --tone, бегунок --surface с кольцом --divider. Свои цвета, не прозрачность.",
    demo: <DemoSwitch disabled label="Disabled off" />,
  },
  {
    id: "disabled-on",
    kind: "disabled",
    title: "Disabled включён",
    note: "Дорожка teal 30 % на --surface; бегунок справа.",
    demo: <DemoSwitch disabled defaultChecked label="Disabled on" />,
  },
  NA(
    "loading",
    "loading",
    "Loading",
    "Нет в макете: переключатель срабатывает сразу. Если действие идёт на сервер, положение меняется оптимистично, а при ошибке возвращается с Toast. [TODO] подтвердить.",
  ),
  NA(
    "error",
    "error",
    "Error",
    "Нет: у Switch нет неверного положения. Ошибку сохранения показывает Toast, переключатель возвращается назад.",
  ),
  NA("empty", "empty", "Empty", "Нет: у Switch всегда одно из двух положений."),
];

export default defineDoc({
  id: "switch",
  title: "Switch",
  group: "fields",
  cssPrefix: "ds-switch",
  order: 60,
  keywords: [
    "переключатель",
    "тумблер",
    "выключатель",
    "вкл",
    "выкл",
    "настройки",
    "toggle",
    "switch",
    "on off",
    "role=switch",
  ],
  summary:
    "Переключатель «включено / выключено» для настройки. Срабатывает сразу, без кнопки «Сохранить».",
  purpose:
    "Switch лежит в строке настроек: заголовок и пояснение слева, переключатель справа. Положение сразу применяется и сразу действует: «Уведомления о расхождениях», «Автосверка при загрузке». Если выбор нужно подтвердить вместе с другими полями формы, берите Checkbox; если это фильтр или режим рядом с контентом, Toggle.",
  related: ["checkbox", "toggle", "radio"],
  anatomy: {
    demo: (
      <Marks
        items={[
          { n: 1, anchor: ".ds-switch", side: "t" },
          { n: 2, anchor: ".ds-switch__thumb-ref", side: "b" },
          { n: 3, anchor: ".ds-switch__text-ref", side: "b" },
        ]}
      >
        <label className="ds-switch__label">
          <span className="ds-switch__anat">
            <input
              type="checkbox"
              role="switch"
              aria-checked="true"
              className="ds-switch"
              defaultChecked
            />
            <i className="ds-switch__thumb-ref" />
          </span>
          <span className="ds-switch__text-ref">Автосверка</span>
        </label>
      </Marks>
    ),
    parts: [
      {
        name: "Дорожка",
        description:
          "36×20 px (28×16 в sm), радиус pill. Выключена: ink 24 % на --surface; включена: --primary.",
      },
      {
        name: "Бегунок",
        description:
          "Круг 16 px (12 в sm), всегда белый, тень 0 1px 2px. Сдвигается на 16 px (12 в sm); отступ от края 2 px.",
      },
      {
        name: "Подпись",
        description:
          "Справа от дорожки или слева в строке настроек, вместе с пояснением 11 px --text-3. Подпись обязательна: input получает имя из label или aria-label.",
      },
    ],
  },
  variants: [
    {
      id: "settings-row",
      title: "Строка настроек",
      description:
        "Заголовок и пояснение слева, переключатель справа. Строки разделены линией --divider, зазор 16.",
      when: "экран настроек: уведомления, автосверка, экспорт. Основной вид.",
      demo: (
        <DemoSwitchList>
          <DemoSwitchRow
            title="Уведомления о расхождениях"
            hint="Письмо и сообщение в Telegram"
            defaultChecked
          />
          <DemoSwitchRow
            title="Автосверка при загрузке"
            hint="Сравнивать документы сразу после загрузки"
          />
          <DemoSwitchRow title="Экспорт в 1С" hint="Нужны права администратора" disabled />
        </DemoSwitchList>
      ),
    },
    {
      id: "label-right",
      title: "С подписью справа",
      description: "Подпись рядом, зазор 8. Вся подпись нажимаема, как у Checkbox.",
      when: "один параметр в панели, где строка настроек избыточна.",
      demo: (
        <>
          <DemoSwitchLabel defaultChecked>Автосверка</DemoSwitchLabel>
          <DemoSwitchLabel size="sm">Компактный вид</DemoSwitchLabel>
        </>
      ),
    },
  ],
  sizes: [
    {
      id: "md",
      title: "md",
      value: "36×20 px",
      note: "бегунок 16, ход 16",
      demo: <DemoSwitch defaultChecked label="md" />,
    },
    {
      id: "sm",
      title: "sm",
      value: "28×16 px",
      note: "бегунок 12, ход 12",
      demo: <DemoSwitch size="sm" defaultChecked label="sm" />,
    },
  ],
  states,
  stateMatrix: {
    columns: [
      "Выключен",
      "Hover",
      "Focus",
      "Включён",
      "Hover включённого",
      "Disabled",
      "Disabled включён",
    ],
    rows: [
      {
        label: "md",
        cells: [
          <DemoSwitch key="a" label="Off" />,
          <DemoSwitch key="b" force="hover" label="Hover" />,
          <DemoSwitch key="c" force="focus" label="Focus" />,
          <DemoSwitch key="d" defaultChecked label="On" />,
          <DemoSwitch key="e" defaultChecked force="hover" label="Hover on" />,
          <DemoSwitch key="f" disabled label="Disabled" />,
          <DemoSwitch key="g" disabled defaultChecked label="Disabled on" />,
        ],
      },
      {
        label: "sm",
        cells: [
          <DemoSwitch key="a" size="sm" label="Off" />,
          <DemoSwitch key="b" size="sm" force="hover" label="Hover" />,
          <DemoSwitch key="c" size="sm" force="focus" label="Focus" />,
          <DemoSwitch key="d" size="sm" defaultChecked label="On" />,
          <DemoSwitch key="e" size="sm" defaultChecked force="hover" label="Hover on" />,
          <DemoSwitch key="f" size="sm" disabled label="Disabled" />,
          <DemoSwitch key="g" size="sm" disabled defaultChecked label="Disabled on" />,
        ],
      },
    ],
  },
  choreography: [
    {
      id: "flip",
      title: "Переключение",
      trigger: "клик по дорожке или подписи, тап",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Наведение: дорожка темнеет (ink 24 % → 34 %).",
          prop: "background",
          easing: "ease",
        },
        {
          at: 600,
          dur: 125,
          what: "Клик: дорожка меняет цвет к --primary (teal).",
          prop: "background",
          easing: "ease",
        },
        {
          at: 600,
          dur: 200,
          what: "Бегунок едет вправо на 16 px (12 в sm). Обратно при выключении — тем же ходом.",
          prop: "translate",
          easing: "var(--ease) = cubic-bezier(.6,0,.05,.95)",
        },
      ],
      focus:
        "Остаётся на переключателе. Клик по подписи (label) переключает и ставит фокус на input.",
      reducedMotion: "Бегунок и дорожка переключаются мгновенно.",
      neighbours:
        "Не двигаются: размеры не меняются. В строке настроек подпись не реагирует на положение, пояснение остаётся тем же.",
      demo: <FlipDemo />,
    },
    {
      id: "keyboard",
      title: "Клавиатура",
      trigger: "Tab до переключателя, Space",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Tab: кольцо 2px --focus с отступом 2px появляется сразу.",
          prop: "outline",
        },
        {
          at: 900,
          dur: 200,
          what: "Space: бегунок едет, дорожка меняет цвет (125 мс). Повторный Space возвращает назад.",
          prop: "translate, background",
          easing: "var(--ease)",
        },
      ],
      focus:
        "Остаётся на переключателе; Tab идёт к следующему. Кольцо вокруг дорожки, не вокруг строки.",
      reducedMotion: "Бегунок перескакивает, кольцо фокуса остаётся.",
      neighbours: "Строка настроек не меняет высоты, соседние строки не затрагиваются.",
      demo: <KeyDemo />,
    },
  ],
  rules: {
    use: [
      "Настройка, которая действует сразу после переключения.",
      "Строка настроек: заголовок слева, переключатель справа, пояснение мелким текстом.",
      "Подпись описывает функцию («Автосверка»), а не действие («Включить автосверку»).",
      "Недоступную настройку оставляйте в списке с disabled и причиной в пояснении.",
      "При ошибке сохранения верните положение назад и скажите об этом в Toast.",
    ],
    avoid: [
      "Switch в форме, которая отправляется кнопкой: нужен Checkbox.",
      "Выбор из трёх и более вариантов: ToggleGroup или Radio.",
      "Switch без подписи: читателю экрана и пользователю неясно, что он включает.",
      "Один и тот же параметр одновременно Switch и Checkbox на странице.",
      "Менять подпись при переключении («Включено» / «Выключено»).",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: 'role="switch"',
      text: 'Нативный <input type="checkbox" role="switch">: состояние хранит checked, aria-checked ставит браузер. Имя — из label или aria-label.',
    },
    {
      kind: "key",
      title: "Space",
      text: "Переключает. Enter не переключает (как у checkbox). Tab и Shift+Tab ходят по переключателям.",
    },
    {
      kind: "focus",
      title: "Кольцо",
      text: "2px --focus, outline-offset 2px, только :focus-visible. 3,65:1 на белом, 9,34:1 в тёмной.",
    },
    {
      kind: "contrast",
      title: "Дорожка и бегунок",
      text: "Светлая тема: выключенная дорожка на белом 1,7:1, включённая teal 1,85:1, белый бегунок на teal 1,85:1: все ниже 3:1 для границ компонентов. В тёмной: выключенная 2,2:1, включённая 9,3:1, бегунок на ней 1,85:1. Состояние читается и по положению бегунка, но [TODO] усилить дорожку или добавить обводку.",
    },
    {
      kind: "contrast",
      title: "Подпись",
      text: "Заголовок --text на --surface 16,5:1; пояснение --text-3 4,9:1 (светлая), 7,6:1 (тёмная). Disabled — --text-ph, вне нормы.",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Ход бегунка и смена цвета дорожки отключаются.",
    },
  ],
  tokens: [
    {
      name: "ink 24 % / 34 % на --surface",
      value: "color-mix(--ink, --surface)",
      usage: "Дорожка выключенного / hover",
      kind: "color",
    },
    {
      name: "--primary",
      value: "#00d4d0",
      usage: "Дорожка включённого; hover — смесь с чёрным 9 %",
      kind: "color",
    },
    {
      name: "бегунок",
      value: "#fff",
      usage: "Цвет бегунка в обеих темах (константа, не роль)",
      kind: "color",
    },
    {
      name: "--tone / --divider / --surface",
      value: "ink 7 % / #e0e4e9 / #fff",
      usage: "Disabled: дорожка, кольцо и бегунок",
      kind: "color",
    },
    {
      name: "teal 30 % на --surface",
      value: "color-mix(--teal, --surface)",
      usage: "Дорожка disabled включённого",
      kind: "color",
    },
    {
      name: "размеры",
      value: "36×20, бегунок 16 · 28×16, бегунок 12",
      usage: "md · sm",
      kind: "size",
    },
    {
      name: "--focus",
      value: "#00968f (тёмная #00d4d0)",
      usage: "Кольцо 2px, отступ 2px",
      kind: "color",
    },
    { name: "--dur-f", value: "125 мс", usage: "Цвет дорожки", kind: "time" },
    {
      name: "--dur / --ease",
      value: "200 мс / cubic-bezier(.6,0,.05,.95)",
      usage: "Ход бегунка (translate)",
      kind: "ease",
    },
  ],
  examples: [
    {
      id: "settings",
      title: "Настройки уведомлений",
      demo: (
        <DemoSwitchList>
          <DemoSwitchRow
            title="Уведомления о расхождениях"
            hint="Письмо и сообщение в Telegram"
            defaultChecked
          />
          <DemoSwitchRow title="Автосверка при загрузке" hint="Сразу после загрузки документов" />
        </DemoSwitchList>
      ),
      code: `<SettingRow title="Автосверка при загрузке" hint="Сразу после загрузки">
  <Switch checked={auto} onCheckedChange={setAuto} />
</SettingRow>`,
    },
    {
      id: "inline",
      title: "Один параметр с подписью",
      demo: <DemoSwitchLabel defaultChecked>Автосверка</DemoSwitchLabel>,
      code: `<Switch label="Автосверка" checked={auto} onCheckedChange={setAuto} />`,
    },
  ],
});
