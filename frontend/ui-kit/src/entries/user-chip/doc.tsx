/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Marks } from "@/engine/Callout";
import { Playback } from "@/engine/Playback";
import { defineDoc, type StateSpec } from "@/engine/types";
import { DemoMention, DemoMentionLine, DemoUserChip } from "./demo";

const NA = (id: string, kind: StateSpec["kind"], title: string, note: string): StateSpec => ({
  id,
  kind,
  title,
  note,
  notApplicable: true,
});

function HoverDemo() {
  return (
    <Playback<{ f?: "hover" | "active" | "focus" }>
      initial={{}}
      script={[
        { at: 400, set: { f: "hover" } },
        { at: 1200, set: { f: "active" } },
        { at: 1500, set: { f: "hover" } },
        { at: 2200, set: { f: "focus" } },
        { at: 3200, set: { f: undefined } },
      ]}
      tail={500}
      render={(s) => <DemoUserChip force={s.f} />}
    />
  );
}

function RemoveDemo() {
  return (
    <Playback<{ n: number; x?: "hover" }>
      initial={{ n: 3 }}
      script={[
        { at: 500, set: { x: "hover" } },
        { at: 1200, set: { n: 2, x: undefined } },
      ]}
      tail={900}
      hint="Предложение: крестик убирает чип сразу; удаление из списка людей подтверждается Toast с «Отменить»."
      render={(s) => (
        <>
          {["Ирина Петрова", "Алексей Крылов", "Мария Новикова"].slice(0, s.n).map((n, i) => (
            <DemoUserChip
              key={n}
              name={n}
              removable
              xForce={i === 2 && s.n === 3 ? s.x : undefined}
            />
          ))}
        </>
      )}
    />
  );
}

function MentionDemo() {
  return (
    <Playback<{ pick: boolean }>
      initial={{ pick: false }}
      script={[{ at: 700, set: { pick: true } }]}
      tail={1200}
      hint="Выбор из списка по «@» заменяет набранное плашкой и ставит пробел. Сам список — в Thread."
      render={(s) => (
        <DemoMentionLine>
          {s.pick ? <DemoMention /> : "@Але"} проверьте, это не вес тары?
        </DemoMentionLine>
      )}
    />
  );
}

export default defineDoc({
  id: "user-chip",
  title: "UserChip",
  group: "people",
  cssPrefix: "ds-uchip",
  order: 30,
  keywords: [
    "чип человека",
    "user chip",
    "упоминание",
    "mention",
    "@",
    "пользователь",
    "user",
    "исполнитель",
    "assignee",
    "ответственный",
    "человек",
    "тег человека",
    "person chip",
    "участник",
    "chip",
    "чип",
  ],
  summary:
    "Пилюля с маленьким аватаром и именем: человек в поле, фильтре, списке исполнителей. В тексте то же имя — плашка-упоминание «@Имя».",
  purpose:
    "Чип нужен там, где человек — значение (исполнитель, фильтр, участник), а не автор сообщения. Упоминание живёт внутри текста комментария и не имеет аватара. Крестик, роль и состояния загрузки и ошибки в макете не нарисованы: они предложены и помечены.",
  related: ["avatar", "avatar-group", "thread", "badge"],
  anatomy: {
    demo: (
      <Marks
        items={[
          { n: 1, anchor: ".ds-uchip__av", side: "tl" },
          { n: 2, anchor: ".ds-uchip__name", side: "t" },
          { n: 3, anchor: ".ds-uchip__role", side: "b" },
          { n: 4, anchor: ".ds-uchip__x", side: "r" },
        ]}
      >
        <span className="ds-uchip__anat">
          <DemoUserChip post="Оформление" removable />
        </span>
      </Marks>
    ),
    parts: [
      {
        name: "Аватар sm",
        description:
          "Круг 18 px с инициалами (см. Avatar) в левом поле 3 px: чип выглядит «надетым» на аватар.",
      },
      {
        name: "Имя",
        description:
          "Onest 600, 12 px. Длинное обрезается многоточием, полное имя — в title и aria-label.",
      },
      {
        name: "Роль",
        description: "Предложение: серый текст 400 после имени. Только когда место позволяет.",
        optional: true,
      },
      {
        name: "Крестик «убрать»",
        description: "Предложение: кнопка 20 px у правого края; отдельная цель клика и фокуса.",
        optional: true,
      },
    ],
  },
  variants: [
    {
      id: "button",
      title: "Нажимаемый",
      description: "Кнопка или ссылка: открывает карточку человека. Hover — слой 4 %.",
      when: "исполнитель в таблице, фильтр «Ответственный».",
      demo: (
        <>
          <DemoUserChip name="Ирина Петрова" />
          <DemoUserChip name="Алексей Крылов" />
          <DemoUserChip name="Мария Новикова" />
        </>
      ),
    },
    {
      id: "static",
      title: "Статичный",
      description: "Просто метка: курсор обычный, hover нет, в Tab не входит.",
      when: "чип внутри уже нажимаемой строки или в отчёте.",
      demo: <DemoUserChip as="static" name="Денис Попов" />,
    },
    {
      id: "org",
      title: "Организация",
      description: "Аватар — скруглённый квадрат, как у Avatar «Организация».",
      demo: <DemoUserChip name="Дальснаб" square />,
    },
    {
      id: "role",
      title: "С ролью",
      description: "Предложение: после имени роль серым.",
      demo: <DemoUserChip post="Брокер" name="Алексей Крылов" as="static" />,
    },
    {
      id: "removable",
      title: "С крестиком",
      description: "Предложение: выбранные значения в многозначном поле; крестик убирает человека.",
      demo: (
        <>
          <DemoUserChip name="Ирина Петрова" removable />
          <DemoUserChip name="Алексей Крылов" removable />
        </>
      ),
    },
    {
      id: "mention",
      title: "Упоминание в тексте",
      description:
        "Плашка без аватара: текст --link-strong на --selected, радиус 4, отступ 0 3 px, шрифт 600. Строчный элемент.",
      when: "внутри комментария после «@».",
      demo: (
        <DemoMentionLine>
          <DemoMention /> проверьте, это не вес тары?
        </DemoMentionLine>
      ),
    },
  ],
  extra: [
    {
      id: "mention-kinds",
      title: "Виды упоминания",
      content: (
        <div className="dx-grid dx-grid--states">
          {[
            { t: "Другой человек", n: <DemoMention /> },
            { t: "Вы (предложение)", n: <DemoMention name="Ирина Петрова" me /> },
            { t: "Удалён (предложение)", n: <DemoMention name="Бывший сотрудник" unknown /> },
          ].map((x) => (
            <article className="dx-state" key={x.t}>
              <div className="dx-canvas">{x.n}</div>
              <div className="dx-state__cap">
                <b>{x.t}</b>
                <small>[TODO] в макете одна плашка для всех</small>
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
      note: "Белая поверхность, рамка 1 px --border, имя --text.",
      demo: <DemoUserChip />,
    },
    {
      id: "hover",
      kind: "hover",
      title: "Hover",
      note: "Слой 4 % поверх поверхности. Только у кнопки и ссылки.",
      forced: true,
      demo: <DemoUserChip force="hover" />,
    },
    {
      id: "active",
      kind: "active",
      title: "Active",
      note: "Слой 7 %.",
      forced: true,
      demo: <DemoUserChip force="active" />,
    },
    {
      id: "focus",
      kind: "focus",
      title: "Focus",
      note: "Кольцо --focus 2 px, отступ 1 px.",
      forced: true,
      demo: <DemoUserChip force="focus" />,
    },
    {
      id: "disabled",
      kind: "disabled",
      title: "Disabled",
      note: "Предложение: текст --text-ph, рамка --divider, аватар 50 %. Нажатие игнорируется.",
      demo: <DemoUserChip disabled />,
    },
    {
      id: "loading",
      kind: "loading",
      title: "Loading",
      note: "Предложение: пилюля с заглушками круга и имени, мигание 1,4 с.",
      demo: <DemoUserChip loading />,
    },
    {
      id: "error",
      kind: "error",
      title: "Error · неизвестный",
      note: "Предложение: человека нет в справочнике. Аватар «?», текст «Неизвестный» цветом --err-text, рамка красная 50 %.",
      demo: <DemoUserChip unknown as="static" />,
    },
    NA(
      "empty",
      "empty",
      "Empty",
      "Нет человека — нет чипа. Пустое поле показывает свой placeholder («Выберите исполнителя»).",
    ),
    {
      id: "x-hover",
      kind: "other",
      title: "Крестик hover",
      note: "Предложение: круг 20 px со слоем 9 %, цвет --text.",
      forced: true,
      demo: <DemoUserChip removable xForce="hover" />,
    },
  ],
  choreography: [
    {
      id: "hover",
      title: "Наведение, нажатие, фокус",
      trigger: "курсор входит, кнопка мыши, Tab",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Hover: фон переходит на слой 4 %.",
          prop: "background-color",
          easing: "ease",
        },
        { at: 800, dur: 125, what: "Active: слой 7 %.", prop: "background-color", easing: "ease" },
        {
          at: 1800,
          dur: 0,
          what: "Focus: кольцо 2 px появляется сразу, без перехода.",
          prop: "outline",
        },
      ],
      focus: "Кольцо только от клавиатуры (:focus-visible); клик мышью кольца не даёт.",
      reducedMotion: "Переходы фона отключены, смена мгновенная.",
      neighbours:
        "Размер и позиция не меняются; чипы в ряду не сдвигаются. В макете у чипа есть только hover (слой 4 %), active и focus добавлены по правилам Button.",
      demo: <HoverDemo />,
    },
    {
      id: "remove",
      title: "Убрать чип",
      trigger: "клик на крестик или Backspace / Delete на фокусированном чипе",
      origin: "proposal",
      steps: [
        { at: 0, dur: 125, what: "Крестик получает слой 9 %.", prop: "background", easing: "ease" },
        {
          at: 700,
          dur: 0,
          what: "Чип исчезает сразу; соседи занимают место без анимации (чип — значение поля, не объект списка).",
        },
        {
          at: 700,
          dur: 0,
          what: "Фокус переходит на предыдущий чип, а если его нет — на поле ввода.",
        },
      ],
      focus: "Фокус не теряется: уходит на соседа слева или на поле.",
      reducedMotion: "Совпадает с обычным поведением: анимации нет.",
      neighbours:
        "Соседи сдвигаются влево; перенос на новую строку возможен. [TODO] подтвердить отсутствие анимации сдвига.",
      demo: <RemoveDemo />,
    },
    {
      id: "mention",
      title: "Вставка упоминания",
      trigger: "выбор человека в списке после «@»",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Набранное «@Але» заменяется на «@Алексей Крылов » с пробелом в конце.",
        },
        { at: 0, dur: 0, what: "Список закрывается, фокус остаётся в поле ввода." },
        {
          at: 0,
          dur: 125,
          what: "[TODO] плашка в тексте появляется после отправки; в поле ввода это обычный текст.",
          prop: "background",
        },
      ],
      focus: "Фокус не покидает поле ввода; курсор стоит после пробела.",
      reducedMotion: "Анимации нет.",
      neighbours: "Текст в поле сдвигается как при обычном вводе.",
      demo: <MentionDemo />,
    },
  ],
  rules: {
    use: [
      "Чип — для человека как значения: исполнитель, фильтр, список участников.",
      "Нажимаемый чип — кнопка или ссылка; статичный — span.",
      "Длинное имя обрезать, полное дать в title и aria-label.",
      "Упоминание — только внутри текста, плашкой, без аватара.",
    ],
    avoid: [
      "Класть в чип больше имени и роли: статус и кнопки уходят в строку человека.",
      "Делать упоминание нажимаемым без ссылки на человека.",
      "Подсвечивать «вы» другим цветом чипа: цвет чипа не несёт смысла.",
      "Использовать чип вместо Badge: у Badge нет аватара и он про статус, не про человека.",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: "Имя для скринридера",
      text: "Аватар внутри чипа скрыт (aria-hidden), имя читается текстом. Крестик: aria-label «Убрать: Ирина Петрова».",
    },
    {
      kind: "key",
      title: "Enter / Space",
      text: "Нажимаемый чип открывает карточку человека. Backspace и Delete на чипе с крестиком убирают его (предложение).",
    },
    {
      kind: "focus",
      title: "Фокус",
      text: "Нажимаемый чип в порядке Tab; у чипа с крестиком в Tab два стопа: сам чип и крестик.",
    },
    {
      kind: "contrast",
      title: "Контраст",
      text: "--text на --surface: светлая 16,5:1, тёмная 16,3:1. Упоминание: --link-strong на --selected не ниже 5,5:1 [TODO] проверить точно по расчёту.",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Переходы фона и мигание заглушек отключаются.",
    },
  ],
  tokens: [
    {
      name: "height",
      value: "26 px",
      usage: "Высота чипа; отступ слева 3 px, справа 10 px",
      kind: "size",
    },
    { name: "--r-pill", value: "999px", usage: "Форма чипа", kind: "radius" },
    {
      name: "--border",
      value: "#c6cdd6 / #4d5b6b",
      usage: "Рамка 1 px (inset box-shadow)",
      kind: "color",
    },
    {
      name: "--layer-1 / --layer-1p",
      value: "ink 4 % / 7 %",
      usage: "Hover и active чипа",
      kind: "color",
    },
    { name: "--selected", value: "teal 15 % на --surface", usage: "Фон упоминания", kind: "color" },
    { name: "--link-strong", value: "#006662 / teal", usage: "Текст упоминания", kind: "color" },
    {
      name: "--highlight",
      value: "orange 45 % на --surface",
      usage: "Упоминание «вас» (предложение)",
      kind: "color",
    },
    {
      name: "--err-text",
      value: "#c92a2a / #ff8d8d",
      usage: "Неизвестный человек (предложение)",
      kind: "color",
    },
    { name: "--dur-f", value: "125 мс", usage: "Переход фона", kind: "time" },
  ],
  examples: [
    {
      id: "assignee",
      title: "Исполнитель груза",
      demo: (
        <>
          <span style={{ color: "var(--text-3)" }}>Ответственный</span>
          <DemoUserChip name="Ирина Петрова" />
        </>
      ),
      code: `<UserChip name="Ирина Петрова" onClick={openProfile} />`,
    },
    {
      id: "text",
      title: "Упоминание в комментарии",
      demo: (
        <DemoMentionLine>
          <DemoMention name="Алексей Крылов" /> проверьте, это не вес тары?
        </DemoMentionLine>
      ),
      code: `<Mention href="/people/u-17">Алексей Крылов</Mention>`,
    },
  ],
});
