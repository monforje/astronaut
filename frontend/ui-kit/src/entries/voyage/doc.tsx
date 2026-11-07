/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Marks } from "@/engine/Callout";
import { Playback } from "@/engine/Playback";
import { defineDoc } from "@/engine/types";
import { DemoVoyage, type VoyageStatus } from "./demo";

function AppearDemo() {
  return (
    <Playback<{ p: number }>
      initial={{ p: 0 }}
      script={[{ at: 300, set: { p: 0.64 } }]}
      tail={1400}
      hint="Предложение: при первом показе линия и судно идут от порта отправления до текущей точки за 600 мс."
      render={(s) => <DemoVoyage p={s.p} badges />}
    />
  );
}

function UpdateDemo() {
  return (
    <Playback<{ p: number }>
      initial={{ p: 0.64 }}
      script={[{ at: 600, set: { p: 0.7 } }]}
      tail={1300}
      hint="Пришла новая точка трекинга: судно плавно переезжает, процент меняется сразу."
      render={(s) => <DemoVoyage p={s.p} />}
    />
  );
}

function ArriveDemo() {
  return (
    <Playback<{ p: number; st: VoyageStatus }>
      initial={{ p: 0.9, st: "transit" }}
      script={[{ at: 600, set: { p: 1, st: "arrived" } }]}
      tail={1400}
      hint="Судно доходит до порта: конечная точка закрашивается, статус и бейдж меняются."
      render={(s) => <DemoVoyage p={s.p} status={s.st} badges />}
    />
  );
}

function TipDemo() {
  return (
    <Playback<{ tip: boolean }>
      initial={{ tip: false }}
      script={[
        { at: 500, set: { tip: true } },
        { at: 1900, set: { tip: false } },
      ]}
      tail={600}
      render={(s) => (
        <div style={{ paddingTop: 36, width: "100%" }}>
          <DemoVoyage tip={s.tip} />
        </div>
      )}
    />
  );
}

export default defineDoc({
  id: "voyage",
  title: "Voyage",
  group: "time",
  cssPrefix: "ds-voyage",
  order: 80,
  keywords: [
    "рейс",
    "судно",
    "корабль",
    "прогресс рейса",
    "путь",
    "морской",
    "порт",
    "отправление",
    "прибытие",
    "перевозка",
    "voyage",
    "ship",
    "vessel",
    "route",
    "progress",
    "tracking",
    "shipment",
  ],
  summary:
    "Линия рейса от порта отправления до порта прибытия: пройденная часть teal, судно в текущей точке, под линией порты, даты и процент пути.",
  purpose:
    "Voyage показывает, где сейчас судно, одним взглядом: доля пути, откуда и куда, когда отплыло и когда придёт. Это индикатор прогресса, но не нужно путать его с Progress: у линии есть смысл «порт — порт», судно и даты. Откуда берётся положение судна, в макете не сказано [TODO].",
  related: ["countdown", "progress", "badge", "sla-chip"],
  anatomy: {
    demo: (
      <Marks
        block
        items={[
          { n: 1, anchor: ".ds-voyage__line", side: "t" },
          { n: 2, anchor: ".ds-voyage__done", side: "t" },
          { n: 3, anchor: ".ds-voyage__dot--end", side: "t" },
          { n: 4, anchor: ".ds-voyage__ship", side: "t" },
          { n: 5, anchor: ".ds-voyage__labels", side: "b" },
        ]}
      >
        <DemoVoyage />
      </Marks>
    ),
    parts: [
      { name: "Линия", description: "Тонкая 2 px --divider от точки до точки с отступом 7 px." },
      {
        name: "Пройденная часть",
        description: "Та же линия цветом --teal: ширина (100 % − 14 px) × доля пути.",
      },
      {
        name: "Точки портов",
        description:
          "Круги 12 px. Отправление закрашено teal, прибытие — кольцо --border, закрашивается по приходу.",
      },
      {
        name: "Судно",
        description:
          "Круг 24 px --surface с кольцом teal 2 px и иконкой судна 14 px, сидит на конце пройденной части.",
      },
      {
        name: "Подписи",
        description:
          "Слева порт и «отплытие 04.11», по центру процент и «в пути», справа порт и «прибытие 16.11»; 12 px, порт и процент 600.",
      },
    ],
  },
  variants: [
    {
      id: "transit",
      title: "В пути",
      description: "64 % пути; под линией — статус и время до прибытия бейджами.",
      when: "карточка груза и рейса.",
      demo: <DemoVoyage badges />,
    },
    {
      id: "wait",
      title: "Ожидает отплытия",
      description: "Предложение: линия пунктиром, судно серое в начале, 0 %.",
      demo: <DemoVoyage p={0} status="wait" dep="18.11" arr="30.11" />,
    },
    {
      id: "delay",
      title: "Задержка",
      description: "Предложение: линия и кольцо судна orange, статус «задержка 1 д.», бейдж warn.",
      demo: <DemoVoyage p={0.4} status="delay" badges />,
    },
    {
      id: "arrived",
      title: "Прибыл",
      description: "Предложение: судно в конечной точке, точка прибытия закрашена, бейдж «Прибыл».",
      demo: <DemoVoyage p={1} status="arrived" badges />,
    },
    {
      id: "compact",
      title: "Компактный",
      description: "Предложение: только линия, без подписей — для строки таблицы.",
      demo: <DemoVoyage compact />,
    },
  ],
  states: [
    {
      id: "default",
      kind: "default",
      title: "В пути",
      note: "Teal-линия и судно с кольцом teal.",
      demo: <DemoVoyage compact />,
    },
    {
      id: "hover",
      kind: "hover",
      title: "Hover на судне",
      note: "Предложение: подсказка «MSC Aurora · 64 %». В макете судно не интерактивно.",
      forced: true,
      demo: (
        <div style={{ paddingTop: 36, width: "100%" }}>
          <DemoVoyage compact tip />
        </div>
      ),
    },
    {
      id: "active",
      kind: "active",
      title: "Active",
      note: "Нет. Судно не нажимается; переход к рейсу — отдельная кнопка или ссылка рядом.",
      notApplicable: true,
    },
    {
      id: "focus",
      kind: "focus",
      title: "Focus",
      note: "Предложение: судно в Tab, кольцо --focus 2 px с отступом 3 px, подсказка показывается как при hover.",
      forced: true,
      demo: (
        <div style={{ paddingTop: 36, width: "100%" }}>
          <DemoVoyage compact tip />
        </div>
      ),
    },
    {
      id: "disabled",
      kind: "disabled",
      title: "Ожидает",
      note: "Предложение: рейс не начался — пунктир, судно серое, процент 0.",
      demo: <DemoVoyage p={0} status="wait" compact />,
    },
    {
      id: "loading",
      kind: "loading",
      title: "Loading",
      note: "Предложение: серая полоса 2 px с мерцанием вместо линии.",
      demo: <DemoVoyage state="loading" compact />,
    },
    {
      id: "error",
      kind: "error",
      title: "Error",
      note: "Предложение: нет данных о положении — плашка «Нет данных о рейсе». [TODO] источник данных.",
      demo: <DemoVoyage state="error" />,
    },
    {
      id: "empty",
      kind: "empty",
      title: "Empty",
      note: "Предложение: рейс не назначен — плашка «Рейс не назначен».",
      demo: <DemoVoyage state="empty" />,
    },
  ],
  choreography: [
    {
      id: "appear",
      title: "Первое появление",
      trigger: "карточка рейса отрисована",
      origin: "proposal",
      steps: [
        {
          at: 0,
          dur: 600,
          what: "Пройденная часть растёт от порта отправления до текущей доли, судно едет вместе с её краем.",
          prop: "width, left",
          easing: "--ease",
        },
        {
          at: 0,
          dur: 0,
          what: "Подписи и процент показываются сразу с итоговым значением: цифры не бегут.",
        },
      ],
      focus: "Не затрагивается.",
      reducedMotion: "Линия и судно сразу в итоговой позиции.",
      neighbours:
        "Размер блока резервируется: высота 28 px под линию и ~34 px под подписи. В макете линия рисуется сразу. [TODO] подтвердить анимацию.",
      demo: <AppearDemo />,
    },
    {
      id: "update",
      title: "Новая точка трекинга",
      trigger: "положение судна обновилось",
      origin: "proposal",
      steps: [
        {
          at: 0,
          dur: 600,
          what: "Линия дорастает до новой доли, судно переезжает вместе с краем.",
          prop: "width, left",
          easing: "--ease",
        },
        {
          at: 0,
          dur: 0,
          what: "Процент в подписи меняется сразу. Остаток до прибытия пересчитывается бейджем рядом.",
        },
      ],
      focus:
        "Не затрагивается; обновление не озвучивается скринридеру (прогресс — не live-область).",
      reducedMotion: "Судно перескакивает сразу.",
      neighbours: "Соседний текст не двигается.",
      demo: <UpdateDemo />,
    },
    {
      id: "arrive",
      title: "Прибытие",
      trigger: "судно пришло в порт назначения",
      origin: "proposal",
      steps: [
        {
          at: 0,
          dur: 600,
          what: "Линия доходит до конца, судно встаёт на конечную точку.",
          prop: "width, left",
          easing: "--ease",
        },
        {
          at: 600,
          dur: 200,
          what: "Точка прибытия закрашивается teal, кольцо исчезает.",
          prop: "background, box-shadow",
          easing: "ease",
        },
        {
          at: 600,
          dur: 0,
          what: "Статус «прибыл», бейдж «Прибыл» (ok), счётчик «до прибытия» уходит.",
        },
      ],
      focus: "Не затрагивается. Прибытие объявляется один раз строкой aria-live рядом.",
      reducedMotion: "Всё меняется мгновенно.",
      neighbours: "Бейджи под линией перестраиваются на месте: высота не меняется.",
      demo: <ArriveDemo />,
    },
    {
      id: "tip",
      title: "Подсказка на судне",
      trigger: "курсор или фокус на судне",
      origin: "proposal",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Подсказка проявляется над судном: прозрачность 0→1, масштаб .96→1, сдвиг 4 px.",
          prop: "opacity, scale, translate",
          easing: "--ease",
        },
        { at: 1400, dur: 0, what: "Уход курсора или Esc: подсказка исчезает мгновенно." },
      ],
      focus: "Судно фокусируется (Tab), подсказка по фокусу тоже.",
      reducedMotion: "Подсказка без анимации.",
      neighbours: "Лежит поверх, ничего не двигает.",
      demo: <TipDemo />,
    },
  ],
  rules: {
    use: [
      "Рядом писать порты и даты: линия без них не говорит, откуда и куда.",
      "Процент округлять до целого; 0 % и 100 % показывать только при статусах «ожидает» и «прибыл».",
      "Цвет менять только по статусу: teal в срок, orange при задержке.",
      "Положение судна обновлять плавно, а не прыжком.",
    ],
    avoid: [
      "Показывать процент без статуса: «64 %» может быть чем угодно.",
      "Использовать Voyage как общий Progress: у него есть порты и судно.",
      "Красить линию красным: просрочка — SLA-чип, а не цвет линии.",
      "Писать процент в моноширинном шрифте.",
      "Показывать несколько судов на одной линии: на каждый рейс своя.",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: 'role="progressbar"',
      text: 'Трек — role="progressbar" с aria-valuenow (процент), aria-valuemin/max и aria-valuetext: «MSC Aurora, в пути: Нинбо → Владивосток, 64 %».',
    },
    {
      kind: "aria",
      title: "Не live",
      text: 'Обновление процента не объявляется; важные события (отплыл, задержка, прибыл) — отдельной строкой aria-live="polite".',
    },
    {
      kind: "focus",
      title: "Судно",
      text: "Предложение: судно в Tab, кольцо --focus 2 px; без подсказки судно не фокусируется.",
    },
    {
      kind: "contrast",
      title: "Контраст",
      text: "Линия и точки — не текст, порог 3:1: teal #00d4d0 на белом 1,9:1, поэтому смысл дублируется подписями и процентом. Кольцо --border на белом 1,6:1 [TODO] усилить для «ожидает».",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Рост линии и перемещение судна отключаются, подсказка без анимации.",
    },
  ],
  tokens: [
    {
      name: "track",
      value: "28 px · line 2 px",
      usage: "Высота дорожки и толщина линии; отступ 7 px",
      kind: "size",
    },
    {
      name: "port dot / ship",
      value: "12 px / 24 px",
      usage: "Точки портов и судно (иконка 14 px)",
      kind: "size",
    },
    {
      name: "--teal / --divider",
      value: "#00d4d0 / #e0e4e9",
      usage: "Пройденная и оставшаяся часть",
      kind: "color",
    },
    {
      name: "--orange / --warn-text",
      value: "#f08a24 / #b45309",
      usage: "Задержка (предложение)",
      kind: "color",
    },
    { name: "--link", value: "#007f7a / teal", usage: "Иконка судна", kind: "color" },
    { name: "--shadow-panel", value: "0 1px 3px …", usage: "Тень судна", kind: "shadow" },
    {
      name: "move",
      value: "0.6 с · --ease",
      usage: "Рост линии и ход судна (предложение)",
      kind: "time",
    },
  ],
  examples: [
    {
      id: "card",
      title: "Карточка рейса",
      demo: <DemoVoyage badges />,
      code: `<Voyage from="Нинбо" to="Владивосток" vessel="MSC Aurora" departure="04.11" arrival="16.11" progress={0.64} />`,
    },
  ],
});
