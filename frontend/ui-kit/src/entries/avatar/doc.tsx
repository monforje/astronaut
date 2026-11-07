/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Marks } from "@/engine/Callout";
import { Playback } from "@/engine/Playback";
import { defineDoc, type StateSpec } from "@/engine/types";
import { DemoAvatar, DemoAvatarGroup, tone, type Presence } from "./demo";

const PEOPLE = [
  "Ирина Петрова",
  "Максим Орлов",
  "Дальснаб",
  "Анна Ким",
  "Сергей Волков",
  "Приморье-Опт",
];
const PRESENCE: [Presence, string][] = [
  ["on", "В сети"],
  ["away", "Отошёл"],
  ["busy", "Занят"],
  ["off", "Не в сети"],
];

const NA = (id: string, kind: StateSpec["kind"], title: string, note: string): StateSpec => ({
  id,
  kind,
  title,
  note,
  notApplicable: true,
});

function TipDemo() {
  return (
    <Playback<{ tip: boolean }>
      initial={{ tip: false }}
      script={[
        { at: 400, set: { tip: true } },
        { at: 1800, set: { tip: false } },
      ]}
      tail={500}
      hint="Подсказка с полным именем: аватар показывает только инициалы."
      render={(s) => (
        <span style={{ display: "inline-flex", padding: "44px 40px 4px", position: "relative" }}>
          <span style={{ position: "relative", display: "inline-flex" }}>
            <DemoAvatar size="md" name="Ирина Петрова" tip={s.tip} />
          </span>
        </span>
      )}
    />
  );
}

function PresenceDemo() {
  return (
    <Playback<{ st: Presence }>
      initial={{ st: "off" }}
      script={[
        { at: 400, set: { st: "on" } },
        { at: 1400, set: { st: "away" } },
        { at: 2400, set: { st: "busy" } },
      ]}
      tail={800}
      hint="Предложение для проверки: точка присутствия меняет цвет переходом 125 мс."
      render={(s) => <DemoAvatar size="lg" name="Максим Орлов" status={s.st} />}
    />
  );
}

export default defineDoc({
  id: "avatar",
  title: "Avatar",
  group: "people",
  cssPrefix: "ds-avatar",
  order: 10,
  keywords: [
    "аватар",
    "avatar",
    "человек",
    "person",
    "инициалы",
    "initials",
    "пользователь",
    "user",
    "агент",
    "agent",
    "присутствие",
    "presence",
    "статус онлайн",
    "online",
    "профиль",
    "profile",
    "userpic",
    "юзерпик",
    "организация",
    "контрагент",
  ],
  summary:
    "Круглая метка человека или организации: инициалы на цвете имени. Особые — вы, агент, «ещё N». Размеры от 16 до 56, присутствие, группа.",
  purpose:
    "Аватар помогает узнать автора и исполнителя с первого взгляда, не читая имя. Цвет не выбирают вручную: его даёт хэш имени, поэтому человек выглядит одинаково во всех списках. Фотографий в макете нет, только инициалы. [TODO] решить, будут ли загруженные фото.",
  related: ["avatar-group", "user-chip", "badge", "tooltip", "thread"],
  anatomy: {
    demo: (
      <Marks
        items={[
          { n: 1, anchor: ".ds-avatar", side: "t" },
          { n: 2, anchor: ".ds-avatar__ini", side: "l" },
          { n: 3, anchor: ".ds-avatar__st", side: "r" },
        ]}
      >
        <span className="ds-avatar__anat">
          <DemoAvatar size="xl" name="Ирина Петрова" status="on" />
        </span>
      </Marks>
    ),
    parts: [
      {
        name: "Контейнер",
        description:
          "Круг (радиус 50 %) или скруглённый квадрат (32 %) для организаций. Подложка — тон 24 % на поверхности.",
      },
      {
        name: "Инициалы",
        description:
          "Первые буквы первых двух слов имени, Onest 700, заглавные; «ООО», «АО», «ИП» не считаются. Размер шрифта зависит от диаметра.",
      },
      {
        name: "Индикатор присутствия",
        description:
          "Точка 28 % диаметра (не меньше 7 px) в правом нижнем углу с кольцом цвета поверхности 2px.",
        optional: true,
      },
    ],
  },
  variants: [
    {
      id: "person",
      title: "Человек",
      description:
        "Инициалы текстом, цвет из шести тонов бренда по хэшу имени (сумма кодов символов по модулю 6).",
      when: "автор комментария, исполнитель, участник.",
      demo: (
        <>
          {PEOPLE.slice(0, 4).map((n) => (
            <DemoAvatar key={n} name={n} size="md" />
          ))}
        </>
      ),
    },
    {
      id: "you",
      title: "Вы",
      description: "Teal-заливка и navy-инициалы. Текущий пользователь: в шапке, в меню профиля.",
      when: "только для текущего пользователя.",
      demo: <DemoAvatar kind="you" name="Ирина Петрова" size="md" />,
    },
    {
      id: "agent",
      title: "Агент",
      description:
        "Логотип агента вместо инициалов, без подложки. Вариант логотипа пока выбран первый из четырёх.",
      when: "сообщения агента, метка предложения, пустое состояние чата.",
      demo: (
        <>
          <DemoAvatar kind="agent" size="md" />
          <DemoAvatar kind="agent" size="xl" />
        </>
      ),
    },
    {
      id: "square",
      title: "Организация",
      description: "Скруглённый квадрат: так отличают компанию от человека.",
      when: "контрагент, клиент, подключённый сервис.",
      demo: (
        <>
          <DemoAvatar name="Дальснаб" square size="md" />
          <DemoAvatar name="Приморье-Опт" square size="md" />
        </>
      ),
    },
    {
      id: "more",
      title: "Ещё N",
      description: "Нейтральный круг с «+N» в конце группы, когда участников больше, чем влезает.",
      demo: <DemoAvatar kind="more" count={3} size="md" />,
    },
    {
      id: "muted",
      title: "Неизвестный",
      description: "Нейтральный круг с «?»: имя неизвестно или удалено.",
      demo: <DemoAvatar kind="muted" size="md" label="Неизвестный пользователь" />,
    },
  ],
  sizes: [
    {
      id: "sizes",
      title: "Диаметр",
      value: "16 · 18 · 24 · 32 · 40 · 56",
      note: "xs · sm · (по умолчанию) · md · lg · xl",
      demo: (
        <>
          <DemoAvatar size="xs" />
          <DemoAvatar size="sm" />
          <DemoAvatar />
          <DemoAvatar size="md" />
          <DemoAvatar size="lg" />
          <DemoAvatar size="xl" />
        </>
      ),
    },
    {
      id: "palette",
      title: "Палитра по имени",
      value: "6 тонов",
      note: "teal · orange · blue · violet · pink · green",
      demo: (
        <>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <DemoAvatar key={i} name={`Имя ${i}`} toneIndex={i} size="md" />
          ))}
        </>
      ),
    },
    {
      id: "group",
      title: "AvatarGroup",
      value: "перекрытие 5 · 7 · 9 px",
      note: "кольцо цвета поверхности 2px; последним идёт «+N»",
      demo: (
        <>
          <DemoAvatarGroup>
            {PEOPLE.slice(0, 3).map((n) => (
              <DemoAvatar key={n} name={n} />
            ))}
            <DemoAvatar kind="more" count={4} />
          </DemoAvatarGroup>
          <DemoAvatarGroup>
            {PEOPLE.slice(0, 3).map((n) => (
              <DemoAvatar key={n} name={n} size="md" />
            ))}
            <DemoAvatar kind="more" count={4} size="md" />
          </DemoAvatarGroup>
          <DemoAvatarGroup>
            {PEOPLE.slice(0, 3).map((n) => (
              <DemoAvatar key={n} name={n} size="lg" />
            ))}
          </DemoAvatarGroup>
        </>
      ),
    },
  ],
  extra: [
    {
      id: "presence",
      title: "Присутствие",
      content: (
        <div className="dx-grid dx-grid--states">
          {PRESENCE.map(([st, title]) => (
            <article className="dx-state" key={st}>
              <div className="dx-canvas">
                <DemoAvatar size="lg" name="Максим Орлов" status={st} />
              </div>
              <div className="dx-state__cap">
                <b>{title}</b>
                <small>
                  <code>data-status="{st}"</code>
                </small>
              </div>
            </article>
          ))}
        </div>
      ),
    },
  ],
  states: [
    {
      id: "default",
      kind: "default",
      title: "Обычный",
      note: "Инициалы на подложке тона; курсор обычный.",
      demo: <DemoAvatar size="md" />,
    },
    {
      id: "status",
      kind: "other",
      title: "С присутствием",
      note: "Точка: в сети #22c55e, отошёл #f59e0b, занят --danger, не в сети --text-3.",
      demo: (
        <>
          <DemoAvatar size="md" status="on" />
          <DemoAvatar size="md" status="busy" name="Анна Ким" />
        </>
      ),
    },
    {
      id: "tooltip",
      kind: "hover",
      title: "Hover (подсказка)",
      note: "Сам аватар не меняется. Показывается подсказка с полным именем — компонент Tooltip.",
      forced: true,
      demo: (
        <span style={{ display: "inline-flex", padding: "36px 24px 0", position: "relative" }}>
          <span style={{ position: "relative", display: "inline-flex" }}>
            <DemoAvatar size="md" name="Ирина Петрова" tip />
          </span>
        </span>
      ),
    },
    NA(
      "active",
      "active",
      "Active",
      "Аватар не нажимается. Если открывает профиль, оборачивается в кнопку; состояния даёт кнопка.",
    ),
    NA("focus", "focus", "Focus", "Не в порядке Tab. Внутри кнопки или ссылки кольцо рисует она."),
    NA(
      "disabled",
      "disabled",
      "Disabled",
      "Нет. Неактивного человека показывают присутствием off.",
    ),
    NA("loading", "loading", "Loading", "Нет. Пока автор не загружен — Skeleton круглой формы."),
    NA(
      "error",
      "error",
      "Error",
      "Нет. Удалённого или неизвестного человека показывает вариант «?».",
    ),
    NA("empty", "empty", "Empty", "Нет имени — вариант «?»."),
  ],
  choreography: [
    {
      id: "tip",
      title: "Подсказка с именем",
      trigger: "курсор над аватаром",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Подсказка создаётся сразу, без задержки, и проявляется: прозрачность 0→1, масштаб .96→1, сдвиг на 4 px вниз к месту.",
          prop: "opacity, scale, translate",
          easing: "--ease",
        },
        {
          at: 1400,
          dur: 0,
          what: "Курсор ушёл, нажатие или прокрутка: подсказка удаляется мгновенно, без обратной анимации.",
        },
      ],
      focus:
        "Подсказка от фокуса не показывается: аватар не фокусируется. В кнопке подсказку покажет Tooltip кнопки.",
      reducedMotion:
        "Макет не описывает; ожидается: подсказка появляется без анимации. [TODO] подтвердить вместе со страницей Tooltip.",
      neighbours:
        "В группе наведённый аватар не сдвигается и не поднимается; подсказка лежит поверх соседей и не меняет раскладку.",
      demo: <TipDemo />,
    },
    {
      id: "presence",
      title: "Смена присутствия",
      trigger: "статус человека изменился",
      origin: "proposal",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Точка плавно меняет цвет на новый. Кольцо и размер не меняются.",
          prop: "background",
          easing: "ease",
        },
      ],
      focus:
        "Не затрагивается. Смену статуса озвучивают текстом рядом (aria-label аватара обновляется).",
      reducedMotion: "Цвет меняется мгновенно.",
      neighbours:
        "Не реагируют. [TODO] подтвердить: в макете цвет присутствия задаётся статически.",
      demo: <PresenceDemo />,
    },
  ],
  rules: {
    use: [
      "Рядом с именем автора, исполнителя, участника: аватар узнаётся быстрее текста.",
      "Организации — скруглённый квадрат, люди — круг.",
      "Цвет только по имени (хэш): человек везде одного цвета.",
      "Группа из трёх-четырёх аватаров, дальше «+N» с числом остальных.",
      "Присутствие — только там, где оно что-то значит (участники обсуждения, список команды).",
    ],
    avoid: [
      "Выбирать цвет вручную или менять его между экранами.",
      "Вставлять в аватар длинный текст: больше двух букв не помещается.",
      "Делать аватар кнопкой без обёртки: нажимаемым делает его <button> вокруг.",
      "Показывать присутствие у организаций.",
      "Передавать статус только цветом точки: нужен текст рядом или aria-label.",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: 'role="img" + aria-label',
      text: 'Аватар без видимого имени рядом получает aria-label с полным именем. Если имя рядом читается, аватар скрывают: aria-hidden="true".',
    },
    {
      kind: "aria",
      title: "Присутствие",
      text: "В aria-label добавляют текст статуса («Максим Орлов, в сети»): цвет точки смысл не несёт.",
    },
    {
      kind: "aria",
      title: "Группа",
      text: 'role="group" с aria-label («Участники»); «+N» читается как «ещё N».',
    },
    {
      kind: "key",
      title: "Клавиатура",
      text: "Аватар не интерактивен и в Tab не входит. Интерактивный аватар — это кнопка (см. Button) с aria-label.",
    },
    {
      kind: "contrast",
      title: "Инициалы",
      text: "Светлая тема: от 5,6:1 (teal, orange) до 7,3:1; тёмная: от 7,2:1. Teal-вариант «вы»: navy на teal 7,4:1.",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Переход цвета точки присутствия отключается; у подсказки — см. Tooltip.",
    },
  ],
  tokens: [
    {
      name: "--ds-avatar-c",
      value: "#00b3ae · #f08a24 · #3b82f6 · #8b5cf6 · #ec4899 · #22a35a",
      usage: "Шесть тонов: подложка 24 % на --surface. Индексы 0–5",
      kind: "color",
    },
    {
      name: "--ds-avatar-ct",
      value: "тон + чёрный 45 % (светлая) / + белый 45 % (тёмная)",
      usage: "Цвет инициалов",
      kind: "color",
    },
    { name: "--primary / --on-primary", value: "teal / navy", usage: "Аватар «вы»", kind: "color" },
    {
      name: "--text-3 / --text-2",
      value: "#66727f / #44505d",
      usage: "«+N» и «?»; присутствие off",
      kind: "color",
    },
    {
      name: "--surface",
      value: "#fff / #151b23",
      usage: "Кольцо точки присутствия и группы (2px)",
      kind: "color",
    },
    {
      name: "presence",
      value: "#22c55e · #f59e0b · --danger · --text-3",
      usage: "В сети · отошёл · занят · не в сети",
      kind: "color",
    },
    {
      name: "diameter",
      value: "16 · 18 · 24 · 32 · 40 · 56 px",
      usage: "xs · sm · по умолчанию · md · lg · xl; шрифт 8 · 8 · 10 · 12 · 14 · 19 px",
      kind: "size",
    },
    { name: "radius", value: "50 % / 32 %", usage: "Круг · скруглённый квадрат", kind: "radius" },
    {
      name: "--dur-f / --ease",
      value: "125 мс / cubic-bezier(.6,0,.05,.95)",
      usage: "Подсказка с именем; переход цвета присутствия",
      kind: "time",
    },
  ],
  examples: [
    {
      id: "row",
      title: "Строка человека",
      demo: (
        <>
          <DemoAvatar size="md" name="Ирина Петрова" status="on" />
          <span style={{ display: "grid" }}>
            <b>Ирина Петрова</b>
            <small style={{ color: "var(--text-3)" }}>Оформление · Дальснаб</small>
          </span>
        </>
      ),
      code: `<Avatar name="Ирина Петрова" size="md" status="on" />`,
    },
    {
      id: "group",
      title: "Участники обсуждения",
      demo: (
        <DemoAvatarGroup>
          {PEOPLE.slice(0, 3).map((n) => (
            <DemoAvatar key={n} name={n} />
          ))}
          <DemoAvatar kind="more" count={tone("x") + 2} />
        </DemoAvatarGroup>
      ),
      code: `<AvatarGroup max={3}>
  <Avatar name="Ирина Петрова" /> …
</AvatarGroup>`,
    },
  ],
});
